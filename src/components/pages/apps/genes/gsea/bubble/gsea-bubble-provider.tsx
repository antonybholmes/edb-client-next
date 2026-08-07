import { createContext, useContext, useState, type ReactNode } from 'react'

import { makeUuid } from '@/lib/id'

import { produce } from 'immer'
import { IBasePlot } from '../../../matcalc/history/history-provider/plot'
import {
  DEFAULT_GSEA_DOT_PROPS,
  type IGseaBubbleDisplayOptions,
} from './gsea-bubble-svg'

export interface IGseaBubble {
  ids: string[]
  nes: { values: number[]; label: string }
  log10pvalues: { values: number[]; label: string }
  sizes: { values: number[]; label: string }
}

export interface IGseaBubblePlot extends IBasePlot {
  style: 'gsea-bubble-plot'
  gseaDot: IGseaBubble
  props: IGseaBubbleDisplayOptions
}

export interface GseaBubblePropsContextType {
  displayProps: IGseaBubbleDisplayOptions
  plot: IGseaBubblePlot
  setPlot: (plot: IGseaBubblePlot) => void
}

export const GseaBubbleContext = createContext<
  GseaBubblePropsContextType | undefined
>(undefined)

export function useGseaBubbleContext() {
  const ctx = useContext(GseaBubbleContext)

  if (!ctx)
    throw new Error(
      'useGseaBubbleContext must be used within a GseaBubbleContext.Provider'
    )
  return ctx
}

export function newGseaBubblePlot(
  name: string,
  gseaDot: IGseaBubble,
  opts: Partial<IGseaBubblePlot> = {}
): IGseaBubblePlot {
  const maxNes = Math.ceil(
    Math.max(
      ...gseaDot.nes.values.filter((v) => v >= 0).map((v) => Math.abs(v))
    )
  )

  const negNes = gseaDot.nes.values.filter((v) => v < 0)

  const minNes =
    negNes.length > 0
      ? Math.ceil(Math.max(...negNes.map((v) => Math.abs(v))))
      : 0

  console.log('maxNes:', maxNes, 'minNes:', minNes)

  let {
    style = 'gsea-bubble-plot',
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

export function GseaBubbleProvider({
  plot,
  children,
}: {
  plot?: IGseaBubblePlot

  children: ReactNode
}) {
  const [_plot, setPlot] = useState<IGseaBubblePlot | undefined>(plot)

  return (
    <GseaBubbleContext.Provider
      value={{
        plot: _plot,
        displayProps: _plot?.props ?? DEFAULT_GSEA_DOT_PROPS,
        setPlot,
      }}
    >
      {children}
    </GseaBubbleContext.Provider>
  )
}
