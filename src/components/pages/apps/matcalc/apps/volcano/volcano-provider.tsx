import { createContext, useContext, type ReactNode } from 'react'
import { type VolcanoPlot } from '../../history/history-store'
import type { IVolcanoDisplayOptions } from './volcano-plot-svg'

export interface VolcanoPropsContextType {
  displayProps: IVolcanoDisplayOptions
  plot: VolcanoPlot
}

export const VolcanoContext = createContext<
  VolcanoPropsContextType | undefined
>(undefined)

export function useVolcanoContext() {
  const ctx = useContext(VolcanoContext)

  if (!ctx)
    throw new Error(
      'useVolcanoContext must be used within a VolcanoContext.Provider'
    )
  return ctx
}

export function VolcanoProvider({
  plot,
  children,
}: {
  plot: VolcanoPlot
  children: ReactNode
}) {
  return (
    <VolcanoContext.Provider value={{ displayProps: plot.props, plot }}>
      {children}
    </VolcanoContext.Provider>
  )
}
