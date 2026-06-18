import { create } from 'zustand'

import { config } from '@/config'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEFAULT_DISPLAY_PROPS,
  DEFAULT_MUTATIONS,
  type IMutation,
  type IOncoplotDisplayProps,
} from './oncoplot-utils'

const SETTINGS_KEY = `${config.appId}:app:oncoplot:v30`

export interface IPlotState {
  mutations: IMutation[]
  //genesInUse: Record<string, boolean>
  displayProps: IOncoplotDisplayProps
}

export interface IOncoplotStore extends IPlotState {
  setMutations(mutations: IMutation[]): void
  //setGenesInUse(genesInUse: Record<string, boolean>): void
  //setGenesInUseFromTable(df: BaseDataFrame): void
  setDisplayProps(displayProps: IOncoplotDisplayProps): void
}

export const useOncoplotStore = create<IOncoplotStore>()(
  persist(
    set => ({
      mutations: [...DEFAULT_MUTATIONS],
      genesInUse: {},
      displayProps: { ...DEFAULT_DISPLAY_PROPS },
      setMutations: (mutations: IMutation[]) =>
        set(state => ({
          ...state,
          mutations: [...mutations],
        })),
      setGenesInUse: (genesInUse: Record<string, boolean>) =>
        set(state => ({
          ...state,
          genesInUse: { ...genesInUse },
        })),

      setDisplayProps: (displayProps: IOncoplotDisplayProps) =>
        set(state => ({
          ...state,
          displayProps,
        })),
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useOncoplotSettings(): IOncoplotStore {
  const mutations = useOncoplotStore(state => state.mutations)
  //const genesInUse = useOncoplotStore(state => state.genesInUse)
  const displayProps = useOncoplotStore(state => state.displayProps)
  //const trackOrder = useOncoplotStore(state => state.trackOrder)

  return {
    displayProps,
    //genesInUse,
    mutations,
    setMutations: useOncoplotStore(state => state.setMutations),
    //setGenesInUse: useOncoplotStore(state => state.setGenesInUse),
    // setGenesInUseFromTable: useOncoplotStore(
    //   state => state.setGenesInUseFromTable
    // ),
    setDisplayProps: useOncoplotStore(state => state.setDisplayProps),
    //setTrackOrder: useOncoplotStore(state => state.setTrackOrder),
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
