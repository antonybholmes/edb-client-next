import type { IHeatMapDisplayOptions } from '@/components/plot/heatmap/heatmap-svg-props'
import { createContext, useContext, type ReactNode } from 'react'
import { type HeatMapPlot } from '../../history/history-store'

export interface HeatmapPropsContextType {
  displayProps: IHeatMapDisplayOptions
  plot: HeatMapPlot
}

export const HeatmapContext = createContext<
  HeatmapPropsContextType | undefined
>(undefined)

export function useHeatmapContext() {
  const ctx = useContext(HeatmapContext)

  if (!ctx)
    throw new Error(
      'useHeatmapContext must be used within a HeatmapContext.Provider'
    )
  return ctx
}

export function HeatmapProvider({
  plot,
  children,
}: {
  plot: HeatMapPlot
  children: ReactNode
}) {
  return (
    <HeatmapContext.Provider value={{ displayProps: plot.props, plot }}>
      {children}
    </HeatmapContext.Provider>
  )
}
