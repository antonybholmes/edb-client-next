import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SvgBase } from '@/components/plot/svg-base'

import { SvgMargin } from '@/components/plot/svg-margin'

import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgRect } from '@/components/plot/svg-rect'
import { SvgText } from '@/components/plot/svg-text'
import { IS_DEV_MODE } from '@/consts'
import { IDim } from '@/interfaces/dim'
import { IPos, ZERO_POS } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { ColorMap, getColorMap } from '@/lib/color/colormap'
import { svgPointToScreen } from '@/lib/graphics/svg'
import { CrosshairProvider, useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { useZoom } from '@/providers/zoom-provider'
import { gsap } from 'gsap'
import { produce } from 'immer'
import { nodeRadiusFunc } from '../../matcalc/apps/heatmap/svg/cell-svg'
import { INetworkSettings, useNetworkSettings } from '../network-settings-store'
import { IGroup, INode, useNetwork } from '../network-store'
import { useUserData } from '../network-user-data-store'
import { getSizeLabel, LegendSvg } from './legend-svg'

export function NetworkSvgContent() {
  const { zoom } = useZoom()

  const { settings } = useNetworkSettings()
  const { settings: userData } = useUserData()

  const { network, groups, coordinates, size: d3Size, nodes } = useNetwork()

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

    const groupMap = new Map<string, IGroup>(
      groups.map((group) => [group.name.trim().toLowerCase(), group])
    )

    const nodeMap = network.nodeMap

    const labelSet = new Set(
      userData.labels.ids
        .map((label) => label.toLowerCase())
        .filter((x) => x.length > 0)
    )

    const nodeRadiusScale = nodeRadiusFunc(
      settings.plot.nodes.radius,
      settings.plot.nodes.scale.mode
    )

    const radiusMap = new Map<string, number>(
      network.nodes.map((node) => [
        node.id,
        nodeRadiusScale((node.size ?? 0) / nodes.metricLim1.max),
      ])
    )

    const sizeMap2 = new Map<string, number>(
      network.nodes.map((node) => [
        node.id,
        (node.size2 ?? 0) / nodes.metricLim2.max,
      ])
    )

    // map relative coordinates to absolute coordinates within the SVG canvas
    const realCoordinates = realCoordinate(
      coordinates,
      d3Size,
      radiusMap,
      settings
    )

    const colorMap = getColorMap(settings.plot.nodes.color.cmap)

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
            network.edges
              .filter((edge) => {
                const sourceNode = nodeMap[edge.source]
                const targetNode = nodeMap[edge.target]

                return (
                  groupMap.get(sourceNode?.group.toLowerCase() ?? '')?.show &&
                  groupMap.get(targetNode?.group.toLowerCase() ?? '')?.show
                )
              })
              .map((edge, idx) => {
                const sourcePos = realCoordinates.get(edge.source) || ZERO_POS
                const targetPos = realCoordinates.get(edge.target) || ZERO_POS

                return (
                  <SvgLine
                    key={idx}
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    s={settings.plot.edges.line}

                    strokeWidth={edge.strength * settings.plot.edges.scale}
                  />
                )
              })}

          {network.nodes
            .filter((node) => groupMap.get(node.group.toLowerCase())?.show)
            .map((node) => {
              let fillColor = COLOR_BLACK

              switch (settings.plot.nodes.color.mode) {
                case 'group':
                  fillColor =
                    groupMap.get(node.group.toLowerCase())?.color ?? COLOR_BLACK
                  break

                default:
                  fillColor = COLOR_BLACK
                  break
              }

              return (
                <NodeCircle
                  key={node.id}
                  node={node}
                  radius={radiusMap.get(node.id) ?? 0}
                  size2={sizeMap2.get(node.id) ?? 0}
                  colorMap={colorMap}
                  groupMap={groupMap}
                  labelSet={labelSet}
                  coordinates={realCoordinates}
                />
              )
            })}
        </SvgMargin>
        <LegendSvg />
      </>
    )

    return { svg, width, height }
  }, [settings, network?.id, coordinates, groups, userData])

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
  groupMap,
  labelSet,
  radius,
  size2,
  coordinates,
  colorMap,
}: {
  node: INode
  groupMap: Map<string, IGroup>
  labelSet: Set<string>
  radius: number
  size2: number
  coordinates: Map<string, IPos>
  colorMap: ColorMap
}) {
  const { settings } = useNetworkSettings()
  const { headings } = useNetwork()
  const { settings: userData, updateSettings: updateUserData } = useUserData()
  const { showCrosshair, hideCrosshair } = useCrosshair()

  const { textAnchor, baseline, offset } = getTextAnchor(settings, radius)
  const pos = coordinates.get(node.id) || ZERO_POS
  const { ref } = useSVG()

  const [hover, setHover] = useState(false)

  let fillColor = useMemo(() => {
    switch (settings.plot.nodes.color.mode) {
      case 'group':
        return groupMap.get(node.group.toLowerCase())?.color ?? COLOR_BLACK
      default:
        return colorMap.getHexColor(size2) ?? COLOR_BLACK
    }
  }, [settings.plot.nodes.color.mode, groupMap, node.group, colorMap, size2])

  const showLabel =
    settings.plot.nodes.labels.showAll ||
    inLabelSet(node.label, labelSet) ||
    inLabelSet(node.name, labelSet) ||
    inLabelSet(node.group, labelSet) ||
    labelSet.has(node.id2.toLowerCase()) ||
    labelSet.has(node.id)

  const circleRef = useRef<SVGCircleElement>(null)

  useEffect(() => {
    if (!circleRef.current) {
      return
    }

    gsap.to(circleRef.current, {
      scale: hover ? 1.2 : 1,
      transformOrigin: 'center',
      duration: 0.3,
      ease: 'power2.out',
    })
  }, [hover])

  const onMouseEnter = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) {
        return
      }

      setHover(true)

      const barP = {
        x: settings.plot.margin.left + pos.x,
        y: settings.plot.margin.top + pos.y,
      }

      const { relativeP: barScreenP } = svgPointToScreen(ref.current, barP)

      showCrosshair({
        pos: barScreenP,
        content: (
          <>
            <strong>{node.label}</strong>
            <span>Name: {node.name}</span>
            <span>Group: {node.group}</span>
            <span>
              {getSizeLabel(headings, settings)}: {node.size}
            </span>
            {IS_DEV_MODE && <span>{node.id}</span>}
          </>
        ),
      })
    },
    [pos, ref, settings, setHover, showCrosshair, hideCrosshair]
  )

  const hide = useCallback(() => {
    setHover(false)
    hideCrosshair()
  }, [hideCrosshair, setHover])

  return (
    <SvgG pos={pos}>
      <SvgCircle
        ref={circleRef}
        r={radius}
        fill={fillColor}
        fillOpacity={settings.plot.nodes.color.opacity}
        stroke={
          settings.plot.nodes.line.autoColor && settings.plot.nodes.line.show
            ? fillColor
            : undefined
        }
        sp={settings.plot.nodes.line}
        onMouseEnter={onMouseEnter}
        onMouseLeave={hide}
        // double click
        onDoubleClick={(e) => {
          if (userData.labels.ids.includes(node.id2)) {
            updateUserData(
              produce(userData, (draft) => {
                draft.labels.ids = draft.labels.ids.filter(
                  (label) => label !== node.id2
                )
              })
            )
          } else {
            updateUserData(
              produce(userData, (draft) => {
                draft.labels.ids.push(node.id2)
              })
            )
          }

          e.stopPropagation()
          // handle double click event here
        }}
      />
      {showLabel && (
        <SvgG pos={offset}>
          <SvgText
            textAnchor={textAnchor}
            dominantBaseline={baseline}
            font={settings.plot.nodes.labels.text}
            className="pointer-events-none"
          >
            {getNodeText(node, settings)}
          </SvgText>
        </SvgG>
      )}
    </SvgG>
  )
}

function realCoordinate(
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

      if (settings.plot.scaleToFit) {
        x *= plotScale.x
        y *= plotScale.y
      }

      // user supplied scale factor
      x *= settings.plot.scale
      y *= settings.plot.scale

      x += mid.x
      y += mid.y

      const radius = radiusMap.get(id) ?? 0

      if (settings.plot.nodes.keepWithinBounds) {
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

function inLabelSet(text: string, labels: Set<string>) {
  text = text.toLowerCase().trim()
  // check if anything in label set is within the text
  for (const label of labels) {
    if (text.includes(label)) {
      return true
    }
  }
  return false
}

function getNodeText(node: INode, settings: INetworkSettings): string {
  switch (settings.plot.nodes.labels.type) {
    case 'label':
      return node.label
    case 'name':
      return node.name
    case 'group':
      return node.group
    case 'size':
      return node.size.toString()
    case 'id':
      return node.id
    case 'id2':
      return node.id2
    default:
      return ''
  }
}

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
