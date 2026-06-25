import { createContext, useContext, type ReactNode } from 'react'

import { BoxPlot } from '../../history/history-provider/history-types'
import { IBoxPlotDisplayOptions } from './boxplot-plot-svg'

export interface BoxPlotPropsContextType {
  displayProps: IBoxPlotDisplayOptions
  plot: BoxPlot
}

export const BoxPlotContext = createContext<
  BoxPlotPropsContextType | undefined
>(undefined)

export function useBoxPlotContext() {
  const ctx = useContext(BoxPlotContext)

  if (!ctx)
    throw new Error(
      'useBoxPlotContext must be used within a BoxPlotContext.Provider'
    )
  return ctx
}

export function BoxPlotProvider({
  plot,
  children,
}: {
  plot: BoxPlot
  children: ReactNode
}) {
  return (
    <BoxPlotContext.Provider value={{ displayProps: plot.props, plot }}>
      {children}
    </BoxPlotContext.Provider>
  )
}
