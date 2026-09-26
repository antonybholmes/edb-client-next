import { useCallback, useMemo, useRef } from 'react'
import { IEdge } from '../network-store'

import { SvgBase } from '@/components/plot/svg-base'

import { SvgMargin } from '@/components/plot/svg-margin'

import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgMouseRect, SvgRect } from '@/components/plot/svg-rect'
import { SvgText } from '@/components/plot/svg-text'
import { IS_DEV_MODE } from '@/consts'
import { IDim } from '@/interfaces/dim'
import { IPos, ZERO_POS } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { ColorMap, getColorMap } from '@/lib/color/colormap'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { CrosshairProvider, useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { useZoom } from '@/providers/zoom-provider'
import { quadtree } from 'd3-quadtree'
import { gsap } from 'gsap'
import { produce } from 'immer'
import { nodeRadiusFunc } from '../../matcalc/apps/heatmap/svg/cell-svg'
import { INetworkSettings, useNetworkSettings } from '../network-settings-store'
import { IGroup, INode, useNetwork } from '../network-store'
import { useUserData } from '../network-user-data-store'
import { LegendSvg } from './legend-svg'

type NodeView = 'default' | 'hidden' | 'translucent'
interface IRenderNode extends INode {
  group: IGroup
  view: NodeView
}

interface IRenderEdge extends IEdge {
  view: NodeView
}

export function NetworkSvgContent() {
  const { zoom } = useZoom()
  const { ref } = useSVG()
  const { settings } = useNetworkSettings()
  const { settings: userData, updateSettings: updateUserData } = useUserData()
  const { showCrosshair, hideCrosshair } = useCrosshair()

  const { network, groups, coordinates, size: d3Size, nodes } = useNetwork()

  const currentNode = useRef<INode | null>(null)

  // const { showTooltip, hideTooltip } = useTooltip()

  // const handleVariantEnter = useCallback(
  //   (plot: IGseaBubble, row: number, p: IPos) => {
  //     const { screenP } = svgPointToScreen(svgRef.current, p)

  //     const newP = {
  //       x: screenP.x,
  //       y: screenP.y,
  //     }

  //     showTooltip({
  //       pos: newP,
  //       content: (
  //         <>
  //           <p className="font-semibold">{`${plot.genesets[row]!.name}`}</p>
  //           <p>{`${plot.nes.label}: ${plot.genesets[row]!.nes.toFixed(2)}`}</p>
  //           <p>{`-log10(${plot.log10q.label}): ${plot.genesets[row]!.log10q.toFixed(2)}`}</p>
  //           <p>{`${plot.size.label}: ${plot.genesets[row]!.size}`}</p>
  //         </>
  //       ),
  //     })
  //   },
  //   [svgRef, showTooltip, hideTooltip]
  // )

  const groupMap = useMemo(
    () => new Map<string, IGroup>(groups.map((group) => [group.id, group])),
    [groups]
  )

  const labelSet = useMemo(
    () =>
      new Set(
        userData.labels.ids
          .filter((x) => x.length > 0)
          .map((x) => x.toLowerCase())
      ),
    [userData.labels.ids]
  )

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

  const canvasCoordinates = useMemo(
    () => d3ToCanvasSpace(coordinates, d3Size, radiusMap, settings),
    [coordinates, d3Size, radiusMap, settings]
  )

  const renderNodes: IRenderNode[] = useMemo(() => {
    if (
      !network?.nodes ||
      network.nodes.length === 0 ||
      Object.keys(coordinates).length === 0
    ) {
      return []
    }

    return network.nodes
      .map((node) => {
        let view: NodeView = groupMap.get(node.groupId)?.show
          ? 'default'
          : 'hidden'

        if (
          settings.plot.nodes.view.mode === 'labelled' &&
          !showNodeLabel(
            node,
            labelSet,
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
      .filter((node) => {
        if (node.view === 'hidden') {
          return false
        }

        if (settings.plot.nodes.clip) {
          const nodePos = canvasCoordinates.get(node.id)!
          const radius = radiusMap.get(node.id)!

          if (
            nodePos.x - radius < 0 ||
            nodePos.x + radius > settings.plot.size.w ||
            nodePos.y - radius < 0 ||
            nodePos.y + radius > settings.plot.size.h
          ) {
            return false
          }
        }

        return true
      })
  }, [
    network?.nodes,
    groupMap,
    labelSet,
    settings,
    userData,
    canvasCoordinates,
    radiusMap,
  ])

  const tree = useMemo(
    () =>
      quadtree<IRenderNode>(
        renderNodes,
        (c) => canvasCoordinates.get(c.id).x,
        (c) => canvasCoordinates.get(c.id).y
      ),
    [renderNodes, canvasCoordinates]
  )

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current || !settings.plot.crosshair.show) {
        return
      }

      let svgP = screenToSvgPoint(ref.current, {
        x: e.clientX,
        y: e.clientY,
      })

      // must be relative to plot area within svg excluding margins
      svgP.x -= settings.plot.margin.left
      svgP.y -= settings.plot.margin.top

      const node = tree.find(
        svgP.x,
        svgP.y,
        settings.plot.crosshair.search.radius
      )

      if (!node) {
        // since we have lots of mouse events, only react when the current node changes
        if (currentNode.current) {
          gsap.timeline().to(`#node-${currentNode.current.id}`, {
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

      gsap.timeline().to(`#node-${node.id}`, {
        scale: 1.2,
        transformOrigin: 'center',
        duration: 0.3,
        ease: 'power2.out',
      })

      const plotNodePos = canvasCoordinates.get(node.id)!

      const canvasNodePos = {
        x: plotNodePos.x + settings.plot.margin.left,
        y: plotNodePos.y + settings.plot.margin.top,
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
                  {key}: {value}
                </span>
              ))}
          </>
        ),
      })
    },
    [tree, canvasCoordinates]
  )

  const onMouseDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!currentNode.current) {
        return
      }

      const node = currentNode.current

      if (labelsInNodeIds(node, labelSet)) {
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
    [labelSet, updateUserData, userData]
  )

  const { svg, width, height } = useMemo(() => {
    if (!network || Object.keys(coordinates).length === 0) {
      return { svg: null, width: 0, height: 0 }
    }
    //const huedata = hue ? getNumCol(df, findCol(df, hue)) : []

    // inner height is determined by the size of the largest bubble plot

    const width =
      settings.plot.size.w +
      settings.plot.margin.left +
      settings.plot.margin.right

    const height =
      settings.plot.size.h +
      settings.plot.margin.top +
      settings.plot.margin.bottom

    const sizeMap2 = new Map<string, number>(
      renderNodes.map((node) => [
        node.id,
        (node.size2 ?? 0) / nodes.metricLim2.max,
      ])
    )

    // map relative coordinates to absolute coordinates within the SVG canvas

    const colorMap = getColorMap(settings.plot.nodes.color.cmap)

    const renderNodesMap = new Map(renderNodes.map((node) => [node.id, node]))

    const renderEdges: IRenderEdge[] = network.edges
      .filter((edge) => {
        //const sourceNode = nodeMap[edge.source]
        //const targetNode = nodeMap[edge.target]

        return (
          renderNodesMap.has(edge.source) && renderNodesMap.has(edge.target)
        )

        // return (
        //   groupMap.get(sourceNode.groupId)?.show &&
        //   groupMap.get(targetNode.groupId)?.show
        // )
      })
      .map((edge) => {
        const view =
          renderNodesMap.get(edge.source)?.view === 'translucent' ||
          renderNodesMap.get(edge.target)?.view === 'translucent'
            ? 'translucent'
            : 'hidden'

        return { ...edge, view }
      })

    const svg = (
      <>
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

          {settings.plot.edges.line.show &&
            renderEdges.map((edge, idx) => {
              const sourcePos = canvasCoordinates.get(edge.source) || ZERO_POS
              const targetPos = canvasCoordinates.get(edge.target) || ZERO_POS

              const opacity =
                edge.view === 'translucent'
                  ? settings.plot.nodes.view.hidden.opacity
                  : 1

              return (
                <SvgLine
                  key={idx}
                  x1={sourcePos.x}
                  y1={sourcePos.y}
                  x2={targetPos.x}
                  y2={targetPos.y}
                  s={settings.plot.edges.line}

                  strokeWidth={edge.strength * settings.plot.edges.scale}
                  opacity={opacity}
                />
              )
            })}

          {renderNodes.map((node) => {
            return (
              <NodeCircle
                key={node.id}
                node={node}
                radius={radiusMap.get(node.id) ?? 0}
                size2={sizeMap2.get(node.id) ?? 0}
                colorMap={colorMap}

                labelSet={labelSet}
                coordinates={canvasCoordinates}
              />
            )
          })}

          <SvgMouseRect
            width={settings.plot.size.w}
            height={settings.plot.size.h}

            onMouseMove={onMouseMove}
            onDoubleClick={onMouseDoubleClick}
            //onMouseLeave={hideCrosshair}
          />
        </SvgMargin>
        <LegendSvg />
      </>
    )

    return { svg, width, height }
  }, [settings, network?.id, coordinates, groups, userData, renderNodes])

  if (!svg) {
    return null
  }

  return (
    <SvgBase width={width} height={height} scale={zoom}>
      {svg}
    </SvgBase>
  )
}

export function NetworkSvg() {
  return (
    <CrosshairProvider>
      <NetworkSvgContent />
    </CrosshairProvider>
  )
}

function NodeCircle({
  node,
  labelSet,
  radius,
  size2,
  coordinates,
  colorMap,
}: {
  node: IRenderNode
  labelSet: Set<string>
  radius: number
  size2: number
  coordinates: Map<string, IPos>
  colorMap: ColorMap
}) {
  const { settings } = useNetworkSettings()
  const { nodes } = useNetwork()
  const { settings: userData } = useUserData()
  //const { showCrosshair, hideCrosshair } = useCrosshair()

  const { textAnchor, baseline, offset } = getTextAnchor(settings, radius)
  const pos = coordinates.get(node.id) || ZERO_POS
  //const { ref } = useSVG()

  //const [hover, setHover] = useState(false)

  let fillColor = useMemo(() => {
    switch (settings.plot.nodes.color.mode) {
      case 'group':
        return node.group?.color ?? COLOR_BLACK
      default:
        return colorMap.getHexColor(size2) ?? COLOR_BLACK
    }
  }, [settings.plot.nodes.color.mode, node.group, colorMap, size2])

  const showLabel = useMemo(() => {
    return (
      node.view === 'default' &&
      showNodeLabel(
        node,
        labelSet,
        settings.plot.nodes.labels.showAll,
        userData.labels.mode
      )
    )
  }, [node, labelSet, settings.plot.nodes.labels.showAll, userData.labels.mode])

  //const circleRef = useRef<SVGCircleElement>(null)

  // useEffect(() => {
  //   if (!circleRef.current) {
  //     return
  //   }

  //   gsap.timeline().to(circleRef.current, {
  //     scale: hover ? 1.2 : 1,
  //     transformOrigin: 'center',
  //     duration: 0.3,
  //     ease: 'power2.out',
  //   })
  // }, [hover])

  // const onMouseEnter = useCallback(
  //   (e: React.MouseEvent) => {
  //     if (!ref.current) {
  //       return
  //     }

  //     //setHover(true)

  //     const barP = {
  //       x: settings.plot.margin.left + pos.x,
  //       y: settings.plot.margin.top + pos.y,
  //     }

  //     const { relativeP, screenP } = svgPointToScreen(ref.current, barP)

  //     showCrosshair({
  //       pos: relativeP,
  //       clientPos: screenP,
  //       content: (
  //         <>
  //           {/* <strong>{node.label}</strong> */}
  //           {/* <span>Name: {node.name}</span> */}
  //           {/* <span>Group: {node.group}</span> */}
  //           {/* <span>
  //             {getSizeLabel(headings, settings)}: {node.size}
  //           </span> */}
  //           {IS_DEV_MODE && <strong>{node.id}</strong>}
  //           {Object.entries(node.data)
  //             .sort(([key1], [key2]) => key1.localeCompare(key2))
  //             .map(([key, value], i) => (
  //               <span key={i}>
  //                 {key}: {value}
  //               </span>
  //             ))}
  //         </>
  //       ),
  //     })
  //   },
  //   [pos, ref, settings, setHover, showCrosshair, hideCrosshair]
  // )

  // const hide = useCallback(() => {
  //   setHover(false)
  //   hideCrosshair()
  // }, [hideCrosshair, setHover])

  const fillOpacity =
    node.view === 'translucent'
      ? settings.plot.nodes.view.hidden.opacity
      : settings.plot.nodes.color.opacity

  const stroke =
    settings.plot.nodes.line.autoColor && settings.plot.nodes.line.show
      ? fillColor
      : undefined

  return (
    <SvgG pos={pos}>
      <SvgCircle
        id={`node-${node.id}`}
        //ref={circleRef}
        r={radius}
        fill={fillColor}
        fillOpacity={fillOpacity}
        stroke={stroke}
        sp={settings.plot.nodes.line}
        //onMouseEnter={onMouseEnter}
        //onMouseLeave={hide}
        // double click
        // onDoubleClick={(e) => {
        //   if (labelsInNodeIds(node, labelSet)) {
        //     updateUserData(
        //       produce(userData, (draft) => {
        //         draft.labels.ids = userData.labels.ids.filter(
        //           (id) => id !== node.id2
        //         )
        //       })
        //     )
        //   } else {
        //     console.log('Adding node to user data labels:', node.id2)
        //     updateUserData(
        //       produce(userData, (draft) => {
        //         draft.labels.ids = [...userData.labels.ids, node.id2]
        //       })
        //     )
        //   }

        //   e.stopPropagation()
        // }}
      />
      {showLabel && (
        <SvgG pos={offset}>
          <SvgText
            textAnchor={textAnchor}
            dominantBaseline={baseline}
            font={settings.plot.nodes.labels.text}
            className="pointer-events-none"
          >
            {getNodeText(node, nodes.label.field)}
          </SvgText>
        </SvgG>
      )}
    </SvgG>
  )
}

/**
 * Converts D3 coordinates to canvas space coordinates.
 * @param coordinates The coordinates of the nodes in the D3 space.
 * @param d3Size The size of the D3 plotting area.
 * @param radiusMap A map of node IDs to their respective radii.
 * @param settings The network plot settings.
 * @returns A map of node IDs to their positions in the canvas space.
 */
function d3ToCanvasSpace(
  coordinates: Record<string, IPos>,
  d3Size: IDim,
  radiusMap: Map<string, number>,
  settings: INetworkSettings
): Map<string, IPos> {
  const plotScale = {
    x: settings.plot.size.w / d3Size.w,
    y: settings.plot.size.h / d3Size.h,
  }

  const mid = {
    x: settings.plot.size.w / 2,
    y: settings.plot.size.h / 2,
  }

  return new Map<string, IPos>(
    Object.entries(coordinates).map(([id, pos]) => {
      let x = pos.x
      let y = pos.y

      if (settings.plot.autoFit) {
        x *= plotScale.x
        y *= plotScale.y
      }

      // user supplied scale factor
      x *= settings.plot.scale
      y *= settings.plot.scale

      x += mid.x
      y += mid.y

      const radius = radiusMap.get(id) ?? 0

      if (settings.plot.nodes.clamp) {
        x = Math.max(radius, Math.min(settings.plot.size.w - radius, x))
        y = Math.max(radius, Math.min(settings.plot.size.h - radius, y))
      }

      return [
        id,
        {
          x,
          y,
        },
      ]
    })
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
