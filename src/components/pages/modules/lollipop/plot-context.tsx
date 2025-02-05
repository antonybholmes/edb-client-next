import { type IChildrenProps } from '@interfaces/children-props'

import { createContext, useReducer, type Dispatch } from 'react'

import {
  DEFAULT_DISPLAY_PROPS,
  type ILollipopDisplayProps,
  type IProteinFeature,
  type IProteinLabel,
  type LollipopStats,
} from './lollipop-utils'
import { DEFAULT_PROTEIN, type IProtein } from './protein-context'

export interface ILollipopDataFrame {
  protein: IProtein
  aaStats: LollipopStats[]
  features: IProteinFeature[]
  labels: IProteinLabel[]
  displayProps: ILollipopDisplayProps
}

interface IPlotState {
  df: ILollipopDataFrame
}

export type PlotAction =
  | {
      type: 'features'
      features: IProteinFeature[]
    }
  | {
      type: 'labels'
      labels: IProteinLabel[]
    }
  | {
      type: 'display'
      displayProps: ILollipopDisplayProps
    }

// export function makePlot(cf: ClusterFrame, type: PlotType, params:IFieldMap={}): IPlot {
//   return {
//     id: randId(),
//     type,
//     cf,
//     params
//   }
// }

export function plotReducer(state: IPlotState, action: PlotAction): IPlotState {
  switch (action.type) {
    case 'features':
      return {
        df: {
          ...state.df,
          features: [...action.features],
        },
      }
    case 'labels':
      return {
        df: {
          ...state.df,
          labels: [...action.labels],
        },
      }
    case 'display':
      return {
        df: {
          ...state.df,
          displayProps: { ...action.displayProps },
        },
      }
    default:
      return state
  }
}

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

export const PlotContext = createContext<{
  plotState: IPlotState
  plotDispatch: Dispatch<PlotAction>
}>({
  plotState: {
    df: {
      protein: { ...DEFAULT_PROTEIN },
      aaStats: [],
      features: [],
      displayProps: { ...DEFAULT_DISPLAY_PROPS },
      labels: [],
    },
  },
  plotDispatch: () => {},
})

interface IPlotProviderProps extends IChildrenProps {
  df: ILollipopDataFrame
}

export function PlotProvider({ df, children }: IPlotProviderProps) {
  const [plotState, plotDispatch] = useReducer(plotReducer, { df })

  return (
    <PlotContext.Provider value={{ plotState, plotDispatch }}>
      {children}
    </PlotContext.Provider>
  )
}
