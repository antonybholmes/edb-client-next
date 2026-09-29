import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { IEdge } from '../network-store'

import { SvgCanvas } from '@/components/plot/svg-base'

import { SvgMargin } from '@/components/plot/svg-margin'

import { SvgG } from '@/components/plot/svg-g'
import { SvgMouseRect, SvgRect } from '@/components/plot/svg-rect'
import { IS_DEV_MODE } from '@/consts'
import { IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { getColorMap } from '@/lib/color/colormap'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { truncate } from '@/lib/text/text'
import { CrosshairProvider, useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { useZoom } from '@/providers/zoom-provider'
import * as d3 from 'd3'
import {
  forceCenter,
  forceLink,
  forceManyBody,
  forceSimulation,
} from 'd3-force'
import { Quadtree, quadtree } from 'd3-quadtree'
import { gsap } from 'gsap'
import { produce } from 'immer'
import { nodeRadiusFunc } from '../../matcalc/apps/heatmap/svg/cell-svg'
import { INetworkSettings, useNetworkSettings } from '../network-settings-store'
import { IGroup, INode, useNetwork } from '../network-store'
import { useUserData } from '../network-user-data-store'

type NodeView = 'default' | 'hidden' | 'translucent'

interface IRenderNode extends INode {
  //group: IGroup
  view: NodeView
}

interface IRenderEdge extends Omit<IEdge, 'source' | 'target'> {
  view: NodeView
  source: string | INode
  target: string | INode
}

export function NetworkD3SvgContent() {
  const { zoom } = useZoom()
  const { ref } = useSVG()
  const { settings } = useNetworkSettings()
  const { settings: userData, updateSettings: updateUserData } = useUserData()
  const { showCrosshair, hideCrosshair } = useCrosshair()

  const { network, groups, nodes } = useNetwork()

  const [tree, setTree] = useState<Quadtree<IRenderNode> | null>(null)

  const currentNode = useRef<INode | null>(null)

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
        getNodeText(node, nodes.label.field),
      ])
    )
  }, [network?.nodes, nodes.label.field])

  const renderNodes: IRenderNode[] = useMemo(() => {
    if (!network) {
      return []
    }

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
  }, [network?.nodes, groupMap, userLabelSet, settings, userData])

  const renderNodeMap = useMemo(() => {
    const map = new Map<string, IRenderNode>()
    for (const node of renderNodes) {
      map.set(node.id, node)
    }
    return map
  }, [renderNodes])

  const renderEdges: IRenderEdge[] = useMemo(() => {
    if (!network) {
      return []
    }

    return network.edges.map((edge) => {
      let view = 'default'

      if (
        renderNodeMap.get(edge.source)?.view === 'translucent' ||
        renderNodeMap.get(edge.target)?.view === 'translucent'
      ) {
        view = 'translucent'
      } else if (
        renderNodeMap.get(edge.source)?.view === 'hidden' ||
        renderNodeMap.get(edge.target)?.view === 'hidden'
      ) {
        view = 'hidden'
      } else {
        view = 'default'
      }

      return { ...edge, view } as IRenderEdge
    })
  }, [network?.edges, renderNodeMap])

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

    console.log(network)

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
      .attr('class', 'links')
      .selectAll<SVGLineElement, IRenderEdge>('line')
      .data(edges)
      .join('line')
      .attr('stroke', settings.plot.edges.line.value)
      .attr('stroke-opacity', (d) =>
        d.view === 'translucent' ? settings.plot.nodes.view.hidden.opacity : 1
      )

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
      .text((d) => nodeLabelMap.get(d.id))

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
      console.log('Simulation tick')
      link
        .attr('x1', (d) => {
          //console.log(d.source)
          return (d.source as INode).x!
        })
        .attr('y1', (d) => (d.source as INode).y!)
        .attr('x2', (d) => (d.target as INode).x!)
        .attr('y2', (d) => (d.target as INode).y!)

      node.attr('transform', (d) => `translate(${d.x}, ${d.y})`)
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

        // scale from mid-point to fit within the plot area
        node.attr('transform', (d) => {
          const p = toPlot(d.x, d.y)
          return `translate(${p.x}, ${p.y})`
        })

        link
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

        node.attr('transform', (d) => {
          const p = clampX(d.x, d.y)
          return `translate(${p.x}, ${p.y})`
        })

        link
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
  ])

  useEffect(() => {
    if (!ref.current || !network) {
      return
    }

    const svg = d3.select(ref.current)

    // get the main container for network nodes
    const g = svg.select('#network').select('#nodes')

    g.selectAll<SVGCircleElement, IRenderNode>('.node-circle')
      .attr('fill', (d) => nodeColorMap.get(d.id))
      .attr('fill-opacity', (d) => {
        const node = renderNodeMap.get(d.id)

        return node.view === 'translucent'
          ? settings.plot.nodes.view.hidden.opacity
          : settings.plot.nodes.color.opacity
      })
      .attr('stroke', (d) =>
        settings.plot.nodes.line.autoColor && settings.plot.nodes.line.show
          ? nodeColorMap.get(d.id)
          : undefined
      )

    g.selectAll<SVGTextElement, IRenderNode>('.node-text')
      .attr('fill', (d) =>
        settings.plot.nodes.labels.color.on
          ? nodeColorMap.get(d.id)
          : settings.plot.nodes.labels.color.default
      )
      .attr('transform', (d) => {
        const { offset } = getTextAnchor(settings, radiusMap.get(d.id))
        return `translate(${offset.x}, ${offset.y})`
      })
      .attr('dominant-baseline', (d) => {
        const { baseline } = getTextAnchor(settings, radiusMap.get(d.id))
        return baseline
      })
      .attr('text-anchor', (d) => {
        const { textAnchor } = getTextAnchor(settings, radiusMap.get(d.id))
        return textAnchor
      })
      .attr('font-size', settings.plot.nodes.labels.text.font.fontSize)
      .attr('visibility', (d) =>
        showNodeLabel(
          d,
          userLabelSet,
          settings.plot.nodes.labels.showAll,
          userData.labels.mode
        )
          ? 'visible'
          : 'hidden'
      )
  }, [renderNodeMap, userLabelSet, nodeColorMap])

  // const tree = useMemo(
  //   () =>
  //     quadtree<IRenderNode>(
  //       renderNodes,
  //       (c) => c.x,
  //       (c) => c.y
  //     ),
  //   [renderNodeMap]
  // )

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || !settings.plot.crosshair.show || !tree) {
        return
      }

      let svgP = screenToSvgPoint(ref.current, {
        x: e.clientX,
        y: e.clientY,
      })

      // must be relative to plot area within svg excluding margins
      //svgP.x -= settings.plot.margin.left
      //svgP.y -= settings.plot.margin.top

      const node = tree.find(
        svgP.x,
        svgP.y,
        settings.plot.crosshair.search.radius
      )

      if (!node) {
        // since we have lots of mouse events, only react when the current node changes
        if (currentNode.current) {
          gsap.timeline().to(`#node-circle-${currentNode.current.id}`, {
            scale: 1,
            transformOrigin: 'center',
            duration: 0.3,
            ease: 'power2.out',
          })

          currentNode.current = null
          hideCrosshair()
        }

        return
      }

      if (node.id === currentNode.current?.id) {
        return
      }

      //console.log(node)

      currentNode.current = node

      gsap.timeline().to(`#node-circle-${node.id}`, {
        scale: 1.2,
        transformOrigin: 'center',
        duration: 0.3,
        ease: 'power2.out',
      })

      const plotNodePos = { x: node.x, y: node.y }

      const canvasNodePos = {
        x: plotNodePos.x,
        y: plotNodePos.y,
      }

      const { relativeP, screenP } = svgPointToScreen(
        ref.current,
        canvasNodePos
      )

      showCrosshair({
        pos: relativeP,
        clientPos: screenP,
        content: (
          <>
            {IS_DEV_MODE && <strong>{node.id}</strong>}
            {Object.entries(node.data)
              .sort(([key1], [key2]) => key1.localeCompare(key2))
              .map(([key, value], i) => (
                <span key={i}>
                  {key}:{' '}
                  <strong>{truncate(value.toString(), { length: 32 })}</strong>
                </span>
              ))}
          </>
        ),
      })
    },
    [tree]
  )

  const onMouseDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!currentNode.current) {
        return
      }

      const node = currentNode.current

      if (labelsInNodeIds(node, userLabelSet)) {
        updateUserData(
          produce(userData, (draft) => {
            draft.labels.ids = userData.labels.ids.filter(
              (id) => id !== node.id2
            )
          })
        )
      } else {
        console.log('Adding node to user data labels:', node.id2)
        updateUserData(
          produce(userData, (draft) => {
            draft.labels.ids = [...userData.labels.ids, node.id2]
          })
        )
      }

      e.stopPropagation()
      // handle double click event here
    },
    [userLabelSet, updateUserData, userData]
  )

  //   const svg = (
  //     <>
  //       <SvgMargin margin={settings.plot.margin}>
  //         {settings.plot.border.show && (
  //           <SvgRect
  //             x={0}
  //             y={0}
  //             width={settings.plot.size.w}
  //             height={settings.plot.size.h}
  //             sp={settings.plot.border}
  //           />
  //         )}

  //         {settings.plot.edges.line.show &&
  //           renderEdges.map((edge, idx) => {
  //             const sourcePos = canvasCoordinates.get(edge.source) || ZERO_POS
  //             const targetPos = canvasCoordinates.get(edge.target) || ZERO_POS

  //             const opacity =
  //               edge.view === 'translucent'
  //                 ? settings.plot.nodes.view.hidden.opacity
  //                 : 1

  //             return (
  //               <SvgLine
  //                 key={idx}
  //                 x1={sourcePos.x}
  //                 y1={sourcePos.y}
  //                 x2={targetPos.x}
  //                 y2={targetPos.y}
  //                 s={settings.plot.edges.line}

  //                 strokeWidth={edge.strength * settings.plot.edges.scale}
  //                 opacity={opacity}
  //               />
  //             )
  //           })}

  //         {renderNodeMap.map((node) => {
  //           return (
  //             <NodeCircle
  //               key={node.id}
  //               node={node}
  //               radius={radiusMap.get(node.id) ?? 0}
  //               size2={sizeMap2.get(node.id) ?? 0}
  //               colorMap={colorMap}

  //               labelSet={userLabelSet}
  //               coordinates={canvasCoordinates}
  //             />
  //           )
  //         })}

  //         <SvgMouseRect
  //           size={settings.plot.size}
  //           onMouseMove={onMouseMove}
  //           onMouseLeave={hideCrosshair}
  //           onDoubleClick={onMouseDoubleClick}
  //         />
  //       </SvgMargin>
  //       <LegendSvg />
  //     </>
  //   )

  //   return { svg, width, height }
  // }, [settings, network?.id, coordinates, groups, userData, renderNodeMap])

  // if (!svg) {
  //   return null
  // }

  const { size } = useMemo(() => {
    if (!network) {
      return { size: { w: 0, h: 0 } }
    }
    //const huedata = hue ? getNumCol(df, findCol(df, hue)) : []

    // inner height is determined by the size of the largest bubble plot

    const size = {
      w:
        settings.plot.size.w +
        settings.plot.margin.left +
        settings.plot.margin.right,

      h:
        settings.plot.size.h +
        settings.plot.margin.top +
        settings.plot.margin.bottom,
    }

    return { size }
  }, [settings, network?.id])

  return (
    <SvgCanvas size={size} scale={zoom}>
      <SvgG id="network" />
      <SvgMargin margin={settings.plot.margin}>
        {settings.plot.border.show && (
          <SvgRect
            x={0}
            y={0}
            width={settings.plot.size.w}
            height={settings.plot.size.h}
            sp={settings.plot.border}
          />
        )}
        <SvgMouseRect
          size={settings.plot.size}
          onMouseMove={onMouseMove}
          onMouseLeave={hideCrosshair}
          onDoubleClick={onMouseDoubleClick}
          //fill="red"
        />
      </SvgMargin>
    </SvgCanvas>
  )
}

export function NetworkD3Svg() {
  return (
    <CrosshairProvider>
      <NetworkD3SvgContent />
    </CrosshairProvider>
  )
}

function showNodeLabel(
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

function labelsInNodeIds(node: INode, labelSet: Set<string>): boolean {
  return (
    inLabelSet(node.id, labelSet, 'exact') ||
    inLabelSet(node.id2, labelSet, 'exact')
  )
}

function inNodeData(
  node: INode,
  labelSet: Set<string>,
  mode: 'partial' | 'exact'
) {
  return Object.values(node.data)
    .filter((d) => typeof d === 'string')
    .some((d) => inLabelSet(d.toString(), labelSet, mode))
}

function inLabelSet(
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
function getNodeText(node: INode, field: string): string {
  switch (field) {
    case 'id':
      return node.id
    case 'id2':
      return node.id2
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

function getTextAnchor(settings: INetworkSettings, radius: number) {
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
