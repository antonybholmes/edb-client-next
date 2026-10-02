import { IPos } from '@/interfaces/pos'
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force'

import { argMin } from '@/lib/math/argmin'
import { max } from '@/lib/math/math'
import { useSVG } from '@/providers/svg-provider'
import * as d3 from 'd3'
import { Quadtree, quadtree } from 'd3-quadtree'
import { useCallback } from 'react'
import { useNetworkSettings } from './network-settings-store'

import { BaseType } from 'd3'
import { create } from 'zustand'
import {
  getIsNodeLabelled,
  getNodeText,
  getTextAnchor,
  INode,
  IRenderEdge,
  IRenderNode,
  useNetwork,
} from './network-store'
import { useUserData } from './network-user-data-store'

type SimulationStatus = 'idle' | 'running' | 'finished'

interface INetworkD3SimSettings {
  status: SimulationStatus
  simNodes: IRenderNode[]
  tree: Quadtree<IRenderNode> | null
}

interface INetworkD3SimStore extends INetworkD3SimSettings {
  updateStatus: (status: SimulationStatus) => void
  updateSimNodes: (simNodes: IRenderNode[]) => void
  updateTree: (tree: Quadtree<IRenderNode> | null) => void
}

const DEFAULT_SETTINGS: INetworkD3SimSettings = {
  status: 'idle',
  simNodes: [],
  tree: null,
}

export const useNetworkD3SimStore = create<INetworkD3SimStore>()((set) => ({
  ...DEFAULT_SETTINGS,

  updateStatus: (status: SimulationStatus) => {
    set({ status })
  },
  updateSimNodes: (simNodes: IRenderNode[]) => {
    set({ simNodes })
  },
  updateTree: (tree: Quadtree<IRenderNode> | null) => {
    set({ tree })
  },
}))

export function useNetworkD3Sim() {
  const { ref } = useSVG()
  const { settings: networkSettings } = useNetworkSettings()
  const { settings: userData } = useUserData()
  const {
    network,
    nodes,
    renderEdges,
    radiusMap,
    renderNodes,
    nodeColorMap,
    renderNodeMap,
    userLabelSet,
    groupMap,
    renderEdgeMap,
    nodeEdgeMap,
  } = useNetwork()

  const status = useNetworkD3SimStore((state) => state.status)
  const simNodes = useNetworkD3SimStore((state) => state.simNodes)
  const tree = useNetworkD3SimStore((state) => state.tree)
  const updateStatus = useNetworkD3SimStore((state) => state.updateStatus)
  const updateSimNodes = useNetworkD3SimStore((state) => state.updateSimNodes)
  const updateTree = useNetworkD3SimStore((state) => state.updateTree)

  // const canvasCoordinates = useMemo(
  //   () => d3ToCanvasSpace(coordinates, d3Size, radiusMap, settings),
  //   [coordinates, d3Size, radiusMap, settings]
  // )

  const runSim = useCallback(() => {
    if (!ref.current || !network) {
      return
    }

    updateStatus('running')

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
    const networkNode = svg.select('#network')

    networkNode.selectAll('*').remove()

    // Main container
    const world = networkNode.append('g').attr('id', 'world')

    // Zoom
    // const zoom = d3
    //   .zoom<SVGSVGElement, unknown>()
    //   .scaleExtent([0.1, 5])
    //   .on('zoom', (event) => {
    //     g.attr('transform', event.transform)
    //   })

    // svg.call(zoom)

    // Edges
    const link = world
      .append('g')
      .attr('id', 'edges')
      .attr('class', 'edges')
      .selectAll<SVGLineElement, IRenderEdge>('line')
      .data(edges)
      .join('line')

    link
      .attr('id', (d) => `edge-${d.id}`)
      .attr('class', 'edge')
      .call((g) => formatEdge(g, null))
    // .attr('stroke', networkSettings.plot.edges.line.value)
    // .attr('stroke-opacity', (d) =>
    //   d.view === 'translucent'
    //     ? networkSettings.plot.nodes.view.hidden.opacity
    //     : networkSettings.plot.edges.line.opacity
    // )
    // .attr(
    //   'stroke-width',
    //   (d) => d.strength * networkSettings.plot.edges.scale
    // )

    // Nodes
    const node = world
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
      .call((g) => formatCircle(g))

    node
      .append('text')
      .attr('id', (d) => `node-text-${d.id}`)
      .attr('class', 'node-text')

      .call((g) => formatText(g))

    const linkForce = forceLink<INode, IRenderEdge>(edges)
      .id((d: INode) => d.id)
      .distance(networkSettings.layout.linkDistance)

    // Conditionally apply custom strength or let D3 use its default internal formula
    if (networkSettings.layout.useStrength) {
      linkForce.strength((d: IRenderEdge) => d.strength)
    }

    // 3. Initialize the D3 Force Engine
    const simulation = forceSimulation(nodes)
      //.alphaDecay(0.05)
      .force(
        'charge',
        forceManyBody().strength(networkSettings.layout.chargeStrength)
      )
      .force(
        'center',
        forceCenter(
          networkSettings.plot.size.w / 2 + networkSettings.plot.margin.left,
          networkSettings.plot.size.h / 2 + networkSettings.plot.margin.top
        )
      )
      .force('link', linkForce)

    const drag = d3
      .drag<SVGGElement, IRenderNode>()
      .filter((event) => {
        return event.button === 0 && event.ctrlKey
      })
      .on('start', (event, d) => {
        if (!event.active) {
          simulation.alphaTarget(0.3).restart()
        }
        d.fx = d.x ?? event.x
        d.fy = d.y ?? event.y
      })
      .on('drag', (event, d) => {
        d.fx = event.x
        d.fy = event.y
      })
      .on('end', (event, d) => {
        // drag event has ended
        if (!event.active) {
          simulation.alphaTarget(0)
        }
        d.fx = null
        d.fy = null
      })

    node.call(drag)

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
      console.log('Simulation ended')
      updateTree(
        quadtree<IRenderNode>(
          nodes,
          (c) => c.x,
          (c) => c.y
        )
      )

      updateSimNodes(nodes)
      updateStatus('finished')
    })
  }, [
    network,
    radiusMap,
    networkSettings,
    updateTree,
    updateSimNodes,
    updateStatus,
  ])

  // useEffect(() => {
  //   runSim()
  // }, [
  //   network,
  //   radiusMap,
  //   settings.plot.autoFit,
  //   settings.plot.margin,
  //   settings.layout.chargeStrength,
  //   settings.layout.linkDistance,
  //   settings.plot.crosshair.search.radius,
  //   setTree,
  // ])

  const autoFit = useCallback(() => {
    if (!ref.current) {
      return
    }

    const svg = d3.select(ref.current)

    const world = svg.select('#world')

    if (world.empty()) {
      return
    }

    const maxRadius = max([...radiusMap.values()])

    const d3XBounds = {
      xMin: d3.min(simNodes, (d) => d.x) - maxRadius,
      xMax: d3.max(simNodes, (d) => d.x) + maxRadius,
    }

    const d3YBounds = {
      yMin: d3.min(simNodes, (d) => d.y) - maxRadius,
      yMax: d3.max(simNodes, (d) => d.y) + maxRadius,
    }

    const d3Size = {
      w: d3XBounds.xMax - d3XBounds.xMin,
      h: d3YBounds.yMax - d3YBounds.yMin,
    }

    const plotScale = Math.min(
      (networkSettings.plot.size.w - 2 * maxRadius) / Math.max(d3Size.w, 1),
      (networkSettings.plot.size.h - 2 * maxRadius) / Math.max(d3Size.h, 1)
    )

    const d3Mid = {
      x: (d3XBounds.xMin + d3XBounds.xMax) / 2,
      y: (d3YBounds.yMin + d3YBounds.yMax) / 2,
    }

    const mid = {
      x: networkSettings.plot.size.w / 2 + networkSettings.plot.margin.left,
      y: networkSettings.plot.size.h / 2 + networkSettings.plot.margin.top,
    }

    const projectToView = (point: { x?: number; y?: number }): IPos => {
      const px = point.x ?? 0
      const py = point.y ?? 0

      return {
        x: (px - d3Mid.x) * plotScale + mid.x,
        y: (py - d3Mid.y) * plotScale + mid.y,
      }
    }

    const viewTransform = `translate(${mid.x}, ${mid.y}) scale(${plotScale}) translate(${-d3Mid.x}, ${-d3Mid.y})`

    // Keep the rendered transform and the pointer-hit quadtree in lockstep.
    // If the DOM transform is animated separately, the tree is left behind at the
    // final transform while the visible nodes are still in the in-between state.
    world.transition().duration(300).attr('transform', viewTransform)

    const nodes = simNodes.map((d) => {
      const p = projectToView(d)
      return {
        ...d,
        x: p.x,
        y: p.y,
      }
    })

    const idx = argMin(nodes.map((d) => d.x))

    console.log('what', nodes[idx])

    console.log(
      quadtree<IRenderNode>(
        nodes,
        (c) => c.x,
        (c) => c.y
      )
    )

    updateTree(
      quadtree<IRenderNode>(
        nodes,
        (c) => c.x,
        (c) => c.y
      )
    )
  }, [network, radiusMap, networkSettings, updateTree, simNodes])

  const formatCircle = useCallback(
    (g: d3.Selection<SVGCircleElement, IRenderNode, BaseType, unknown>) => {
      return g
        .attr('r', (d) => radiusMap.get(d.id))
        .attr('fill', (d) => nodeColorMap.get(d.id))
        .attr('fill-opacity', (d) => {
          const node = renderNodeMap.get(d.id)

          return !node || node.view !== 'translucent'
            ? networkSettings.plot.nodes.color.opacity
            : networkSettings.plot.nodes.view.translucent.opacity
        })
        .attr('stroke', (d) =>
          networkSettings.plot.nodes.line.autoColor &&
          networkSettings.plot.nodes.line.show
            ? nodeColorMap.get(d.id)
            : undefined
        )
        .attr('visibility', (d) => {
          const node = renderNodeMap.get(d.id)

          return !node || node.view !== 'hidden' ? 'visible' : 'hidden'
        })
    },
    [radiusMap, nodeColorMap, renderNodeMap, networkSettings]
  )

  const formatEdge = useCallback(
    (
      g: d3.Selection<SVGGElement, IRenderEdge, BaseType, unknown>,
      currentNode: INode
    ) => {
      const highlightedEdges =
        nodeEdgeMap.get(currentNode?.id) ?? new Set<string>()

      return g
        .attr('stroke', (d) => {
          return networkSettings.plot.edges.highlight &&
            highlightedEdges.has(d.id)
            ? 'var(--color-app-theme)'
            : networkSettings.plot.edges.line.value
        })
        .attr('stroke-opacity', (d) => {
          return (networkSettings.plot.edges.highlight &&
            highlightedEdges.has(d.id)) ||
            renderEdgeMap.get(d.id)?.view === 'normal'
            ? networkSettings.plot.edges.line.opacity
            : networkSettings.plot.nodes.view.translucent.opacity
        })
        .attr('stroke-width', (d) => {
          return Math.min(
            networkSettings.plot.edges.minWidth,
            d.strength *
              networkSettings.plot.edges.scale *
              (networkSettings.plot.edges.highlight &&
              highlightedEdges.has(d.id)
                ? 3
                : 1)
          )
        })
        .attr('visibility', (d) => {
          return highlightedEdges.has(d.id)
            ? 'visible'
            : (renderEdgeMap.get(d.id)?.view ?? 'hidden')
        })
    },
    [nodeEdgeMap, renderEdgeMap, networkSettings]
  )

  const formatText = useCallback(
    (g: d3.Selection<SVGTextElement, IRenderNode, BaseType, unknown>) => {
      return g
        .text((d) => getNodeText(d, nodes.label.field, groupMap))
        .attr('fill', (d) =>
          networkSettings.plot.nodes.labels.color.on
            ? nodeColorMap.get(d.id)
            : networkSettings.plot.nodes.labels.color.default
        )
        .attr('transform', (d) => {
          const { offset } = getTextAnchor(networkSettings, radiusMap.get(d.id))
          return `translate(${offset.x}, ${offset.y})`
        })
        .attr('dominant-baseline', (d) => {
          const { baseline } = getTextAnchor(
            networkSettings,
            radiusMap.get(d.id)
          )
          return baseline
        })
        .attr('text-anchor', (d) => {
          const { textAnchor } = getTextAnchor(
            networkSettings,
            radiusMap.get(d.id)
          )
          return textAnchor
        })
        .attr('font-size', networkSettings.plot.nodes.labels.text.font.fontSize)
        .attr(
          'font-family',
          networkSettings.plot.nodes.labels.text.font.fontFamily
        )
        .attr(
          'font-weight',
          networkSettings.plot.nodes.labels.text.font.fontWeight
        )
        .attr(
          'font-style',
          networkSettings.plot.nodes.labels.text.font.fontStyle
        )
        .attr(
          'text-decoration',
          networkSettings.plot.nodes.labels.text.font.decoration
        )
        .attr('visibility', (d) =>
          getIsNodeLabelled(
            d,
            userLabelSet,
            networkSettings.plot.nodes.labels.showAll,
            networkSettings.plot.nodes.view.labelled.on,
            userData.labels.mode
          )
            ? 'visible'
            : 'hidden'
        )
    },
    [
      nodes.label.field,
      groupMap,
      nodeColorMap,
      radiusMap,
      networkSettings,
      userLabelSet,
      userData.labels.mode,
    ]
  )

  const setIdle = useCallback(() => {
    updateStatus('idle')
  }, [updateStatus])

  return {
    status,
    tree,
    autoFit,
    runSim,
    formatText,
    formatCircle,
    formatEdge,
    setIdle,
    updateTree,
  }
}
