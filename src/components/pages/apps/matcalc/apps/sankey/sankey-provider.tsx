import { makeUuid } from '@/lib/id'
import { createContext, useContext, type ReactNode } from 'react'
import { BasePlot } from '../../history/history-provider/history-types'

export interface ISankeyNode {
  id: string
  label: string
  column: number
}

export interface ISankeyLink {
  source: string
  target: string
  value: number
  color?: string
}

export interface ISankeyDisplayOptions {
  scale: number
}

export const DEFAULT_SETTINGS: ISankeyDisplayOptions = {
  scale: 1,
}

export interface SankeyPlot extends BasePlot {
  style: 'sankey'

  props: ISankeyDisplayOptions
  nodes: ISankeyNode[]
  links: ISankeyLink[]
}

export interface SankeyPropsContextType {
  displayProps: ISankeyDisplayOptions
  plot: SankeyPlot
}

export const DEFAULT_PLOT: SankeyPlot = {
  id: makeUuid(),
  name: 'Sankey Plot',
  style: 'sankey',
  groups: [],
  actions: [],
  type: 'plot',
  createdAt: Date.now(),

  props: {
    scale: 1,
  },
  nodes: [
    { id: 'A', label: 'Input A', column: 0 },
    { id: 'B', label: 'Input B', column: 0 },
    { id: 'C', label: 'Process', column: 1 },
    { id: 'D', label: 'Output 1', column: 2 },
    { id: 'E', label: 'Output 2', column: 2 },
  ],

  links: [
    { source: 'A', target: 'C', value: 5 },
    { source: 'B', target: 'C', value: 3 },
    { source: 'C', target: 'D', value: 4 },
    { source: 'C', target: 'E', value: 4 },
  ],
}

export function newSankeyPlot(
  name: string,
  nodes: ISankeyNode[] = [],
  links: ISankeyLink[] = [],
  opts: Partial<SankeyPlot> = {}
): SankeyPlot {
  const {
    style = 'sankey',
    props = { ...DEFAULT_SETTINGS },
    actions = [],
    groups = [],
  } = opts

  return {
    id: makeUuid(),
    ////path: '',
    style,
    name,
    nodes,
    links,
    groups,
    props,
    actions,
    type: 'plot',
    createdAt: Date.now(),
  }
}

export const SankeyContext = createContext<SankeyPropsContextType | undefined>(
  undefined
)

export function useSankey() {
  const ctx = useContext(SankeyContext)

  if (!ctx) {
    throw new Error(
      'useSankeyContext must be used within a SankeyContext.Provider'
    )
  }

  return ctx
}

export function SankeyProvider({
  plot = DEFAULT_PLOT,
  children,
}: {
  plot?: SankeyPlot
  children: ReactNode
}) {
  return (
    <SankeyContext.Provider value={{ displayProps: plot.props, plot }}>
      {children}
    </SankeyContext.Provider>
  )
}
