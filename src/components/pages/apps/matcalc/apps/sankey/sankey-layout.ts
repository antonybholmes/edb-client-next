import { TAB10_PALETTE } from '@/lib/color/palette'
import { sankey, SankeyGraph, SankeyLink, SankeyNode } from 'd3-sankey'
import {
  ILayoutNode,
  ISankey,
  ISankeyLink,
  ISankeyNode,
} from './sankey-provider'
import { useSankeySettings } from './sankey-settings-store'

export type IOutputNode = SankeyNode<ISankeyNode, ISankeyLink>
export type IOutputLink = SankeyLink<ISankeyNode, ISankeyLink>

export type IOutputGraph = SankeyGraph<IOutputNode, IOutputLink>

export function useSankeyLayout() {
  const { settings } = useSankeySettings()

  // function initialLayout(
  //   sankey: ISankey,
  //   opts: {
  //     steps?: { removeZeroValueLinks?: boolean; relaxationFactor?: number }
  //   } = {}
  // ) {
  //   // add a color to each node if not already present

  //   const nodes = sankey.nodes.map((n) => ({
  //     ...n,
  //     color: n.color ?? TAB10_PALETTE[n.column % TAB10_PALETTE.length],
  //   }))

  //   const nodeMap = new Map<string, ISankeyNode>(nodes.map((n) => [n.id, n]))

  //   const numCols = Math.max(...sankey.nodes.map((n) => n.column)) + 1
  //   const xSpacing =
  //     numCols > 1 ? (settings.width - settings.nodeWidth) / (numCols - 1) : 0

  //   // Compute node totals
  //   const nodeMaxTotalMap = new Map<string, number>()

  //   // for each node, compute the total incoming and outgoing flow and
  //   // take the max of the two to determine the node height
  //   for (const node of nodes) {
  //     const incoming = sankey.links
  //       .filter((l) => l.target === node.id)
  //       .reduce((a, b) => a + b.value, 0)

  //     const outgoing = sankey.links
  //       .filter((l) => l.source === node.id)
  //       .reduce((a, b) => a + b.value, 0)

  //     nodeMaxTotalMap.set(node.id, Math.max(incoming, outgoing))
  //   }

  //   // Compute scaling

  //   // Arrange nodes by column
  //   const byColumn = new Map<number, ISankeyNode[]>()

  //   for (let i = 0; i < numCols; i++) {
  //     byColumn.set(i, [])
  //   }

  //   for (const node of nodes) {
  //     byColumn.get(node.column)!.push(node)
  //   }

  //   let scale = Infinity

  //   for (const column of byColumn.values()) {
  //     let total = 0

  //     for (const node of column) {
  //       total += nodeMaxTotalMap.get(node.id) ?? 0
  //     }

  //     // Allow for padding between nodes
  //     total += (column.length - 1) * settings.padding

  //     scale = Math.min(scale, settings.height / total)
  //   }

  //   return {
  //     scale,
  //     nodeMaxTotalMap,
  //     byColumn,
  //     xSpacing,
  //     nodes,
  //     nodeMap,
  //     numCols,
  //   }
  // }

  // function createVerticalLayout(
  //   nodeMaxTotalMap: Map<string, number>,
  //   byColumn: Map<number, ISankeyNode[]>,
  //   xSpacing: number,
  //   numCols: number,
  //   scale: number,
  //   setInitialY: boolean = true
  // ) {
  //   const layout = new Map<string, ILayoutNode>()

  //   // Initial Vertical layout
  //   for (let c = 0; c < numCols; c++) {
  //     let y = 0

  //     for (const node of byColumn.get(c)!) {
  //       const h = (nodeMaxTotalMap.get(node.id) ?? 0) * scale

  //       layout.set(node.id, {
  //         ...node,
  //         x: c * xSpacing,
  //         y,
  //         h,
  //       })

  //       if (setInitialY) {
  //         y += h + settings.padding
  //       }
  //     }
  //   }

  //   console.log('vertical layout', layout)
  //   return layout
  // }

  // function optimizeLayout(
  //   sankey: ISankey,
  //   numCols: number,
  //   byColumn: Map<number, ISankeyNode[]>,
  //   layoutMap: Map<string, ILayoutNode>
  // ) {
  //   let alpha = settings.optimization.relaxation.alpha
  //   for (let step = 0; step < settings.optimization.steps; step++) {
  //     // Left → Right
  //     for (let col = 1; col < numCols; col++) {
  //       if (byColumn.has(col)) {
  //         const nodes = byColumn.get(col)!
  //         const layoutNodes = nodes.map((n) => layoutMap.get(n.id)!)

  //         //reorderColumn(layoutNodes, sankey, layoutMap, true)
  //         relaxColumn(layoutNodes, sankey, layoutMap, alpha, true)
  //         //layoutNodes.sort((a, b) => a.y - b.y)

  //         resolveCollisions(layoutNodes, settings.padding)
  //       }
  //     }

  //     // Right → Left
  //     for (let col = numCols - 2; col >= 0; col--) {
  //       if (byColumn.has(col)) {
  //         const nodes = byColumn.get(col)!
  //         const layoutNodes = nodes.map((n) => layoutMap.get(n.id)!)

  //         //reorderColumn(layoutNodes, sankey, layoutMap, false)
  //         relaxColumn(layoutNodes, sankey, layoutMap, alpha, false)
  //         //layoutNodes.sort((a, b) => a.y - b.y)

  //         resolveCollisions(layoutNodes, settings.padding)
  //       }
  //     }

  //     alpha *= settings.optimization.relaxation.decay
  //   }
  // }

  function createSankeyLayout(
    sp: ISankey,
    opts: {
      steps?: { removeZeroValueLinks?: boolean; relaxationFactor?: number }
    } = {}
  ) {
    // const { scale, nodeMaxTotalMap, byColumn, xSpacing, numCols } =
    //   initialLayout(sp, opts)

    // if optimization is off, we will set an initial layout but skip the optimization steps
    // const layoutMap = createVerticalLayout(
    //   nodeMaxTotalMap,
    //   byColumn,
    //   xSpacing,
    //   numCols,
    //   scale,
    //   true //!settings.optimization.on
    // )

    // console.log('initial layout', layoutMap)

    // if (settings.optimization.on) {
    //   optimizeLayout(sp, numCols, byColumn, layoutMap)
    // }

    const nodes = sp.nodes.map((n) => ({
      ...n,
      color: n.color ?? TAB10_PALETTE[n.column % TAB10_PALETTE.length],
    }))

    let layout = sankey<ISankeyNode, ISankeyLink>()
      .nodeId((d) => d.id)
      .nodeWidth(settings.nodes.width)
      .nodePadding(settings.nodes.gap)
      .extent([
        [0, 0],
        [settings.width, settings.height],
      ])

    if (settings.nodes.useColumns) {
      layout = layout.nodeAlign((n) => {
        return n.column
      })
    }

    const graph = layout({
      nodes: nodes.map((d) => ({ ...d })),
      links: sp.links.map((d) => ({ ...d })),
    }) as IOutputGraph

    const layoutMap = new Map<string, ILayoutNode>(
      graph.nodes.map((n) => [n.id, n] as [string, ILayoutNode])
    )

    return { graph, layoutMap }
  }

  return { createSankeyLayout }
}

// function relaxColumn(
//   nodes: ILayoutNode[],
//   sankey: ISankey,
//   layoutMap: Map<string, ILayoutNode>,
//   alpha: number,
//   useIncoming: boolean = true
// ) {
//   for (const node of nodes) {
//     let weightedSum = 0
//     let totalWeight = 0

//     const links = useIncoming
//       ? sankey.links.filter((l) => l.target === node.id)
//       : sankey.links.filter((l) => l.source === node.id)

//     for (const link of links) {
//       const neighbor = useIncoming
//         ? layoutMap.get(link.source)!
//         : layoutMap.get(link.target)!

//       weightedSum += nodeCenter(neighbor) * link.value
//       totalWeight += link.value
//     }

//     if (totalWeight === 0) {
//       continue
//     }

//     const desiredCenter = weightedSum / totalWeight

//     node.y = alpha * (desiredCenter - node.h / 2)
//   }
// }

// function resolveCollisions(nodes: ILayoutNode[], padding: number) {
//   nodes.sort((a, b) => a.y - b.y)

//   let y = 0

//   for (const node of nodes) {
//     node.y = Math.max(node.y, y)
//     y = node.y + node.h + padding
//   }
// }

// function nodeCenter(node: ILayoutNode) {
//   return node.y + node.h / 2
// }

// function reorderColumn(
//   nodes: ILayoutNode[],
//   sankey: ISankey,
//   layoutMap: Map<string, ILayoutNode>,
//   useIncoming: boolean
// ) {
//   nodes.sort((a, b) => {
//     const baryA = barycenter(a)
//     const baryB = barycenter(b)
//     return baryA - baryB
//   })

//   function barycenter(node: ILayoutNode): number {
//     const links = useIncoming
//       ? sankey.links.filter((l) => l.target === node.id)
//       : sankey.links.filter((l) => l.source === node.id)

//     if (links.length === 0) {
//       return nodeCenter(node)
//     }

//     let sum = 0
//     let weight = 0

//     for (const link of links) {
//       const other = useIncoming
//         ? layoutMap.get(link.source)!
//         : layoutMap.get(link.target)!

//       sum += nodeCenter(other) * link.value
//       weight += link.value
//     }

//     return sum / weight
//   }
// }
