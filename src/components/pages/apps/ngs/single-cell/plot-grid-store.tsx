import type { IPos } from '@/interfaces/pos'
//import { API_SCRNA_GEX_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'

import type { IDBEntity } from '@/interfaces/db-entity'
import type { ColorMap } from '@/lib/color/colormap'
import { API_SCRNA_DATASETS_URL, API_SCRNA_URL } from '@/lib/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders } from '@/lib/http/urls'
import { makeUuid } from '@/lib/id'
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
import { produce } from 'immer'

import { TIME_10_MINUTES_MS } from '@/consts'
import { logger } from '@/lib/logger'
import { useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { create } from 'zustand'
import {
  useSingleCellSettings,
  type IGeneSet,
  type IScrnaGene,
  type IScrnaGexGene,
} from './single-cell-settings'

export type PlotMode = 'gex' | 'global-gex' | 'clusters'

export interface IScrnaDataset extends IDBEntity {
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

export interface IScrnaGexResults {
  //dataset: { id: string }
  datasetId: string
  genes: IScrnaGexGene[]
}

export interface IScrnaDBClusterMetadata {
  name: string
  value: string
  description?: string
  color?: string
}

export interface IScrnaDBCluster {
  // A unique number identifying the cluster
  id: string
  label: number
  name: string
  cells: number
  color: string
  metadata: Record<string, string>
}

export interface IScrnaCluster extends IScrnaDBCluster {
  //publicId: string
  pos: ILim
  show: boolean
  //showRoundel: boolean

  display: {
    label: {
      show: boolean
      roundel: { show: boolean }
    }
  }
}

export interface IScrnaSingleCell extends IPos {
  //barcode: string
  //umapX: number
  //umapY: number
  //pos: IPos
  //clusterId: string
  cluster: number
  //scClass: string
  sample: string
}

export interface IScrnaDatasetMetadata {
  id: string
  clusters: IScrnaDBCluster[]
  cells: IScrnaSingleCell[]
}

export interface IUmapPlot extends IGeneSet {
  gex: {
    hue: number[]
    hueOrder: number[]
    //useMean: boolean
    //range of the gex values for this plot if we want
    // to override the global range
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
  // the dataset the user wants to view
  //selectedDataset: IScrnaDataset | null

  plots: IUmapPlot[]

  dataset: IScrnaDataset | null
  //gexData: Record<string, number[]> // geneId -> cellIdx -> value

  //globalGexRange: ILim
  //xdata: number[]
  //ydata: number[]
  points: IPos[]
  clusterInfo: IClusterInfo | null
  //palette: ColorMap
}

export interface IPlotGridStore extends IPlotGridStoreProps {
  setDataset: (dataset: IScrnaDataset) => void
  /**
   * Once a dataset is picked, add the complete dataset info including points and cluster info
   * @param points
   * @param clusterInfo
   * @returns
   */
  setDatasetInfo: (points: IPos[], clusterInfo: IClusterInfo) => void
  setPlots: (plots: IUmapPlot[]) => void
  //setClusters: (clusters: IScrnaCluster[]) => void
  updatePlot: (plot: IUmapPlot) => void
  //setPlots: (plots: IUmapPlot[]) => void
  setPalette: (palette: ColorMap) => void
  setClusterInfo: (clusterInfo: IClusterInfo) => void
  updateClusterInfo: (clusterInfo: IClusterInfo) => void
  //setGlobalGexRange: (globalGexRange: ILim) => void
  clear: () => void
}

export const usePlotGridStore = create<IPlotGridStore>()(set => ({
  plots: [],

  dataset: null,
  points: [],
  clusterInfo: null,

  setDataset: (dataset: IScrnaDataset) => {
    set({ dataset })
  },

  setPlots: (plots: IUmapPlot[]) => {
    set({
      plots,
    })
  },

  setDatasetInfo: (points: IPos[], clusterInfo: IClusterInfo) => {
    set(state =>
      produce(state, draft => {
        draft.points = points
        draft.clusterInfo = clusterInfo
        draft.plots = []
      })
    )
  },

  updatePlot: (plot: IUmapPlot) => {
    set(state =>
      produce(state, draft => {
        const idx = draft.plots.findIndex(p => p.id === plot.id)
        if (idx !== -1) {
          draft.plots[idx] = plot
        }
      })
    )
  },
  setClusterInfo: (clusterInfo: IClusterInfo) => {
    set({
      clusterInfo,
    })
  },
  setPalette: (palette: ColorMap) => {
    set(state =>
      produce(state, draft => {
        draft.plots = draft.plots.map(p => ({
          ...p,
          palette,
        }))
      })
    )
  },
  updateClusterInfo: (clusterInfo: IClusterInfo) => {
    set(state =>
      produce(state, draft => {
        draft.clusterInfo = clusterInfo
      })
    )
  },
  //setGlobalGexRange: (globalGexRange: ILim) => {},
  clear: () => {
    set({
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
}))

export function usePlotGrid() {
  const store = usePlotGridStore()

  const { fetchAccessToken } = useEdbAuth()
  const { settings, updateSettings } = useSingleCellSettings()

  const dataset = usePlotGridStore(s => s.dataset)

  const plots = usePlotGridStore(s => s.plots)
  const points = usePlotGridStore(s => s.points)
  const clusterInfo = usePlotGridStore(s => s.clusterInfo)

  const setDataset = usePlotGridStore(s => s.setDataset)
  const setPlots = usePlotGridStore(s => s.setPlots)
  const setDatasetInfo = usePlotGridStore(s => s.setDatasetInfo)
  const updateClusterInfo = usePlotGridStore(s => s.updateClusterInfo)
  const setPalette = usePlotGridStore(s => s.setPalette)

  // useEffect(() => {
  //   console.log('Loading GEX for new settings', settings.genesets)
  //   loadGex(store.dataset, settings.genesets)
  // }, [settings.genesets, store.dataset])

  const { data: searchGenes } = useQuery({
    queryKey: ['genes', settings.search, dataset],
    staleTime: TIME_10_MINUTES_MS, // 5 minutes
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      if (!settings.search || !dataset || !accessToken) {
        return []
      }

      const res = await httpFetch.getJson<{ data: IScrnaGene[] }>(
        `${API_SCRNA_DATASETS_URL}/${dataset.id}/genes?q=${encodeURIComponent(settings.search)}`,

        { headers: bearerHeaders(accessToken) }
      )

      return res.data
    },
  })

  const { data: datasets } = useQuery({
    queryKey: ['datasets', settings.genome.assembly, settings.genome.name],
    staleTime: TIME_10_MINUTES_MS, // 5 minutes
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      logger.log('fetching datasets')

      if (!accessToken) {
        return []
      }

      const res = await httpFetch.getJson<{ data: IScrnaDataset[] }>(
        `${API_SCRNA_URL}/assemblies/${settings.genome.assembly}/datasets`,

        { headers: bearerHeaders(accessToken) }
      )

      logger.log('datasets', res.data)

      return res.data
    },
  })

  // when datasets are loaded, set the first one as the default selected dataset
  useEffect(() => {
    if (datasets && datasets.length > 0) {
      setDataset(datasets[0]!)
    }
  }, [datasets])

  // once a dataset is selected, load the dataset info including points and cluster info
  const { data: metadata } = useQuery({
    queryKey: ['metadata', dataset],
    staleTime: TIME_10_MINUTES_MS, // 5 minutes
    queryFn: async () => {
      const accessToken = await fetchAccessToken()

      if (!accessToken || !dataset) {
        return null
      }

      //console.log('fetching metadata', dataset)

      const res = await httpFetch.getJson<{ data: IScrnaDatasetMetadata }>(
        `${API_SCRNA_DATASETS_URL}/${dataset.id}/metadata`,
        { headers: bearerHeaders(accessToken) }
      )

      logger.log('metadata', res.data)

      return res.data
    },
  })

  // once we have a dataset and its metadata, set up the points and cluster info in the store
  useEffect(() => {
    function loadDatasetInfo() {
      if (!dataset || !metadata) {
        return
      }

      const points = metadata!.cells.map(m => ({ x: m.x, y: m.y }))

      const clusters: IScrnaCluster[] = metadata!.clusters.map(c => {
        const idx = where(metadata!.cells, cell => cell.cluster === c.label)

        const xc = ordered(
          points.map(p => p.x),
          idx
        )
        const yc = ordered(
          points.map(p => p.y),
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

      //console.log(clusters)

      let hue = metadata!.cells.map(c => c.cluster) //metadata.cells.map(c => normMap[c.clusterId]!)

      // if we sort by hue, we are sorting by color norm and
      // therefore cluster, so all points in a cluster will
      // be drawn at the same z-level
      const idx = argsort(hue)

      const clusterInfo = {
        clusters,
        cdata: metadata!.cells.map(c => c.cluster),
        order: idx,
        //map: Object.fromEntries(clusters.map((c, ci) => [c.clusterId, ci])),
        roundel: { show: true },
      }

      //console.log('Setting dataset', dataset, metadata, clusterInfo)

      setDatasetInfo(points, clusterInfo)

      updateSettings(
        produce(settings, draft => {
          draft.axes.xaxis.domain = makeDomain(points.map(p => p.x))
          draft.axes.yaxis.domain = makeDomain(points.map(p => p.y))
        })
      )
    }

    loadDatasetInfo()
  }, [metadata, dataset])

  // load gex data for any genes of interest
  const { data: gexData } = useQuery({
    queryKey: ['gex', dataset, settings.genesets],
    staleTime: TIME_10_MINUTES_MS, // 5 minutes
    queryFn: async () => {
      console.log('Loading GEX for', settings.genesets, dataset)
      const accessToken = await fetchAccessToken()

      if (!accessToken || !dataset || settings.genesets.length === 0) {
        return null
      }

      const genes = settings.genesets
        .filter(g => g.mode !== 'clusters')
        .map(g => g.genes.map(gene => gene.geneId))
        .flat()

      if (genes.length === 0) {
        return null
      }

      const res = await httpFetch.postJson<{ data: IScrnaGexResults }>(
        `${API_SCRNA_DATASETS_URL}/${store.dataset!.id}/gex`,
        {
          headers: bearerHeaders(accessToken),
          body: {
            genes,
          },
        }
      )

      logger.log('GEX results', res.data)

      const results: IScrnaGexResults = res.data

      // make some empty arrays to store the gene data
      const gexData = Object.fromEntries(
        genes.map(g => [g, zeros(store.dataset!.cells ?? 0)])
      )

      for (const gene of results.genes) {
        for (const [i, idx] of gene.indexes.entries()) {
          gexData[gene.geneId]![idx] = gene.gex[i]!
        }
      }

      return gexData
    },
  })

  // once we have a dataset, its metadata and the gex data for the genesets, we can set up the plots
  // to render
  useEffect(() => {
    function setupGexPlots() {
      const genesets = settings.genesets

      if (
        !gexData ||
        !store.dataset ||
        genesets.length === 0 ||
        !metadata ||
        !store.clusterInfo
      ) {
        return
      }

      let globalMax = 0

      const clusterMap = new Map<number, IScrnaCluster>(
        store.clusterInfo.clusters.map(c => [c.label, c])
      )

      // create a mask for cells that are in shown clusters
      const mask = store.clusterInfo.cdata.map(c => {
        const cluster = clusterMap.get(c)
        return cluster && cluster.show
      })

      const plots: IUmapPlot[] = new Array(genesets.length)

      for (const [gi, geneset] of genesets.entries()) {
        if (geneset.mode === 'clusters') {
          const plot: IUmapPlot = {
            ...geneset,
            id: makeUuid(),
            name: geneset.name,
            //clusters: store.clusterInfo.clusters, //.slice(0, 2),

            gex: {
              hueOrder: store.clusterInfo.order,
              hue: store.clusterInfo.cdata,
              range: [0, 0],
            },
          }
          plots[gi] = plot

          continue
        }

        let avg: number[] = []

        const useMean = geneset.genes.length > 1

        if (useMean) {
          avg = range(0, store.dataset.cells ?? 0).map(cellIdx =>
            mean(geneset.genes.map(gene => gexData[gene.geneId]![cellIdx]!))
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
              avg = avg.map(v => Math.log2(v + 1))
              break
            case 'log10':
              avg = avg.map(v => Math.log10(v + 1))
              break
            case 'ln':
              avg = avg.map(v => Math.log1p(v))
              break
          }
        }

        if (settings.gex.zscore.on) {
          avg = new ZScore().fitTransform(avg)
        }
        //nz = normalize(z, settings.zscore.range) //settings.zscore.range)

        // get max regardless of min max using only the visible clusters
        max = Math.ceil(
          Math.max(...avg.filter((_, i) => mask[i]).map(x => Math.abs(x)))
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
          idx = store.clusterInfo.order
        }

        const plot: IUmapPlot = {
          ...geneset,
          id: makeUuid(),

          name: useMean
            ? truncate(
                `Mean of ${geneset.name}: ${geneset.genes.map(g => g.geneSymbol).join(', ')}`
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
        plots[gi] = plot
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

      setPlots(plots)

      if (settings.gex.autoRange) {
        //console.log('Setting global range to ', [-globalMax, globalMax])
        updateSettings(
          produce(settings, draft => {
            if (settings.gex.zscore.on) {
              draft.gex.zscore.range = [-globalMax, globalMax]
            } else {
              draft.gex.range = [0, globalMax]
            }
          })
        )
      }
    }

    setupGexPlots()
  }, [
    gexData,
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

  return {
    dataset,
    datasets: datasets || [],
    searchGenes: searchGenes || [],
    plots,
    points,
    clusterInfo,
    setDataset,
    setPlots,
    setPalette,
    updateClusterInfo,
  }
}

export function makeDomain(data: number[]): ILim {
  let min = Math.floor(Math.min(...data))
  let max = Math.ceil(Math.max(...data))

  // add a small buffer to prevent dots being cropped
  min = min % 2 === 0 ? min - 2 : min - 1
  max = max % 2 === 0 ? max + 2 : max + 1

  return [min, max]
}
