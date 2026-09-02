import type { IHeatMapSettings } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { createContext, useContext, useState, type ReactNode } from 'react'
import { HeatMapPlot } from '../../history/history-provider/history-types'

export interface HeatmapPropsContextType {
  displayProps?: IHeatMapSettings | undefined
  plot?: HeatMapPlot | undefined
  setPlot: (plot: HeatMapPlot) => void
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
  plot?: HeatMapPlot | undefined
  children: ReactNode
}) {
  const [_plot, setPlot] = useState<HeatMapPlot | undefined>(plot)

  return (
    <HeatmapContext.Provider
      value={{ displayProps: _plot?.props, plot: _plot, setPlot }}
    >
      {children}
    </HeatmapContext.Provider>
  )
}
