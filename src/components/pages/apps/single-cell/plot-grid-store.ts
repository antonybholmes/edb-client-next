import type { ILim } from '@/lib/math/math'
import { create } from 'zustand'
import type {
  IClusterInfo,
  IPlotGridStore,
  IPlotGridStoreProps,
  IUmapPlot,
} from './plot-grid-provider'

const usePlotGridStore = create<IPlotGridStore>((set) => ({
  plots: [],
  globalGexRange: [-3, 3] as ILim,
  //xdata: [],
  //ydata: [],
  points: [],
  clusterInfo: {
    clusters: [],
    cdata: [],
    order: [],
    map: {},
  },

  set: (newState: IPlotGridStoreProps) => {
    set((state) => ({ ...state, ...newState }))
  },
  //setPalette: (palette: ColorMap) =>
  //  set((state: IPlotGridStore) => ({ ...state, palette })),
  // setClusters: (clusters: IScrnaCluster[]) =>
  //   set((state: IPlotGridStore) => {
  //     return {
  //       ...state,
  //       clusters,
  //       clusterMap: Object.fromEntries(clusters.map(c => [c.clusterId, c])),
  //     }
  //   }),
  updatePlot: (plot: IUmapPlot) =>
    set((state: IPlotGridStore) => ({
      ...state,
      plots: state.plots.map((p) => (p.id === plot.id ? plot : p)),
    })),
  setPlots: (plots: IUmapPlot[]) =>
    set((state: IPlotGridStore) => ({
      ...state,
      plots,
    })),
  setGlobalGexRange: (globalGexRange: ILim) =>
    set((state: IPlotGridStore) => ({
      ...state,
      globalGexRange,
    })),
  setClusterInfo: (clusterInfo: IClusterInfo) =>
    set((state: IPlotGridStore) => ({
      ...state,
      clusterInfo,
    })),
  clear: () => set((state: IPlotGridStore) => ({ ...state, plots: [] })),
}))

// export function usePlotGrid(): IPlotGridContext {
//   const { fetchAccessToken } = useEdbAuth()
//   const { settings } = useUmapSettings()

//   const {
//     plots,
//     globalGexRange,
//     xdata,
//     ydata,
//     clusterInfo,
//     set,
//     setPlots,
//     setGlobalGexRange,
//     updatePlot,
//     setClusterInfo,
//     clear,
//   } = usePlotGridStore(
//     useShallow(state => ({
//       plots: state.plots,
//       globalGexRange: state.globalGexRange,
//       xdata: state.xdata,
//       ydata: state.ydata,
//       clusterInfo: state.clusterInfo,
//       //palette: state.palette,
//       set: state.set,
//       //setPalette: state.setPalette,
//       setPlots: state.setPlots,
//       setGlobalGexRange: state.setGlobalGexRange,
//       updatePlot: state.updatePlot,
//       setClusterInfo: state.setClusterInfo,
//       clear: state.clear,
//     }))
//   )

//   function setMode(mode: PlotMode) {
//     setPlots(plots.map(p => ({ ...p, mode })))
//   }

//   async function loadGex(dataset: IScrnaDataset, geneSets: IScrnaGene[][]) {
//     try {
//       const accessToken = await fetchAccessToken()

//       if (!accessToken) {
//         return
//       }

//       //const genes =
//       //  settings.genes.filter(g => genesForUse.get(g.geneId) ?? false) ?? []

//       if (settings.geneSets.length < 1) {
//         return
//       }

//       const res = await queryClient.fetchQuery({
//         queryKey: [
//           'gex',
//           dataset.publicId,
//           geneSets
//             .flat()
//             .map(g => g.geneId)
//             .join(','),
//         ],
//         queryFn: () => {
//           return httpFetch.postJson<{ data: IScrnaGexResults }>(
//             `${API_SCRNA_GEX_URL}/${dataset.publicId}`,

//             {
//               headers: bearerHeaders(accessToken),
//               body: {
//                 genes: geneSets.flat().map(g => g.geneId),
//               },
//             }
//           )
//         },
//       })

//       const results: IScrnaGexResults = res.data

//       // make some empty arrays to store the gene data
//       const gexData = Object.fromEntries(
//         geneSets.flat().map(g => [g.geneId, zeros(dataset.cells ?? 0)])
//       )

//       for (const gene of results.genes) {
//         for (const gx of gene.gex) {
//           gexData[gene.geneId]![gx[0]!] = gx[1]!
//         }
//       }

//       console.log('waht foold', gexData)

//       setupGexPlot(dataset, geneSets, gexData)
//       //
//     } catch (e) {
//       console.error('error loading datasets from remote' + e)
//     }
//   }

//   function setupGexPlot(
//     dataset: IScrnaDataset,
//     geneSets: IScrnaGene[][],
//     gexData: Record<string, number[]>
//   ) {
//     if (settings.geneSets.length === 0 || Object.keys(gexData).length === 0) {
//       return
//     }

//     const plots: IUmapPlot[] = []

//     let globalMax = 0

//     for (const genes of geneSets) {
//       let avg: number[] = []

//       const useMean = genes.length > 1

//       if (genes.length > 1) {
//         avg = range(0, dataset.cells ?? 0).map(cellIdx =>
//           mean(genes.map(gene => gexData[gene.geneId]![cellIdx]!))
//         )
//       } else {
//         avg = gexData[genes[0]!.geneId]!
//       }

//       //console.log(avg)

//       //let nz: number[]
//       //let plotRange: ILim

//       let max = 0

//       if (settings.zscore.on) {
//         avg = new ZScore().fitTransform(avg)
//       }
//       //nz = normalize(z, settings.zscore.range) //settings.zscore.range)

//       // get max regards of min max
//       max = Math.ceil(Math.max(...avg.map(x => Math.abs(x))))

//       if (!settings.zscore && max % 2 === 1) {
//         max++
//       }

//       globalMax = Math.max(globalMax, max)

//       //nz = normalize(avg, plotRange) // normalize(z, [-3, 3])

//       const idx = argsort(avg) //.toReversed()

//       plots.push({
//         id: nanoid(),
//         title: useMean
//           ? truncate(`Mean of ${genes.map(g => g.geneSymbol).join(', ')}`)
//           : genes[0]!.geneSymbol,
//         genes,
//         mode: 'global-gex',
//         clusters: clusterInfo.clusters, //.slice(0, 2),
//         gex: {
//           hueOrder: idx,
//           hue: avg,
//           useMean,
//           range: [settings.zscore ? -max : 0, max],
//         },

//         palette: BWR_CMAP_V2,
//       })
//     }

//     globalMax = Math.max(globalMax, globalGexRange[1]!)
//     //nz = ordered(nz, idx)

//     // All cached data is kept in the order it arrives
//     // from the db. Only at the last step is the xy data
//     // sorted to adjust the display
//     // sort points so higher z drawn last and on top

//     //let xdata = metadata!.cells.map(m => m.umapX)
//     //xdata = ordered(xdata, idx)

//     //let ydata = metadata!.cells.map(m => m.umapY)
//     //ydata = ordered(ydata, idx)

//     setPlots(plots)
//     setGlobalGexRange(
//       settings.zscore.on ? [-globalMax, globalMax] : [0, globalMax]
//     )

//     // if (!sheet) {
//     //   return
//     // }

//     // setCMap(BWR_CMAP)

//     // const df = sheet.copy()
//     // df.setCol('Hue', nz, true)

//     // addStep('Add Hue', [df])

//     // setClusterFrame(df)

//     // const xdata = df.col('UMAP1')!.numValues
//     // const ydata = df.col('UMAP2')!.numValues

//     //console.log([Math.min(...xdata), Math.max(...xdata)])

//     // if (settings.autoAxes) {
//     //   updateSettings(
//     //     produce(settings, draft => {
//     //       //draft.mode = 'global-gex'
//     //       // draft.globalGexRange = settings.zscore.on
//     //       //   ? settings.zscore.range
//     //       //   : [0, globalMax]
//     //       draft.axes.xaxis.domain = makeDomain(xdata)
//     //       draft.axes.yaxis.domain = makeDomain(ydata)
//     //     })
//     //   )
//     // }
//   }

//   function setPalette(palette: ColorMap) {
//     setPlots(plots.map(p => ({ ...p, palette })))
//   }

//   return {
//     plots,
//     globalGexRange,
//     xdata,
//     ydata,
//     clusterInfo,

//     set,
//     setPalette,
//     setMode,
//     setPlots,
//     updatePlot,
//     setClusterInfo,
//     clear,
//     loadGex,
//     setupGexPlot,
//   }
// }
