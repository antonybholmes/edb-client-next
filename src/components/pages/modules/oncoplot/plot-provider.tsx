import { type IChildrenProps } from '@interfaces/children-props'

import { createContext, useReducer, type Dispatch } from 'react'

import type { ClinicalDataTrack } from './clinical-utils'
import {
  DEFAULT_DISPLAY_PROPS,
  OncoplotMutationFrame,
  type IOncoplotDisplayProps,
} from './oncoplot-utils'

// export interface IOncoplotDataFrame {
//   mutationframe: OncoplotMutationFrame
//   clinicalTracks: ClinicalDataTrack[]
//   //clinicalTracksColorMaps: Map<string, string>[]
//   displayProps: IOncoplotDisplayProps
// }

export interface IPlotState {
  mutationFrame: OncoplotMutationFrame
  clinicalTracks: ClinicalDataTrack[]
  //clinicalTracksColorMaps: Map<string, string>[]
  displayProps: IOncoplotDisplayProps
}

export type PlotAction =
  | {
      type: 'clinical'
      clinicalTracks: ClinicalDataTrack[]
    }
  | {
      type: 'display'
      displayProps: IOncoplotDisplayProps
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
    case 'clinical':
      return {
        ...state,
        clinicalTracks: [...action.clinicalTracks],
      }
    case 'display':
      return {
        ...state,
        displayProps: { ...action.displayProps },
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
    //clinicalTracksColorMaps: [],
    displayProps: { ...DEFAULT_DISPLAY_PROPS },
    mutationFrame: new OncoplotMutationFrame([], [], []),
    clinicalTracks: [],
  },
  plotDispatch: () => {},
})

interface IPlotProviderProps extends IPlotState, IChildrenProps {}

export function PlotProvider({
  displayProps,
  mutationFrame: mutationframe,
  clinicalTracks,
  children,
}: IPlotProviderProps) {
  const [plotState, plotDispatch] = useReducer(plotReducer, {
    displayProps,
    mutationFrame: mutationframe,
    clinicalTracks,
  })

  return (
    <PlotContext.Provider value={{ plotState, plotDispatch }}>
      {children}
    </PlotContext.Provider>
  )
}
