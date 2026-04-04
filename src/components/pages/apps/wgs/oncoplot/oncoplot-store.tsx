import { create } from 'zustand'

import { randomHexColor } from '@/lib/color/color'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { makeUuid } from '@/lib/id'
import type { ClinicalDataTrack } from './clinical-utils'
import { type IOncoGene, type OncoplotFrame } from './oncoplot-utils'

export interface IPlotState {
  mutationFrame: OncoplotFrame | null
  mutationsInUse: string[]
  genes: IOncoGene[]

  clinicalTracks: ClinicalDataTrack[] //Record<string, ClinicalDataTrack>
  //trackOrder: string[]
  //clinicalTracksColorMaps: Map<string, string>[]
  //displayProps: IOncoplotDisplayProps
}

export interface IOncoplotStore extends IPlotState {
  setMutationFrame(mutationFrame: OncoplotFrame): void
  setVariantsInUse(mutationsInUse: string[]): void
  setGenes(genes: IOncoGene[]): void
  setGenesFromTable(df: BaseDataFrame): void
  setClinicalTracks(clinicalTracks: ClinicalDataTrack[]): void
  //setDisplayProps(displayProps: IOncoplotDisplayProps): void
  //setTrackOrder(trackOrder: string[]): void
}

export const useOncoplotStore = create<IOncoplotStore>(set => ({
  mutationFrame: null,
  mutationsInUse: [],
  genes: [],
  clinicalTracks: [],
  trackOrder: [],
  //displayProps: { ...DEFAULT_DISPLAY_PROPS },

  setMutationFrame: (mutationFrame: OncoplotFrame) =>
    set(state => ({
      ...state,
      mutationFrame,
    })),
  setVariantsInUse: (mutationsInUse: string[]) =>
    set(state => ({
      ...state,
      mutationsInUse: [...mutationsInUse],
    })),
  setGenes: (genes: IOncoGene[]) =>
    set(state => ({
      ...state,
      genes: [...genes],
    })),
  setGenesFromTable: (df: BaseDataFrame) =>
    set(state => {
      const genes = [...new Set(df.col('Gene')?.strs)].sort()

      const genesInUse: IOncoGene[] = genes.map(g => ({
        id: makeUuid(),
        name: g,
        color: randomHexColor(),
        show: true,
      }))

      return {
        ...state,
        genes: genesInUse,
      }
    }),
  setClinicalTracks: (clinicalTracks: ClinicalDataTrack[]) =>
    set(state => ({
      ...state,
      // clinicalTracks: Object.fromEntries(
      //   clinicalTracks.map(track => [track.name, track])
      // ),
      clinicalTracks,
      trackOrder: clinicalTracks.map(track => track.name),
    })),
  // setTrackOrder: (trackOrder: string[]) =>
  //   set(state => ({
  //     ...state,
  //     trackOrder,
  //   })),
  // setProtein: (protein: IProtein) =>
  //   set(state => ({
  //     ...state,
  //     protein: { ...protein }, // create a new object to trigger reactivity
  //   })),
  // setFeature: (feature: IProteinFeature) =>
  //   set(state => ({
  //     ...state,
  //     features: state.features.map(f => (f.id === feature.id ? feature : f)),
  //   })),
  // setFeatures: (features: Partial<IProteinFeature>[]) =>
  //   set(state => ({
  //     ...state,
  //     features: features.map(f => {
  //       // firstly make a new feature and ensure
  //       // it has a unique id
  //       const newF = {
  //         ...DEFAULT_PROTEIN_FEATURE,
  //         id: NANOID12(),
  //       }

  //       // now overwrite properties
  //       return deepMergeDefaults(newF, f)
  //     }),
  //   })),
}))

export function useOncoplot(): IOncoplotStore {
  const mutationFrame = useOncoplotStore(state => state.mutationFrame)
  const mutationsInUse = useOncoplotStore(state => state.mutationsInUse)
  const genes = useOncoplotStore(state => state.genes)
  const clinicalTracks = useOncoplotStore(state => state.clinicalTracks)
  //const displayProps = useOncoplotStore(state => state.displayProps)
  //const trackOrder = useOncoplotStore(state => state.trackOrder)

  return {
    mutationFrame,
    mutationsInUse,
    genes,
    clinicalTracks,

    setMutationFrame: useOncoplotStore(state => state.setMutationFrame),
    setClinicalTracks: useOncoplotStore(state => state.setClinicalTracks),
    setGenes: useOncoplotStore(state => state.setGenes),
    setGenesFromTable: useOncoplotStore(state => state.setGenesFromTable),
    setVariantsInUse: useOncoplotStore(state => state.setVariantsInUse),
  }
}

// interface IPlotState {
//   df: ILollipop
// }

// export type PlotAction =
//   | {
//       type: 'set'
//       df: ILollipop
//     }
//   | {
//       type: 'features'
//       features: IProteinFeature[]
//     }
//   | {
//       type: 'feature'
//       feature: IProteinFeature
//     }
//   | {
//       type: 'labels'
//       labels: IProteinLabel[]
//     }
// | {
//     type: 'display'
//     displayProps: ILollipopDisplayProps
//   }

// export function makePlot(cf: ClusterFrame, type: PlotType, params:IFieldMap={}): IPlot {
//   return {
//     id: randId(),
//     type,
//     cf,
//     params
//   }
// }

// export function plotReducer(state: IPlotState, action: PlotAction): IPlotState {
//   switch (action.type) {
//     case 'set':
//       return {
//         df: action.df,
//       }
//     case 'features':
//       return {
//         df: {
//           ...state.df,
//           features: [...action.features],
//         },
//       }
//     case 'feature':
//       return {
//         df: {
//           ...state.df,
//           features: state.df.features.map(f =>
//             f.id === action.feature.id ? action.feature : f
//           ),
//         },
//       }
//     case 'labels':
//       return {
//         df: {
//           ...state.df,
//           labels: [...action.labels],
//         },
//       }
//     // case 'display':
//     //   return {
//     //     df: {
//     //       ...state.df,
//     //       displayProps: { ...action.displayProps },
//     //     },
//     //   }
//     default:
//       return state
//   }
// }

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

// export const PlotContext = createContext<{
//   plotState: IPlotState
//   plotDispatch: Dispatch<PlotAction>
// }>({
//   plotState: {
//     df: { ...DEFAULT_LOLLIPOP },
//   },
//   plotDispatch: () => {},
// })

// export function PlotProvider({ children }: IChildrenProps) {
//   const [plotState, plotDispatch] = useReducer(plotReducer, {
//     df: { ...DEFAULT_LOLLIPOP },
//   })

//   return (
//     <PlotContext.Provider value={{ plotState, plotDispatch }}>
//       {children}
//     </PlotContext.Provider>
//   )
// }
