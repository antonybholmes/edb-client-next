import { createContext, useContext, type ReactNode } from 'react'

import { IGseaDotPlot } from '../../history/history-provider/history-types'
import type { IGseaDotDisplayOptions } from './gsea-dot-plot-svg'

export interface GseaDotPropsContextType {
  displayProps: IGseaDotDisplayOptions
  plot: IGseaDotPlot
}

export const GseaDotContext = createContext<
  GseaDotPropsContextType | undefined
>(undefined)

export function useGseaDotContext() {
  const ctx = useContext(GseaDotContext)

  if (!ctx)
    throw new Error(
      'useGseaDotContext must be used within a GseaDotContext.Provider'
    )
  return ctx
}

export function GseaDotProvider({
  plot,
  children,
}: {
  plot: IGseaDotPlot
  children: ReactNode
}) {
  return (
    <GseaDotContext.Provider
      value={{
        displayProps: plot.props,
        plot,
      }}
    >
      {children}
    </GseaDotContext.Provider>
  )
}
