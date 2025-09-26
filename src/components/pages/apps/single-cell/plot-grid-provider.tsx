import type { IChildrenProps } from '@/interfaces/children-props'
import type { IPos } from '@/interfaces/pos'
import { BWR_CMAP_V2, getColorMap, type ColorMap } from '@/lib/color/colormap'
import { API_SCRNA_GEX_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { makeNanoIdLen12 } from '@/lib/id'
import { argsort } from '@/lib/math/argsort'
import { findCenter } from '@/lib/math/centroid'
import type { ILim } from '@/lib/math/math'
import { mean } from '@/lib/math/mean'
import { ordered } from '@/lib/math/ordered'
import { range } from '@/lib/math/range'
import { where } from '@/lib/math/where'
import { zeros } from '@/lib/math/zeros'
import { ZScore } from '@/lib/math/zscore'
import { truncate } from '@/lib/text/text'
import { queryClient } from '@/query'
import { produce } from 'immer'
import { createContext, useEffect, useState } from 'react'
import { useUmapSettings } from './single-cell-settings'

export type PlotMode = 'gex' | 'global-gex' | 'clusters'

export interface IGeneSet {
  id: string
  name: string
  genes: IScrnaGene[]
}

export interface IScrnaDataset {
  publicId: string
  name: string
  institution: string
  assembly: string
  cells: number
  species: string
  description: string
}

// interface IScrnaDatasetClusters {
//   publicId: string
//   clusters: IScrnaDBCluster[]
// }

export interface IScrnaGene {
  // ensembl
  geneId: string
  // gene symbol
  geneSymbol: string
}

export interface IScrnaGexGene extends IScrnaGene {
  // pair of (cell index, expression value) so that we can
  // store sparse matrices efficiently and ignore zeros
  gex: [number, number][]
}

export interface IScrnaGexResults {
  dataset: string
  genes: IScrnaGexGene[]
}

export interface IScrnaDBCluster {
  // A unique number identifying the cluster
  clusterId: number
  group: string
  scClass: string
  cells: number
  color: string
}

export interface IScrnaCluster extends IScrnaDBCluster {
  pos: ILim
  show: boolean
  showRoundel: boolean
}

export interface IScrnaSingleCell {
  barcode: string
  //umapX: number
  //umapY: number
  pos: IPos
  clusterId: number
  //scClass: string
  sample: string
}

export interface IScrnaDatasetMetadata {
  publicId: string
  clusters: IScrnaDBCluster[]
  cells: IScrnaSingleCell[]
}

export interface IUmapPlot {
  id: string
  name: string
  mode: PlotMode
  palette: ColorMap
  // optionally restrict to these clusters in
  // a particular plot
  clusters: IScrnaCluster[]

  geneset: IGeneSet
  gex: {
    hue: number[]
    hueOrder: number[]
    //useMean: boolean
    range: ILim
  }
}

export interface IClusterInfo {
  clusters: IScrnaCluster[]
  cdata: number[]
  // cells may not be in the order of cluster, so we
  // can use the index to plot them in the right order
  order: number[]
  //map: Record<number, number>
  //palette: ColorMap
}

export interface IPlotGridStoreProps {
  dataset: IScrnaDataset | null
  gexData: Record<string, number[]> // geneId -> cellIdx -> value
  plots: IUmapPlot[]
  globalGexRange: ILim
  //xdata: number[]
  //ydata: number[]
  points: IPos[]
  clusterInfo: IClusterInfo
  //palette: ColorMap
}

export interface IPlotGridStore extends IPlotGridStoreProps {
  setDataset: (dataset: IScrnaDataset, metadata: IScrnaDatasetMetadata) => void

  //setClusters: (clusters: IScrnaCluster[]) => void
  updatePlot: (plot: IUmapPlot) => void
  setPlots: (plots: IUmapPlot[]) => void
  setClusterInfo: (clusterInfo: IClusterInfo) => void
  setGlobalGexRange: (globalGexRange: ILim) => void
  clear: () => void
}

export interface IPlotGridContext
  extends Omit<IPlotGridStore, 'setGlobalGexRange'> {
  setMode: (mode: PlotMode) => void

  loadGex: (geneSets: IGeneSet[]) => Promise<void>
  setupGexPlot: (
    geneSets: IGeneSet[],
    gexData: Record<string, number[]>
  ) => void
  setPalette: (palette: ColorMap) => void
}

export const PlotGridContext = createContext<IPlotGridContext>({
  setMode: () => {},
  loadGex: async () => {},
  setupGexPlot: () => {},
  setPalette: () => {},
  setDataset: () => {},
  updatePlot: () => {},
  setPlots: () => {},
  setClusterInfo: () => {},
  clear: () => {},
  dataset: null,
  gexData: {},
  plots: [],
  globalGexRange: [0, 0],
  points: [],
  clusterInfo: {
    clusters: [],
    cdata: [],
    order: [],
    //map: {},
  },
})

export function PlotGridProvider({ children }: IChildrenProps) {
  const [store, setStore] = useState<IPlotGridStoreProps>({
    dataset: null,
    plots: [],
    globalGexRange: [0, 1],
    //xdata: [],
    //ydata: [],
    gexData: {},
    points: [],
    clusterInfo: {
      clusters: [],
      cdata: [],
      order: [],
      //map: {},
    },
  })

  const { fetchAccessToken } = useEdbAuth()
  const { settings } = useUmapSettings()

  useEffect(() => {
    loadGex(settings.genesets)
  }, [settings.genesets])

  useEffect(() => {
    setupGexPlots(settings.genesets, store.gexData)
  }, [
    settings.zscore.on,
    settings.cmap,
    settings.grid.on,
    settings.zscore.range[0],
    settings.zscore.range[1],
  ])

  function setDataset(dataset: IScrnaDataset, metadata: IScrnaDatasetMetadata) {
    const points = metadata.cells.map((m) => m.pos)

    const clusters: IScrnaCluster[] = metadata.clusters.map((c) => {
      const idx = where(
        metadata.cells,
        (cell) => cell.clusterId === c.clusterId
      )

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
        id: makeNanoIdLen12(),
        pos,
        show: true,
        showRoundel: true,
      }
    })

    let hue = metadata.cells.map((c) => c.clusterId) //metadata.cells.map(c => normMap[c.clusterId]!)

    // if we sort by hue, we are sorting by color norm and
    // therefore cluster, so all points in a cluster will
    // be drawn at the same z-level
    const idx = argsort(hue)

    const clusterInfo = {
      clusters,
      cdata: metadata.cells.map((c) => c.clusterId),
      order: idx,
      //map: Object.fromEntries(clusters.map((c, ci) => [c.clusterId, ci])),
    }

    console.log('Setting dataset', dataset, metadata, clusterInfo)

    setStore(
      produce(store, (draft) => {
        draft.dataset = dataset
        draft.points = points
        draft.clusterInfo = clusterInfo
        draft.plots = [
          {
            id: makeNanoIdLen12(),
            name: 'Clusters',
            //genes: [],
            mode: 'clusters',
            // show all clusters
            clusters,
            geneset: {
              id: makeNanoIdLen12(),
              name: '',
              genes: [],
            },
            gex: {
              hue: [],
              hueOrder: [],
              range: [0, 1],
            },
            palette: BWR_CMAP_V2,
          },
        ]
      })
    )
  }

  function setMode(mode: PlotMode) {
    setStore(
      produce(store, (draft) => {
        draft.plots = draft.plots.map((p) => ({ ...p, mode }))
      })
    )
  }

  function setPlots(plots: IUmapPlot[]) {
    setStore(
      produce(store, (draft) => {
        draft.plots = plots
      })
    )
  }

  function setClusterInfo(clusterInfo: IClusterInfo) {
    setStore(
      produce(store, (draft) => {
        draft.clusterInfo = clusterInfo
      })
    )
  }

  async function loadGex(genesets: IGeneSet[]) {
    if (store.dataset === null || genesets.length < 1) {
      return
    }

    try {
      const accessToken = await fetchAccessToken()

      if (!accessToken) {
        return
      }

      const genes = genesets
        .map((g) => g.genes.map((gene) => gene.geneId))
        .flat()

      console.log('Loading GEX for', store.dataset.publicId, genes)

      const res = await queryClient.fetchQuery({
        queryKey: ['gex', store.dataset.publicId, genes],
        queryFn: () => {
          return httpFetch.postJson<{ data: IScrnaGexResults }>(
            `${API_SCRNA_GEX_URL}/${store.dataset!.publicId}`,

            {
              headers: bearerHeaders(accessToken),
              body: {
                genes,
              },
            }
          )
        },
      })

      console.log('Got GEX results', res)

      const results: IScrnaGexResults = res.data

      // make some empty arrays to store the gene data
      const gexData = Object.fromEntries(
        genesets
          .map((g) => g.genes)
          .flat()
          .map((g) => [g.geneId, zeros(store.dataset!.cells ?? 0)])
      )

      for (const gene of results.genes) {
        for (const gx of gene.gex) {
          gexData[gene.geneId]![gx[0]!] = gx[1]!
        }
      }

      setStore(
        produce(store, (draft) => {
          draft.gexData = gexData
        })
      )

      setupGexPlots(genesets, gexData)
      //
    } catch (e) {
      console.log('error loading datasets from remote' + e)
    }
  }

  function setupGexPlots(
    genesets: IGeneSet[],
    gexData: Record<string, number[]>
  ) {
    if (
      store.dataset === null ||
      genesets.length === 0 ||
      Object.keys(gexData).length === 0
    ) {
      return
    }

    const plots: IUmapPlot[] = []

    let globalMax = 0

    for (const geneset of genesets) {
      let avg: number[] = []

      const useMean = geneset.genes.length > 1

      if (useMean) {
        avg = range(0, store.dataset.cells ?? 0).map((cellIdx) =>
          mean(geneset.genes.map((gene) => gexData[gene.geneId]![cellIdx]!))
        )
      } else {
        avg = gexData[geneset.genes[0]!.geneId]!
      }

      //console.log(avg)

      //let nz: number[]
      //let plotRange: ILim

      let max = 0

      if (settings.zscore.on) {
        avg = new ZScore().fitTransform(avg)
      }
      //nz = normalize(z, settings.zscore.range) //settings.zscore.range)

      // get max regards of min max
      max = Math.ceil(Math.max(...avg.map((x) => Math.abs(x))))

      if (!settings.zscore.on && max % 2 === 1) {
        max++
      }

      globalMax = Math.max(globalMax, max)

      //nz = normalize(avg, plotRange) // normalize(z, [-3, 3])

      const idx = argsort(avg) //.toReversed()

      plots.push({
        id: makeNanoIdLen12(),
        name: useMean
          ? truncate(
              `Mean of ${geneset.name}: ${geneset.genes.map((g) => g.geneSymbol).join(', ')}`
            )
          : geneset.genes[0]!.geneSymbol,
        geneset,
        mode: settings.gex.useGlobalRange ? 'global-gex' : 'gex',
        clusters: store.clusterInfo.clusters, //.slice(0, 2),
        gex: {
          hueOrder: idx,
          hue: avg,
          range: [0, max],
        },
        palette: getColorMap(settings.cmap),
      })
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

    setStore(
      produce(store, (draft) => {
        draft.plots = [
          ...store.plots,
          ...plots.filter((p) => !store.plots.some((pp) => pp.name === p.name)),
        ]
        draft.globalGexRange = [0, globalMax]
      })
    )
  }

  return (
    <PlotGridContext.Provider
      value={{
        ...store,

        //palette: store.palette,
        setDataset,
        setPlots,
        setClusterInfo,
        setMode,
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
        loadGex,
        setupGexPlot: setupGexPlots,
        clear: () => {
          setStore({
            dataset: null,
            gexData: {},
            plots: [],
            globalGexRange: [-3, 3],
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

export function makeDomain(data: number[]): ILim {
  let min = Math.floor(Math.min(...data))
  let max = Math.ceil(Math.max(...data))

  // add a small buffer to prevent dots being cropped
  min = min % 2 === 0 ? min - 2 : min - 1
  max = max % 2 === 0 ? max + 2 : max + 1

  return [min, max]
}
