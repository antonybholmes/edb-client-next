import type { IFieldMap } from '@/interfaces/field-map'

import { createContext, type Dispatch } from 'react'

import type { IHeatMapDisplayOptions } from '@/components/plot/heatmap/heatmap-svg-props'
import { deepFreeze } from '@/lib/utils'
import type { IBoxPlotDisplayOptions } from './apps/boxplot/boxplot-plot-svg'
import type { IExtGseaDisplayOptions } from './apps/ext-gsea/ext-gsea-store'
import type { IVolcanoDisplayOptions } from './apps/volcano/volcano-plot-svg'
import { HistoryPlot } from './history/history-provider/history-types'

export type IPlotDisplayOptions =
  | IHeatMapDisplayOptions
  | IVolcanoDisplayOptions
  | IExtGseaDisplayOptions
  | IBoxPlotDisplayOptions

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

interface IPlotState {
  index: number
  plots: HistoryPlot[]
  plotMap: Record<string, HistoryPlot>
}

const DEFAULT_PROPS: IPlotState = deepFreeze({
  index: 1,
  plots: [],
  plotMap: {},
})

export const PlotsContext = createContext<{
  plotsState: IPlotState
  plotsDispatch: Dispatch<PlotAction>
}>({
  plotsState: { ...DEFAULT_PROPS },
  plotsDispatch: () => {},
})
