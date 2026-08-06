import { createContext, useContext, type ReactNode } from 'react'

import { makeUuid } from '@/lib/id'

import { IBasePlot } from '../../history/history-provider/plot'
import {
  DEFAULT_GSEA_DOT_PROPS,
  type IGseaDotDisplayOptions,
} from './gsea-dot-plot-svg'

export interface IGseaDot {
  ids: string[]
  nes: number[]
  log10pvalues: number[]
  sizes: number[]
}

export interface IGseaDotPlot extends IBasePlot {
  style: 'gsea-dot-plot'
  gseaDot: IGseaDot
  props: IGseaDotDisplayOptions
}

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

export function newGseaDotPlot(
  name: string,
  gseaDot: IGseaDot,
  opts: Partial<IGseaDotPlot> = {}
): IGseaDotPlot {
  const {
    style = 'gsea-dot-plot',
    props = { ...DEFAULT_GSEA_DOT_PROPS },
    actions = [],
  } = opts

  return {
    id: makeUuid(),
    style,
    name,
    gseaDot,
    groupRows: [],
    props,
    actions,
    type: 'plot',
    createdAt: new Date().toISOString(),
  }
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
