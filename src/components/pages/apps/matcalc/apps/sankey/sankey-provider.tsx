import { IDBEntity } from '@/interfaces/db-entity'
import { makeUuid } from '@/lib/id'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { BasePlot } from '../../history/history-provider/history-types'
import { IOutputGraph, useSankeyLayout } from './sankey-layout'
import { useSankeySettings } from './sankey-settings-store'

export interface ISankeyNode {
  id: string
  label: string
  column: number
  color?: string
}

export interface ILayoutNode extends ISankeyNode {
  // x: number
  // y: number
  // h: number
  x0: number
  x1: number
  y0: number
  y1: number
  height: number
}

export interface ISankeyLink {
  source: string
  target: string
  value: number
  color?: string
}

export interface ILayoutLink {
  source: { id: string }
  target: { id: string }
  value: number
  color?: string
  y0: number
  y1: number
  width: number
}

export interface ISankey extends IDBEntity {
  nodes: ISankeyNode[]
  links: ISankeyLink[]
}

export interface ISankeyDisplayOptions {
  scale: number
}

export const DEFAULT_SETTINGS: ISankeyDisplayOptions = {
  scale: 1,
}

export interface ISankeyPlot extends BasePlot, ISankey {
  style: 'sankey'

  props: ISankeyDisplayOptions
}

export const DEFAULT_PLOT: ISankeyPlot = {
  id: makeUuid(),
  name: 'Sankey',
  style: 'sankey',
  groups: [],
  actions: [],
  type: 'plot',
  createdAt: new Date().toISOString(),

  props: {
    scale: 1,
  },

  nodes: [
    { id: 'A', label: 'Input A', column: 0 },
    { id: 'B', label: 'Input B', column: 0 },
    { id: 'Z', label: 'Input Z', column: 0 },
    { id: 'C', label: 'Process', column: 1 },
    { id: 'CC', label: 'Blob', column: 1 },
    { id: 'D', label: 'Output 1', column: 2 },
    { id: 'E', label: 'Output 2', column: 2 },
  ],

  links: [
    { source: 'A', target: 'C', value: 5 },
    { source: 'B', target: 'C', value: 3 },
    { source: 'Z', target: 'C', value: 1 },
    { source: 'C', target: 'D', value: 4 },
    { source: 'C', target: 'E', value: 5 },
    { source: 'CC', target: 'E', value: 1 },
  ],
}

export function newSankeyPlot(
  name: string,
  nodes: ISankeyNode[] = [],
  links: ISankeyLink[] = [],
  opts: Partial<ISankeyPlot> = {}
): ISankeyPlot {
  const { props = { ...DEFAULT_SETTINGS }, actions = [], groups = [] } = opts

  return {
    id: makeUuid(),

    style: 'sankey',
    name,
    nodes,
    links,
    groups,
    props,
    actions,
    type: 'plot',
    createdAt: new Date().toISOString(),
  }
}

export interface SankeyPropsContextType {
  displayProps: ISankeyDisplayOptions
  plot: ISankeyPlot
  layoutMap: Map<string, ILayoutNode>
  // byColumn: Map<number, ISankeyNode[]>
  //numCols: number
  //scale: number
  graph: IOutputGraph | null
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
  plot?: ISankeyPlot
  children: ReactNode
}) {
  const { createSankeyLayout } = useSankeyLayout()
  const { settings } = useSankeySettings()

  //const [scale, setScale] = useState(1)
  const [layoutMap, setLayoutMap] = useState(new Map<string, ILayoutNode>())
  //const [byColumn, setByColumn] = useState(new Map<number, ISankeyNode[]>())
  //const [numCols, setNumCols] = useState(0)
  const [graph, setGraph] = useState<IOutputGraph | null>(null)

  useEffect(() => {
    const { graph, layoutMap } = createSankeyLayout(plot)
    //setScale(scale)
    setLayoutMap(layoutMap)
    //setByColumn(byColumn)
    //setNumCols(numCols)
    setGraph(graph)
    setLayoutMap(layoutMap)
  }, [plot.nodes, plot.links, settings]) // we want to recalculate the layout when the nodes or links change, but also when the optimization settings change, since that affects the layout

  return (
    <SankeyContext.Provider
      value={{
        displayProps: plot.props,
        plot,
        layoutMap,
        //byColumn,
        //scale,
        //numCols,
        graph,
      }}
    >
      {children}
    </SankeyContext.Provider>
  )
}
