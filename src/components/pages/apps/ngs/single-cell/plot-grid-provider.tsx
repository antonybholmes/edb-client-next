import type { IChildrenProps } from '@/interfaces/children-props'
import { type ColorMap } from '@/lib/color/colormap'
//import { API_SCRNA_GEX_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'

import { API_SCRNA_DATASETS_URL } from '@/lib/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { makeUuid } from '@/lib/id'
import { argsort } from '@/lib/math/argsort'
import { findCenter } from '@/lib/math/centroid'
import { mean } from '@/lib/math/mean'
import { ordered } from '@/lib/math/ordered'
import { range } from '@/lib/math/range'
import { where } from '@/lib/math/where'
import { zeros } from '@/lib/math/zeros'
import { ZScore } from '@/lib/math/zscore'
import { truncate } from '@/lib/text/text'
import { queryClient } from '@/qcp'
import { produce } from 'immer'
import { createContext, useEffect, useState } from 'react'
import type {
  IClusterInfo,
  IPlotGridStoreProps,
  IScrnaCluster,
  IScrnaDataset,
  IScrnaDatasetMetadata,
  IScrnaGexResults,
  IUmapPlot,
} from './plot-grid-store'
import { useSingleCellSettings, type IGeneSet } from './single-cell-settings'

export interface IPlotGridContext extends Omit<
  IPlotGridStore,
  'setGlobalGexRange'
> {
  //setMode: (mode: PlotMode) => void

  //loadGex: (dataset: IScrnaDataset | null, plots: IUmapPlot[]) => Promise<void>
  //setupGexPlot: (dataset: IScrnaDataset, plots: IGeneSet[]) => void
  setPalette: (palette: ColorMap) => void
}

export interface IPlotGridStore extends IPlotGridStoreProps {
  setDataset: (dataset: IScrnaDataset, metadata: IScrnaDatasetMetadata) => void

  //setClusters: (clusters: IScrnaCluster[]) => void
  updatePlot: (plot: IUmapPlot) => void
  //setPlots: (plots: IUmapPlot[]) => void
  updateClusterInfo: (clusterInfo: IClusterInfo) => void
  //setGlobalGexRange: (globalGexRange: ILim) => void
  clear: () => void
}

const PlotGridContext = createContext<IPlotGridContext>({
  setPalette: () => {},
  setDataset: () => {},
  updatePlot: () => {},

  updateClusterInfo: () => {},
  clear: () => {},
  dataset: null,

  plots: [],

  points: [],
  clusterInfo: {
    clusters: [],
    cdata: [],
    order: [],
  },
})

export function PlotGridProvider({ children }: IChildrenProps) {
  const [store, setStore] = useState<IPlotGridStoreProps>({
    dataset: null,
    plots: [],
    //globalGexRange: [0, 1],
    //xdata: [],
    //ydata: [],
    //gexData: {},
    points: [],
    clusterInfo: {
      clusters: [],
      cdata: [],
      order: [],
      //map: {},
    },
  })

  const { fetchAccessToken } = useEdbAuth()
  const { settings, updateSettings } = useSingleCellSettings()

  // useEffect(() => {
  //   console.log('Loading GEX for new settings', settings.genesets)
  //   loadGex(store.dataset, settings.genesets)
  // }, [settings.genesets, store.dataset])

  useEffect(() => {
    async function setupGexPlots(dataset: IScrnaDataset, genesets: IGeneSet[]) {
      console.log('Setting up gex plots', genesets)
      if (!dataset || genesets.length === 0) {
        return
      }

      const gexData = await loadGex(store.dataset, genesets)

      if (!gexData) {
        return
      }

      let globalMax = 0

      const clusterMap = new Map<number, IScrnaCluster>(
        store.clusterInfo?.clusters.map((c) => [c.label, c])
      )

      // create a mask for cells that are in shown clusters
      const mask =
        store.clusterInfo?.cdata.map((c) => {
          const cluster = clusterMap.get(c)
          return cluster?.show
        }) || []

      const plots: IUmapPlot[] = []

      for (const geneset of genesets) {
        if (geneset.mode === 'clusters') {
          const plot: IUmapPlot = {
            ...geneset,
            id: makeUuid(),
            name: geneset.name,
            //clusters: store.clusterInfo.clusters, //.slice(0, 2),

            gex: {
              hueOrder: store.clusterInfo?.order || [],
              hue: store.clusterInfo?.cdata || [],
              range: [0, 0],
            },
          }
          plots.push(plot)

          continue
        }

        let avg: number[] = []

        const useMean = geneset.genes.length > 1

        if (useMean) {
          avg = range(0, dataset.cells ?? 0).map((cellIdx) =>
            mean(geneset.genes.map((gene) => gexData[gene.geneId]![cellIdx]!))
          )
        } else {
          avg = gexData[geneset.genes[0]!.geneId]!
        }

        //console.log(avg)

        //let nz: number[]
        //let plotRange: ILim

        let max = 0

        if (settings.gex.log.on) {
          switch (settings.gex.log.mode) {
            case 'log2':
              avg = avg.map((v) => Math.log2(v + 1))
              break
            case 'log10':
              avg = avg.map((v) => Math.log10(v + 1))
              break
            case 'ln':
              avg = avg.map((v) => Math.log1p(v))
              break
          }
        }

        if (settings.gex.zscore.on) {
          avg = new ZScore().fitTransform(avg)
        }
        //nz = normalize(z, settings.zscore.range) //settings.zscore.range)

        // get max regardless of min max using only the visible clusters
        max = Math.ceil(
          Math.max(...avg.filter((_, i) => mask[i]).map((x) => Math.abs(x)))
        )

        // i like even numbers
        if (!settings.gex.zscore.on && max % 2 === 1) {
          max++
        }

        globalMax = Math.max(globalMax, max)

        //nz = normalize(avg, plotRange) // normalize(z, [-3, 3])

        let idx: number[] = []

        if (settings.gex.sortByExpr) {
          // mask out hidden clusters as push to bottom when painting
          const maskedAvg = avg.map((v, i) => (mask[i] ? v : Number.MIN_VALUE))

          // draw lowest exp values first so that higher exp values are on top
          // which makes it easier to see where the high exp values cluster
          idx = argsort(maskedAvg) //.toReversed()
        } else {
          // use the standard cluster order
          idx = store.clusterInfo?.order || []
        }

        const plot: IUmapPlot = {
          ...geneset,
          id: makeUuid(),

          name: useMean
            ? truncate(
                `Mean of ${geneset.name}: ${geneset.genes.map((g) => g.geneSymbol).join(', ')}`
              )
            : geneset.genes[0]!.geneSymbol,

          //clusters: store.clusterInfo.clusters, //.slice(0, 2),
          gex: {
            hueOrder: idx,

            // the expression values for each cell or the average
            // over mutliple genes
            hue: avg,
            range: [0, max],
          },
        }
        plots.push(plot)
      }

      //globalMax = Math.max(globalMax, store.globalGexRange[1]!)
      //nz = ordered(nz, idx)

      // All cached data is kept in the order it arrives
      // from the db. Only at the last step is the xy data
      // sorted to adjust the display
      // sort points so higher z drawn last and on top

      //let xdata = metadata!.cells.map(m => m.umapX)
      //xdata = ordered(xdata, idx)

      //let ydata = metadata!.cells.map(m => m.umapY)
      //ydata = ordered(ydata, idx)

      console.log('Setting up gex plots', store.plots)

      setStore(
        produce(store, (draft) => {
          // replace existing plots of the same name

          // replace exiting plots of the same name and add new ones at the end
          draft.plots = plots

          //draft.globalGexRange = [0, globalMax]
        })
      )

      if (settings.gex.autoRange) {
        console.log('Setting global range to ', [-globalMax, globalMax])
        updateSettings(
          produce(settings, (draft) => {
            if (settings.gex.zscore.on) {
              draft.gex.zscore.range = [-globalMax, globalMax]
            } else {
              draft.gex.range = [0, globalMax]
            }
          })
        )
      }
    }

    if (store.dataset) {
      console.log('Setting up GEX plots due to settings change', settings)
      setupGexPlots(store.dataset, settings.genesets)
    }
  }, [
    settings.gex.zscore.on,
    settings.cmap,
    settings.grid.on,
    settings.gex.zscore.range[0],
    settings.gex.zscore.range[1],
    settings.gex.range[0],
    settings.gex.range[1],
    settings.gex.autoRange,
    settings.genesets,
    store.dataset,
    store.clusterInfo,
  ])

  function setDataset(dataset: IScrnaDataset, metadata: IScrnaDatasetMetadata) {
    const points = metadata.cells.map((m) => ({ x: m.x, y: m.y }))

    const clusters: IScrnaCluster[] = metadata.clusters.map((c) => {
      const idx = where(metadata.cells, (cell) => cell.cluster === c.label)

      const xc = ordered(
        points.map((p) => p.x),
        idx
      )
      const yc = ordered(
        points.map((p) => p.y),
        idx
      )
      const pos = findCenter(xc, yc)

      // add extended properties
      return {
        ...c,
        pos,
        show: true,
        display: {
          label: {
            show: true,
            roundel: { show: true },
          },
        },
        //showRoundel: true,
      }
    })

    console.log(clusters)

    let hue = metadata.cells.map((c) => c.cluster) //metadata.cells.map(c => normMap[c.clusterId]!)

    // if we sort by hue, we are sorting by color norm and
    // therefore cluster, so all points in a cluster will
    // be drawn at the same z-level
    const idx = argsort(hue)

    const clusterInfo = {
      clusters,
      cdata: metadata.cells.map((c) => c.cluster),
      order: idx,
      //map: Object.fromEntries(clusters.map((c, ci) => [c.clusterId, ci])),
      roundel: { show: true },
    }

    console.log('Setting dataset', dataset, metadata, clusterInfo)

    setStore(
      produce(store, (draft) => {
        draft.dataset = dataset
        draft.points = points
        draft.clusterInfo = clusterInfo
        draft.plots = []
      })
    )

    //console.log('Loading GEX for new dataset', settings.genesets)
    //loadGex(settings.genesets)
  }

  // function setMode(mode: PlotMode) {
  //   // setStore(
  //   //   produce(store, draft => {
  //   //     draft.plots = draft.plots.map(p => ({ ...p, mode }))
  //   //   })
  //   // )
  // }

  // function setPlots(plots: IUmapPlot[]) {
  //   setStore(
  //     produce(store, draft => {
  //       draft.plots = plots
  //     })
  //   )
  // }

  function updateClusterInfo(clusterInfo: IClusterInfo) {
    setStore(
      produce(store, (draft) => {
        draft.clusterInfo = clusterInfo
      })
    )
  }

  async function loadGex(dataset: IScrnaDataset | null, genesets: IGeneSet[]) {
    console.log('Loading GEX for', genesets, dataset)
    if (!dataset || genesets.length === 0) {
      return
    }

    const accessToken = await fetchAccessToken()

    if (!accessToken) {
      return
    }

    const genes = genesets
      .filter((g) => g.mode !== 'clusters')
      .map((g) => g.genes.map((gene) => gene.geneId))
      .flat()

    console.log('Loading GEX for', dataset.id, genes)

    const res = await queryClient.fetchQuery({
      queryKey: ['gex', dataset.id, genes],
      queryFn: () => {
        return httpFetch.postJson<{ data: IScrnaGexResults }>(
          `${API_SCRNA_DATASETS_URL}/${store.dataset!.id}/gex`,

          {
            headers: bearerHeaders(accessToken),
            body: {
              genes,
            },
          }
        )
      },
    })

    const results: IScrnaGexResults = res.data

    // make some empty arrays to store the gene data
    const gexData = Object.fromEntries(
      genesets
        .filter((g) => g.mode !== 'clusters')
        .map((g) => g.genes)
        .flat()
        .map((g) => [g.geneId, zeros(store.dataset!.cells ?? 0)])
    )

    for (const gene of results.genes) {
      for (const [i, idx] of gene.indexes.entries()) {
        gexData[gene.geneId]![idx] = gene.gex[i]!
      }
    }

    // setStore(
    //   produce(store, draft => {
    //     draft.gexData = gexData
    //   })
    // )

    return gexData

    //setupGexPlots(genesets, gexData)
    //
  }

  return (
    <PlotGridContext.Provider
      value={{
        ...store,

        //palette: store.palette,
        setDataset,
        //setPlots,
        updateClusterInfo,
        //setMode,
        setPalette: (palette: ColorMap) => {
          setStore(
            produce(store, (draft) => {
              draft.plots = draft.plots.map((p) => ({
                ...p,
                palette,
              }))
            })
          )
        },
        updatePlot: (plot: IUmapPlot) => {
          setStore(
            produce(store, (draft) => {
              const idx = draft.plots.findIndex((p) => p.id === plot.id)
              if (idx !== -1) {
                draft.plots[idx] = plot
              }
            })
          )
        },
        //loadGex,
        //setupGexPlot,
        clear: () => {
          setStore({
            dataset: null,
            //gexData: {},
            plots: [],
            //globalGexRange: [-3, 3],
            //xdata: [],
            //ydata: [],
            points: [],
            clusterInfo: {
              clusters: [],
              cdata: [],
              order: [],

              //map: {},
            },
          })
        },
      }}
    >
      {children}
    </PlotGridContext.Provider>
  )
}
