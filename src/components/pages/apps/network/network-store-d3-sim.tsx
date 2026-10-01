import { IPos } from '@/interfaces/pos'
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force'

import { COLOR_BLACK } from '@/lib/color/color'
import { getColorMap } from '@/lib/color/colormap'
import { useSVG } from '@/providers/svg-provider'
import * as d3 from 'd3'
import { quadtree, Quadtree } from 'd3-quadtree'
import { useEffect, useMemo, useRef, useState } from 'react'
import { nodeRadiusFunc } from '../matcalc/apps/heatmap/svg/cell-svg'
import { INetworkSettings, useNetworkSettings } from './network-settings-store'
import { IEdge, IGroup, INode, useNetwork } from './network-store'
import { useUserData } from './network-user-data-store'

export type NodeView = 'default' | 'hidden' | 'translucent'

export interface IRenderNode extends INode {
  //group: IGroup
  view: NodeView
}

export interface IRenderEdge extends Omit<IEdge, 'source' | 'target'> {
  view: NodeView
  source: string | INode
  target: string | INode
}

type SimulationStatus = 'idle' | 'running' | 'finished'

export function useNetworkD3Sim() {
  const { ref } = useSVG()
  const { settings } = useNetworkSettings()
  const { settings: userData } = useUserData()

  const { network, groups, nodes } = useNetwork()

  const [tree, setTree] = useState<Quadtree<IRenderNode> | null>(null)
  const [status, setStatus] = useState<SimulationStatus>('idle')
  const currentNetworkId = useRef(network?.id ?? '')

  const groupMap = useMemo(
    () => new Map<string, IGroup>(groups.map((group) => [group.id, group])),
    [groups]
  )

  const userLabelSet = useMemo(
    () =>
      new Set(
        userData.labels.ids
          .filter((x) => x.length > 0)
          .map((x) => x.toLowerCase())
      ),
    [userData.labels.ids]
  )

  // how to label each node
  const nodeLabelMap = useMemo(() => {
    if (!network) {
      return new Map()
    }
    return new Map<string, string>(
      network.nodes.map((node) => [
        node.id,
        getNodeText(node, nodes.label.field, groupMap),
      ])
    )
  }, [network?.nodes, nodes.label.field])

  const renderNodes: IRenderNode[] = useMemo(() => {
    if (!network) {
      return []
    }

    console.log('renderNodes computation')

    return network.nodes.map((node) => {
      let view: NodeView = groupMap.get(node.groupId)?.show
        ? 'default'
        : 'hidden'

      if (
        settings.plot.nodes.view.mode === 'labelled' &&
        !showNodeLabel(
          node,
          userLabelSet,
          settings.plot.nodes.labels.showAll,
          userData.labels.mode
        )
      ) {
        view = settings.plot.nodes.view.hidden.show ? 'translucent' : 'hidden'
      }

      return {
        ...node,
        group: groupMap.get(node.groupId),
        view,
      }
    })
  }, [
    network?.nodes,
    groupMap,
    userLabelSet,
    settings.plot.nodes.view.mode,
    settings.plot.nodes.labels.showAll,
    settings.plot.nodes.view.hidden.show,
    userData.labels.mode,
  ])

  const renderNodeMap = useMemo(() => {
    return new Map(renderNodes.map((node) => [node.id, node]))
  }, [renderNodes])

  const nodeEdgeMap = useMemo(() => {
    if (!network?.edges || network.edges.length === 0) {
      return new Map<string, Set<string>>()
    }

    const map = new Map<string, Set<string>>()

    for (const edge of network.edges) {
      if (!map.has(edge.source)) {
        map.set(edge.source, new Set())
      }
      if (!map.has(edge.target)) {
        map.set(edge.target, new Set())
      }

      map.get(edge.source)?.add(edge.id)
      map.get(edge.target)?.add(edge.id)
    }

    return map
  }, [network?.edges])

  const renderEdges: IRenderEdge[] = useMemo(() => {
    if (!network) {
      return []
    }

    return network.edges.map((edge) => {
      let view = 'default'

      const sourceNode = renderNodeMap.get(edge.source)
      const targetNode = renderNodeMap.get(edge.target)

      if (settings.plot.edges.mode === 'labelled') {
        // to view an edge, both nodes must be in the 'default' view
        if (sourceNode?.view !== 'default' || targetNode?.view !== 'default') {
          view = 'hidden'
        }
      } else if (
        sourceNode?.view === 'translucent' ||
        targetNode?.view === 'translucent'
      ) {
        // if all edges are on, if one of the connecting nodes
        // is translucent, the edge should also be translucent
        view = 'translucent'
      } else if (
        sourceNode?.view === 'hidden' ||
        targetNode?.view === 'hidden'
      ) {
        // if one of the connecting nodes is hidden, the edge should also be hidden
        view = 'hidden'
      } else {
        view = 'default'
      }

      return { ...edge, view } as IRenderEdge
    })
  }, [network?.edges, renderNodeMap, settings.plot.edges.mode])

  const renderEdgeMap = useMemo(() => {
    return new Map(renderEdges.map((edge) => [edge.id, edge]))
  }, [renderEdges])

  const radiusMap = useMemo(() => {
    if (!network?.nodes || network.nodes.length === 0) {
      return new Map<string, number>()
    }

    const nodeRadiusScale = nodeRadiusFunc(
      settings.plot.nodes.radius,
      settings.plot.nodes.scale.mode
    )

    return new Map<string, number>(
      network.nodes.map((node) => [
        node.id,
        nodeRadiusScale((node.size ?? 0) / nodes.metricLim1.max),
      ])
    )
  }, [
    network?.nodes,
    settings.plot.nodes.radius,
    settings.plot.nodes.scale.mode,
    nodes.metricLim1.max,
  ])

  const nodeColorMap = useMemo(() => {
    if (!network?.nodes || network.nodes.length === 0) {
      return new Map<string, string>()
    }

    switch (settings.plot.nodes.color.mode) {
      case 'group':
        return new Map(
          network.nodes.map((node) => [
            node.id,
            groupMap.get(node.groupId)?.color ?? COLOR_BLACK,
          ])
        )

      default:
        const colorMap = getColorMap(settings.plot.nodes.color.cmap)

        return new Map(
          network.nodes.map((node) => [
            node.id,
            colorMap.getHexColor(node.size2 ?? 0) ?? COLOR_BLACK,
          ])
        )
    }
  }, [
    settings.plot.nodes.color.mode,
    groupMap,
    settings.plot.nodes.color.cmap,
    network?.nodes,
  ])

  // const canvasCoordinates = useMemo(
  //   () => d3ToCanvasSpace(coordinates, d3Size, radiusMap, settings),
  //   [coordinates, d3Size, radiusMap, settings]
  // )

  useEffect(() => {
    if (!ref.current || !network) {
      return
    }

    setStatus('running')
    currentNetworkId.current = network.id

    // 2. Clone the structure out into D3-friendly array mutations
    // const nodes = network.nodes.map((node, ni) => {
    //   const angle = ni * 0.5 // Spread out the placements linearly
    //   const distance = SCATTER_RADIUS * Math.sqrt(ni + 1) // Expand outwards proportionally

    //   return {
    //     ...node,
    //     x: size.w / 2 + distance * Math.cos(angle),
    //     y: size.h / 2 + distance * Math.sin(angle),
    //   }
    // })

    const nodes = renderNodes.map((node) => ({
      ...node,
    }))

    const edges = renderEdges.map((edge) => ({ ...edge }))

    // let frame = 0

    // const leftWall = -size.w / 2
    // const rightWall = size.w / 2
    // const topWall = -size.h / 2
    // const bottomWall = size.h / 2

    // 1. Initialize the Link Force first so we can conditionally configure it

    const svg = d3.select(ref.current)

    // get the main container for network nodes
    const g = svg.select('#network')

    g.selectAll('*').remove()

    // Main container
    // const g = svg.append('g')

    // Zoom
    // const zoom = d3
    //   .zoom<SVGSVGElement, unknown>()
    //   .scaleExtent([0.1, 5])
    //   .on('zoom', (event) => {
    //     g.attr('transform', event.transform)
    //   })

    // svg.call(zoom)

    // Edges
    const link = g
      .append('g')
      .attr('id', 'edges')
      .attr('class', 'edges')
      .selectAll<SVGLineElement, IRenderEdge>('line')
      .data(edges)
      .join('line')

    link
      .attr('id', (d) => `edge-${d.id}`)
      .attr('class', 'edge')
      .attr('stroke', settings.plot.edges.line.value)
      .attr('stroke-opacity', (d) =>
        d.view === 'translucent'
          ? settings.plot.nodes.view.hidden.opacity
          : settings.plot.edges.line.opacity
      )
      .attr('stroke-width', (d) => d.strength * settings.plot.edges.scale)

    // Nodes
    const node = g
      .append('g')
      .attr('id', 'nodes')
      .attr('class', 'nodes')
      .selectAll<SVGGElement, IRenderNode>('g')
      .data(nodes, (d) => d.id)
      .join('g')

    node
      .attr('id', (d) => `node-${d.id}`)
      .attr('class', 'node')
      .append('circle')
      .attr('id', (d) => `node-circle-${d.id}`)
      .attr('class', 'node-circle')
      .attr('r', (d) => radiusMap.get(d.id))
      .attr('fill', (d) => nodeColorMap.get(d.id))
      .attr('fill-opacity', (d) =>
        d.view === 'translucent'
          ? settings.plot.nodes.view.hidden.opacity
          : settings.plot.nodes.color.opacity
      )
      .attr('stroke', (d) =>
        settings.plot.nodes.line.autoColor && settings.plot.nodes.line.show
          ? nodeColorMap.get(d.id)
          : undefined
      )

    node
      .append('text')
      .attr('id', (d) => `node-text-${d.id}`)
      .attr('class', 'node-text')
      .text((d) => nodeLabelMap.get(d.id) ?? '')

    const linkForce = forceLink<INode, IRenderEdge>(edges)
      .id((d: INode) => d.id)
      .distance(settings.layout.linkDistance)

    // Conditionally apply custom strength or let D3 use its default internal formula
    if (settings.layout.useStrength) {
      linkForce.strength((d: IRenderEdge) => d.strength)
    }

    // 3. Initialize the D3 Force Engine
    const simulation = forceSimulation(nodes)
      //.alphaDecay(0.05)
      .force('charge', forceManyBody().strength(settings.layout.chargeStrength))
      .force(
        'center',
        forceCenter(
          settings.plot.size.w / 2 + settings.plot.margin.left,
          settings.plot.size.h / 2 + settings.plot.margin.top
        )
      )
      .force('link', linkForce)
    // .force('boundary-elastic', () => {
    //   const strength = 0.2

    //   for (let node of nodes) {
    //     // Apply boundary elastic force logic here

    //     if (node.x < leftWall) {
    //       node.vx += strength * (leftWall - node.x)
    //     }
    //     if (node.x > rightWall) {
    //       node.vx -= strength * (rightWall - node.x)
    //     }
    //     if (node.y < topWall) {
    //       node.vy += strength * (topWall - node.y)
    //     }
    //     if (node.y > bottomWall) {
    //       node.vy -= strength * (bottomWall - node.y)
    //     }
    //   }
    // })

    // 4. Stream layout coordinates straight back into the store on every frame tick
    simulation.on('tick', () => {
      node.attr('transform', (d) => `translate(${d.x}, ${d.y})`)

      link
        .attr('x1', (d) => {
          return (d.source as INode).x!
        })
        .attr('y1', (d) => (d.source as INode).y!)
        .attr('x2', (d) => (d.target as INode).x!)
        .attr('y2', (d) => (d.target as INode).y!)
    })

    simulation.on('end', () => {
      const maxRadius = Math.max(...Array.from(radiusMap.values()))

      if (settings.plot.autoFit) {
        const d3XBounds = {
          xMin: d3.min(nodes, (d) => d.x) - maxRadius,
          xMax: d3.max(nodes, (d) => d.x) + maxRadius,
        }

        const d3YBounds = {
          yMin: d3.min(nodes, (d) => d.y) - maxRadius,
          yMax: d3.max(nodes, (d) => d.y) + maxRadius,
        }

        const d3Size = {
          w: d3XBounds.xMax - d3XBounds.xMin,
          h: d3YBounds.yMax - d3YBounds.yMin,
        }

        const plotScale = {
          x: settings.plot.size.w / d3Size.w,
          y: settings.plot.size.h / d3Size.h,
        }

        const mid = {
          x: (d3XBounds.xMin + d3XBounds.xMax) / 2,
          y: (d3YBounds.yMin + d3YBounds.yMax) / 2,
        }

        const plotMid = {
          x: settings.plot.size.w / 2 + settings.plot.margin.left,
          y: settings.plot.size.h / 2 + settings.plot.margin.top,
        }

        const toPlot = (x: number, y: number) => ({
          x: (x - mid.x) * plotScale.x + plotMid.x,
          y: (y - mid.y) * plotScale.y + plotMid.y,
        })

        node
          .transition()
          .duration(1000) // Time in milliseconds
          .ease(d3.easeCubicInOut) // Smooth acceleration/deceleration
          .attr('transform', (d) => {
            const p = toPlot(d.x, d.y)
            return `translate(${p.x}, ${p.y})`
          })

        link
          .transition()
          .duration(1000) // Time in milliseconds
          .ease(d3.easeCubicInOut) // Smooth acceleration/deceleration
          .attr(
            'x1',
            (d) => toPlot((d.source as INode).x!, (d.source as INode).y!).x
          )
          .attr(
            'y1',
            (d) => toPlot((d.source as INode).x!, (d.source as INode).y!).y
          )
          .attr(
            'x2',
            (d) => toPlot((d.target as INode).x!, (d.target as INode).y!).x
          )
          .attr(
            'y2',
            (d) => toPlot((d.target as INode).x!, (d.target as INode).y!).y
          )

        for (let d of nodes) {
          const p = toPlot(d.x, d.y)
          d.x = p.x
          d.y = p.y
        }
      }

      if (settings.plot.nodes.clamp) {
        const clampX = (x: number, y: number) => ({
          x: Math.max(
            settings.plot.margin.left + maxRadius,
            Math.min(
              settings.plot.size.w + settings.plot.margin.left - maxRadius,
              x
            )
          ),

          y: Math.max(
            settings.plot.margin.top + maxRadius,
            Math.min(
              settings.plot.size.h + settings.plot.margin.top - maxRadius,
              y
            )
          ),
        })

        node
          .transition()
          .duration(1000) // Time in milliseconds
          .ease(d3.easeCubicInOut) // Smooth acceleration/deceleration
          .attr('transform', (d) => {
            const p = clampX(d.x, d.y)
            return `translate(${p.x}, ${p.y})`
          })

        link
          .transition()
          .duration(1000) // Time in milliseconds
          .ease(d3.easeCubicInOut) // Smooth acceleration/deceleration
          .attr(
            'x1',
            (d) => clampX((d.source as INode).x!, (d.source as INode).y!).x
          )
          .attr(
            'y1',
            (d) => clampX((d.source as INode).x!, (d.source as INode).y!).y
          )
          .attr(
            'x2',
            (d) => clampX((d.target as INode).x!, (d.target as INode).y!).x
          )
          .attr(
            'y2',
            (d) => clampX((d.target as INode).x!, (d.target as INode).y!).y
          )

        for (let d of nodes) {
          const p = clampX(d.x, d.y)
          d.x = p.x
          d.y = p.y
        }
      }

      setTree(
        quadtree<IRenderNode>(
          nodes,
          (c) => c.x,
          (c) => c.y
        )
      )

      // if (nodes.length > 0) {
      //   if (nodes.length === 0) return
      //   // Extract all final positions
      //   const xVals = nodes.map((n: any) => n.x)
      //   const yVals = nodes.map((n: any) => n.y)
      //   const minX = Math.min(...xVals)
      //   const maxX = Math.max(...xVals)
      //   const minY = Math.min(...yVals)
      //   const maxY = Math.max(...yVals)
      //   const width = maxX - minX
      //   const height = maxY - minY
      //   // keep coordinates centered around 0,
      //   // the plotter will move them to center of canvas
      //   const coordinates: Record<string, IPos> = Object.fromEntries(
      //     nodes.map((node) => [
      //       node.id,
      //       {
      //         x: node.x,
      //         y: node.y,
      //       },
      //     ])
      //   )
      //   //
      //   updateCoordinates(coordinates, { w: width, h: height })
      // }
      //onFinished?.()

      setStatus('finished')
    })

    // 5. Hard lifecycle boundary: If the hook unmounts or options change, kill the simulation loop immediately
    return () => {
      simulation.stop()
    }
  }, [
    network,
    radiusMap,
    settings.plot.autoFit,
    settings.plot.nodes.clamp,
    settings.plot.margin,
    settings.layout.chargeStrength,
    settings.layout.linkDistance,
    settings.plot.crosshair.search.radius,
    setTree,
  ])

  return {
    renderNodes,
    renderNodeMap,
    renderEdges,
    renderEdgeMap,
    nodeEdgeMap,
    radiusMap,
    nodeLabelMap,
    nodeColorMap,
    tree,
    status,
  }
}

export function showNodeLabel(
  node: INode,
  labelSet: Set<string>,
  showAll: boolean,
  mode: 'partial' | 'exact'
) {
  const found =
    inNodeData(node, labelSet, mode) || labelsInNodeIds(node, labelSet)

  // if showAll is true, we show the label only if it is not found in the node data or node ids
  // if showAll is false, we show the label only if it is found in the node data or node ids
  // therefore we just check if showAll is different from found because that captures both cases correctly
  const showLabel = showAll !== found

  return showLabel
}

export function labelsInNodeIds(node: INode, labelSet: Set<string>): boolean {
  return (
    inLabelSet(node.id, labelSet, 'exact') ||
    inLabelSet(node.id2, labelSet, 'exact')
  )
}

export function inNodeData(
  node: INode,
  labelSet: Set<string>,
  mode: 'partial' | 'exact'
) {
  return Object.values(node.data)
    .filter((d) => typeof d === 'string')
    .some((d) => inLabelSet(d.toString(), labelSet, mode))
}

export function inLabelSet(
  text: string,
  labelSet: Set<string>,
  mode: 'partial' | 'exact'
): boolean {
  text = text.toLowerCase().trim()

  if (mode === 'exact') {
    return labelSet.has(text)
  }

  // check if anything in label set is within the text
  for (const label of labelSet) {
    if (text.includes(label)) {
      return true
    }
  }

  return false
}

/**
 * Get the text for a specific field of a node.
 *
 * @param node The node object.
 * @param field The field name to retrieve the text from.
 * @returns The text value of the specified field.
 */
export function getNodeText(
  node: INode,
  field: string,
  groupMap: Map<string, IGroup>
): string {
  switch (field) {
    case 'id':
      return node.id
    case 'id2':
      return node.id2
    case 'group':
      return groupMap.get(node.groupId)?.name ?? ''
    default:
      let value = node.data[field]

      if (typeof value === 'number') {
        value = value.toString()
      }

      return value ?? ''
  }
}

// function getNodeText(node: INode, settings: INetworkSettings): string {
//   switch (settings.plot.nodes.labels.type) {
//     case 'label':
//       return node.label
//     case 'name':
//       return node.name
//     case 'group':
//       return node.group
//     case 'size':
//       return node.size.toString()
//     case 'id':
//       return node.id
//     case 'id2':
//       return node.id2
//     default:
//       return ''
//   }
// }

export function getTextAnchor(settings: INetworkSettings, radius: number) {
  let textAnchor: 'start' | 'middle' | 'end' = 'middle'
  let baseline: 'auto' | 'middle' | 'hanging' = 'middle'

  let offset: IPos = { x: 0, y: 0 }

  switch (settings.plot.nodes.labels.position) {
    case 'left':
      textAnchor = 'end'
      offset = { x: -radius - settings.plot.nodes.labels.offset, y: 0 }
      break
    case 'right':
      textAnchor = 'start'
      offset = { x: radius + settings.plot.nodes.labels.offset, y: 0 }
      break
    case 'below':
      textAnchor = 'middle'
      baseline = 'hanging'
      offset = { x: 0, y: radius + settings.plot.nodes.labels.offset }
      break
    case 'above':
      textAnchor = 'middle'
      baseline = 'auto'
      offset = { x: 0, y: -radius - settings.plot.nodes.labels.offset }
      break
    default:
      textAnchor = 'middle'
      break
  }
  return { textAnchor, baseline, offset }
}
