import { type IChildrenProps } from '@interfaces/children-props'

import type { IFieldMap } from '@interfaces/field-map'

import { where } from '@lib/math/where'
import { createContext, useReducer, type Dispatch } from 'react'

import { newPlot, type IPlot } from './history/history-store'
import type { IPlotDisplayOptions } from './plot-props-store'

export type PlotStyle =
  | 'heatmap'
  | 'dot'
  | 'volcano'
  | 'box'
  | 'ext-gsea'
  | 'lollipop'

export type PlotAction =
  | {
      type: 'add'
      //cf: IClusterFrame
      style: PlotStyle
      // attach custom properties to the plot specific to a plot type
      customProps?: IFieldMap | undefined
    }
  | {
      type: 'set'
      //cf: IClusterFrame
      style: PlotStyle
      customProps?: IFieldMap | undefined
    }
  | {
      type: 'update-display'
      id: string
      displayOptions: IPlotDisplayOptions
    }
  | {
      type: 'update-custom-prop'
      id: string
      name: string
      prop: unknown
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

interface IPlotState {
  index: number
  plots: IPlot[]
  plotMap: { [key: string]: IPlot }
}

const DEFAULT_PROPS: IPlotState = {
  index: 1,
  plots: [],
  plotMap: {},
}

export function plotsReducer(
  state: IPlotState,
  action: PlotAction
): IPlotState {
  let plot: IPlot
  let idx: number[]

  switch (action.type) {
    case 'add':
      plot = {
        ...newPlot(`${action.style} ${state.index}`, {}, action.style),
        customProps: action.customProps ?? {},
      }

      //console.log('add', plot)

      return {
        ...state,
        index: state.index + 1,
        plots: [...state.plots, plot],
        plotMap: { ...state.plotMap, [plot.id]: plot },
      }

    case 'set':
      plot = {
        ...newPlot(`${action.style} ${state.index}`, {}, action.style),

        customProps: action.customProps ?? {},
      }

      return {
        ...state,
        index: 1,
        plots: [plot],
        plotMap: { [plot.id]: plot },
      }
    case 'remove':
      return {
        ...state,
        plots: state.plots.filter(plot => plot.id != action.id),
        plotMap: Object.fromEntries(
          Object.entries(state.plotMap).filter(e => e[0] != action.id)
        ),
      }
    case 'update-display':
      idx = where(state.plots, plot => plot.id === action.id)

      if (idx.length > 0) {
        const plot = {
          ...state.plots[idx[0]!]!,
          displayOptions: action.displayOptions,
        }

        return {
          ...state,
          plots: state.plots.map(p => (p.id === action.id ? plot : p)),
          plotMap: { ...state.plotMap, [plot.id]: plot },
        }
      } else {
        return state
      }
    case 'update-custom-prop':
      idx = where(state.plots, plot => plot.id === action.id)

      if (idx.length > 0) {
        plot = state.plots[idx[0]!]!

        plot = {
          ...plot,
          customProps: { ...plot.customProps, [action.name]: action.prop },
        }

        return {
          ...state,
          plots: state.plots.map(p => (p.id === action.id ? plot : p)),
          plotMap: { ...state.plotMap, [plot.id]: plot },
        }
      } else {
        return state
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
  plotsState: IPlotState
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
