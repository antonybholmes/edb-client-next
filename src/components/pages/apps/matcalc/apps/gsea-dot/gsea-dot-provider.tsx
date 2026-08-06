import { createContext, useContext, type ReactNode } from 'react'

import { makeUuid } from '@/lib/id'

import { produce } from 'immer'
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
  const maxNes = Math.ceil(
    Math.max(...gseaDot.nes.filter((v) => v >= 0).map((v) => Math.abs(v)))
  )

  const negNes = gseaDot.nes.filter((v) => v < 0)

  const minNes =
    negNes.length > 0
      ? Math.ceil(Math.max(...negNes.map((v) => Math.abs(v))))
      : 0

  console.log('maxNes:', maxNes, 'minNes:', minNes)

  let {
    style = 'gsea-dot-plot',
    props = { ...DEFAULT_GSEA_DOT_PROPS },
    actions = [],
  } = opts

  props = produce(props, (draft) => {
    draft.axes.xaxis.domain = [-minNes, maxNes]
  })

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
