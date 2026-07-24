import { IPaintProps } from '@/components/plot/svg-props'
import { IDBEntity } from '@/interfaces/db-entity'
import { makeUuid } from '@/lib/id'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { BasePlot } from '../matcalc/history/history-provider/history-types'
import {
  IOutputGraph,
  IOutputLink,
  IOutputNode,
  useSankeyLayout,
} from './sankey-layout'
import { useSankeySettings } from './sankey-settings-store'

export interface ISankeyNode {
  id: string
  label: string
  column: number
  fill?: IPaintProps
}

// export interface ILayoutNode extends ISankeyNode {
//   // x: number
//   // y: number
//   // h: number
//   x0: number
//   x1: number
//   y0: number
//   y1: number
//   height: number
// }

export interface ISankeyLink {
  source: string
  target: string
  value: number
  fill?: IPaintProps
}

export interface ILayoutLink {
  source: { id: string }
  target: { id: string }
  value: number
  fill?: IPaintProps
  y0: number
  y1: number
  width: number
}

export interface ISankey extends IDBEntity {
  nodes: ISankeyNode[]
  links: ISankeyLink[]
}

// export interface ISankeyDisplayOptions {
//   scale: number
//}

// export const DEFAULT_SETTINGS: ISankeyDisplayOptions = {
//   scale: 1,
// }

export interface ISankeyPlot extends BasePlot, ISankey {
  style: 'sankey'

  //props: ISankeyDisplayOptions
}

// export const DEFAULT_PLOT: ISankeyPlot = {
//   id: makeUuid(),
//   name: 'Sankey',
//   style: 'sankey',
//   groups: [],
//   actions: [],
//   type: 'plot',
//   createdAt: new Date().toISOString(),

//   // props: {
//   //   scale: 1,
//   // },

//   nodes: [
//     { id: 'A', label: 'Input A', column: 0 },
//     { id: 'B', label: 'Input B', column: 0 },
//     { id: 'Z', label: 'Input Z', column: 0 },
//     { id: 'C', label: 'Process', column: 1 },
//     { id: 'CC', label: 'Blob', column: 1 },
//     { id: 'D', label: 'Output 1', column: 2 },
//     { id: 'E', label: 'Output 2', column: 2 },
//   ],

//   links: [
//     { source: 'A', target: 'C', value: 5 },
//     { source: 'B', target: 'C', value: 3 },
//     { source: 'Z', target: 'C', value: 1 },
//     { source: 'C', target: 'D', value: 4 },
//     { source: 'C', target: 'E', value: 5 },
//     { source: 'CC', target: 'E', value: 1 },
//   ],
// }

export function newSankeyPlot(
  name: string,
  nodes: ISankeyNode[] = [],
  links: ISankeyLink[] = [],
  opts: Partial<ISankeyPlot> = {}
): ISankeyPlot {
  const { actions = [], groupRows: groups = [] } = opts

  // Add sankey to name if not already present for better file naming when saving images
  if (!name.toLowerCase().includes('sankey')) {
    name = `Sankey ${name}`
  }

  return {
    id: makeUuid(),
    style: 'sankey',
    name,
    nodes,
    links,
    groupRows: groups,
    actions,
    type: 'plot',
    createdAt: new Date().toISOString(),
  }
}

export interface SankeyPropsContextType {
  plot: ISankeyPlot | undefined

  graph: IOutputGraph | undefined
  setPlot: (plot: ISankeyPlot) => void
  updateNode: (node: IOutputNode) => void
  updateLink: (link: IOutputLink) => void
  updateLinks: (node: IOutputNode, links: IOutputLink[]) => void
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
  plot,
  children,
}: {
  plot?: ISankeyPlot
  children: ReactNode
}) {
  const { createSankeyLayout } = useSankeyLayout()
  const { settings } = useSankeySettings()

  const [_plot, setPlot] = useState<ISankeyPlot | undefined>(plot)

  const [graph, setGraph] = useState<IOutputGraph | undefined>(undefined)

  useEffect(() => {
    setPlot(plot)
  }, [plot])

  useEffect(() => {
    if (!_plot || !_plot.nodes || !_plot.links) {
      return
    }

    const { graph } = createSankeyLayout(_plot)

    //setLayoutMap(layoutMap)

    setGraph(graph)
    //setLayoutMap(layoutMap)
  }, [_plot?.nodes, _plot?.links, settings]) // we want to recalculate the layout when the nodes or links change, but also when the optimization settings change, since that affects the layout

  function updateNode(node: IOutputNode) {
    if (!graph) {
      return
    }

    setGraph({
      ...graph,
      nodes: new Map(graph.nodes).set(node.id, node),
    })
  }

  function updateLink(link: IOutputLink) {
    if (!graph) {
      return
    }

    // we need to replace the updated link with the new one, but keep the source and target nodes the same (since they contain the layout information)

    const updatedLinks = graph.links.map((l) => {
      if (l.source.id === link.source.id && l.target.id === link.target.id) {
        return link
      }

      return l
    })

    setGraph({
      ...graph,
      links: updatedLinks,
    })
  }

  function updateLinks(node: IOutputNode, links: IOutputLink[]) {
    if (!graph) {
      return
    }

    // we need to replace the updated links with the new ones, but keep the source and target nodes the same (since they contain the layout information)

    // Make a map of the new links for easy lookup
    const newLinkMap = new Map<string, IOutputLink>()
    for (const link of links) {
      newLinkMap.set(`${link.source.id}-${link.target.id}`, link)
    }

    // Create a new array of links by replacing the old links with the new ones
    const updatedLinks = graph.links.map((link) => {
      const key = `${link.source.id}-${link.target.id}`
      return newLinkMap.get(key) || link
    })

    setGraph({
      ...graph,
      nodes: new Map(graph.nodes).set(node.id, node),
      links: updatedLinks,
    })
  }

  return (
    <SankeyContext.Provider
      value={{
        plot: _plot,
        graph,
        setPlot,
        updateNode,
        updateLink,
        updateLinks,
      }}
    >
      {children}
    </SankeyContext.Provider>
  )
}
