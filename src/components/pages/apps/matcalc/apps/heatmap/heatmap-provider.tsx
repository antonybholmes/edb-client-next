import type { IHeatMapSettings } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { createContext, useContext, type ReactNode } from 'react'
import { HeatMapPlot } from '../../history/history-provider/history-types'

export interface HeatmapPropsContextType {
  displayProps: IHeatMapSettings
  plot: HeatMapPlot
}

export const HeatmapContext = createContext<
  HeatmapPropsContextType | undefined
>(undefined)

export function useHeatmapContext() {
  const ctx = useContext(HeatmapContext)

  if (!ctx) {
    throw new Error(
      'useHeatmapContext must be used within a HeatmapContext.Provider'
    )
  }

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
