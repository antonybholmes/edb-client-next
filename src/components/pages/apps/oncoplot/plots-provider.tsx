import { type IChildrenProps } from '@interfaces/children-props'

import { createContext, useReducer, type Dispatch } from 'react'

import { makeNanoIDLen12 } from '@lib/id'
import type { IPlotState } from './plot-provider'

export interface IPlot extends IPlotState {
  id: string
  name: string
}

export interface IPlotProps extends IPlotState {
  id?: string
  name?: string
}

export type PlotAction =
  | {
      type: 'add'
      plot: IPlotProps
    }
  | {
      type: 'set'
      plot: IPlotProps
    }
  | {
      type: 'remove'
      id: string
    }
  | { type: 'clear' }

// export function makePlot(cf: ClusterFrame, type: PlotType, params:IFieldMap={}): IPlot {
//   return {
//     id: randId(),
//     type,
//     cf,
//     params
//   }
// }

interface IPlotsState {
  plots: IPlot[]
}

const DEFAULT_PROPS: IPlotsState = {
  plots: [],
}

export function plotsReducer(
  state: IPlotsState,
  action: PlotAction
): IPlotsState {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        plots: [
          ...state.plots,
          {
            id: action.plot.id ?? makeNanoIDLen12(),
            name: action.plot.name ?? `Oncoplot ${state.plots.length + 1}`,
            mutationFrame: action.plot.mutationFrame,
            clinicalTracks: action.plot.clinicalTracks,
            displayProps: action.plot.displayProps,
          },
        ],
      }

    case 'set':
      return {
        ...state,
        plots: [
          {
            id: action.plot.id ?? makeNanoIDLen12(),
            name: action.plot.name ?? `Oncoplot ${state.plots.length + 1}`,
            mutationFrame: action.plot.mutationFrame,
            clinicalTracks: action.plot.clinicalTracks,
            displayProps: action.plot.displayProps,
          },
        ],
      }
    case 'remove':
      return {
        ...state,
        plots: state.plots.filter((plot) => plot.id != action.id),
      }
    case 'clear':
      return { ...state, plots: [] }

    default:
      return state
  }
}

// const [DEFAULT_HISTORY, DEFAULT_HISTORY_DISPATCH] = useReducer(
//   historyReducer,
//   new HistoryState(0, DEFAULT_HISTORY_STEPS),
// )

export const PlotsContext = createContext<{
  plotsState: IPlotsState
  plotsDispatch: Dispatch<PlotAction>
}>({
  plotsState: { ...DEFAULT_PROPS },
  plotsDispatch: () => {},
})

export function PlotsProvider({ children }: IChildrenProps) {
  const [plotsState, plotsDispatch] = useReducer(plotsReducer, {
    ...DEFAULT_PROPS,
  })

  return (
    <PlotsContext.Provider value={{ plotsState, plotsDispatch }}>
      {children}
    </PlotsContext.Provider>
  )
}
