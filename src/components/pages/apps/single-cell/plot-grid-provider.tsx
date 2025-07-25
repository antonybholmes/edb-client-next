import type { IChildrenProps } from '@/interfaces/children-props'
import type { IPos } from '@/interfaces/pos'
import { BWR_CMAP_V2, type ColorMap } from '@/lib/color/colormap'
import { API_SCRNA_GEX_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { argsort } from '@/lib/math/argsort'
import type { ILim } from '@/lib/math/math'
import { mean } from '@/lib/math/mean'
import { range } from '@/lib/math/range'
import { zeros } from '@/lib/math/zeros'
import { ZScore } from '@/lib/math/zscore'
import { truncate } from '@/lib/text/text'
import { nanoid } from '@/lib/utils'
import { queryClient } from '@/query'
import { produce } from 'immer'
import { createContext, useState } from 'react'
import { useUmapSettings } from './single-cell-settings'

export type PlotMode = 'gex' | 'global-gex' | 'clusters'

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

export interface IBasePlot {
  id: string
  mode: PlotMode
  genes: IScrnaGene[]
}

export interface IUmapPlot extends IBasePlot {
  title: string
  //mode: PlotMode
  clusters: IScrnaCluster[]
  palette: ColorMap
  gex: {
    hue: number[]
    hueOrder: number[]
    //useGlobal: boolean
    useMean: boolean
    range: ILim
  }
}

export interface IClusterInfo {
  clusters: IScrnaCluster[]
  cdata: number[]
  order: number[]
  //map: Record<number, number>
  //palette: ColorMap
}

export interface IPlotGridStoreProps {
  plots: IUmapPlot[]
  globalGexRange: ILim
  //xdata: number[]
  //ydata: number[]
  points: IPos[]
  clusterInfo: IClusterInfo
  //palette: ColorMap
}

export interface IPlotGridStore extends IPlotGridStoreProps {
  set: (state: IPlotGridStoreProps) => void

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
  loadGex: (dataset: IScrnaDataset, geneSets: IScrnaGene[][]) => Promise<void>
  setupGexPlot: (
    dataset: IScrnaDataset,
    geneSets: IScrnaGene[][],
    gexData: Record<string, number[]>
  ) => void
  setPalette: (palette: ColorMap) => void
}

export const PlotGridContext = createContext<IPlotGridContext>({
  setMode: () => {},
  loadGex: async () => {},
  setupGexPlot: () => {},
  setPalette: () => {},
  set: () => {},
  updatePlot: () => {},
  setPlots: () => {},
  setClusterInfo: () => {},

  clear: () => {},
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

  const { fetchAccessToken } = useEdbAuth()
  const { settings } = useUmapSettings()

  function setMode(mode: PlotMode) {
    setStore(
      produce(store, (draft) => {
        draft.plots = draft.plots.map((p) => ({ ...p, mode }))
      })
    )
  }

  function setPlots(plots: IUmapPlot[]) {
    console.log('setPlots', plots.length)
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

  async function loadGex(dataset: IScrnaDataset, geneSets: IScrnaGene[][]) {
    try {
      const accessToken = await fetchAccessToken()

      if (!accessToken) {
        return
      }

      if (settings.geneSets.length < 1) {
        return
      }

      const res = await queryClient.fetchQuery({
        queryKey: [
          'gex',
          dataset.publicId,
          geneSets
            .flat()
            .map((g) => g.geneId)
            .join(','),
        ],
        queryFn: () => {
          return httpFetch.postJson<{ data: IScrnaGexResults }>(
            `${API_SCRNA_GEX_URL}/${dataset.publicId}`,

            {
              headers: bearerHeaders(accessToken),
              body: {
                genes: geneSets.flat().map((g) => g.geneId),
              },
            }
          )
        },
      })

      const results: IScrnaGexResults = res.data

      // make some empty arrays to store the gene data
      const gexData = Object.fromEntries(
        geneSets.flat().map((g) => [g.geneId, zeros(dataset.cells ?? 0)])
      )

      for (const gene of results.genes) {
        for (const gx of gene.gex) {
          gexData[gene.geneId]![gx[0]!] = gx[1]!
        }
      }

      console.log('waht foold', gexData)

      setupGexPlot(dataset, geneSets, gexData)
      //
    } catch (e) {
      console.error('error loading datasets from remote' + e)
    }
  }

  function setupGexPlot(
    dataset: IScrnaDataset,
    geneSets: IScrnaGene[][],
    gexData: Record<string, number[]>
  ) {
    if (settings.geneSets.length === 0 || Object.keys(gexData).length === 0) {
      return
    }

    const plots: IUmapPlot[] = []

    let globalMax = 0

    for (const genes of geneSets) {
      let avg: number[] = []

      const useMean = genes.length > 1

      if (genes.length > 1) {
        avg = range(0, dataset.cells ?? 0).map((cellIdx) =>
          mean(genes.map((gene) => gexData[gene.geneId]![cellIdx]!))
        )
      } else {
        avg = gexData[genes[0]!.geneId]!
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

      if (!settings.zscore && max % 2 === 1) {
        max++
      }

      globalMax = Math.max(globalMax, max)

      //nz = normalize(avg, plotRange) // normalize(z, [-3, 3])

      const idx = argsort(avg) //.toReversed()

      plots.push({
        id: nanoid(),
        title: useMean
          ? truncate(`Mean of ${genes.map((g) => g.geneSymbol).join(', ')}`)
          : genes[0]!.geneSymbol,
        genes,
        mode: 'global-gex',
        clusters: store.clusterInfo.clusters, //.slice(0, 2),
        gex: {
          hueOrder: idx,
          hue: avg,
          useMean,
          range: [0, max],
        },

        palette: BWR_CMAP_V2,
      })
    }

    globalMax = Math.max(globalMax, store.globalGexRange[1]!)
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
        draft.plots = plots
        draft.globalGexRange = [0, globalMax]
      })
    )
  }

  return (
    <PlotGridContext.Provider
      value={{
        plots: store.plots,
        globalGexRange: store.globalGexRange,
        //xdata: store.xdata,
        //ydata: store.ydata,
        points: store.points,
        clusterInfo: store.clusterInfo,
        //palette: store.palette,
        set: setStore,
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
        setupGexPlot,
        clear: () => {
          setStore({
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
