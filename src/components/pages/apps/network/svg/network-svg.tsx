import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { SvgBase } from '@/components/plot/svg-base'

import { SvgMargin } from '@/components/plot/svg-margin'

import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgText } from '@/components/plot/svg-text'
import { IS_DEV_MODE } from '@/consts'
import { IPos, ZERO_POS } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { svgPointToScreen } from '@/lib/graphics/svg'
import { CrosshairProvider, useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { useZoom } from '@/providers/zoom-provider'
import { gsap } from 'gsap'
import { produce } from 'immer'
import { INetworkSettings, useNetworkSettings } from '../network-settings-store'
import { IGroup, INode, useNetwork } from '../network-store'
import { LegendSvg } from './legend-svg'

export function NetworkSvgContent() {
  const { zoom } = useZoom()

  const { settings } = useNetworkSettings()

  const { network, groups, coordinates } = useNetwork()

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
    if (!network || coordinates.size === 0) {
      return { svg: null, width: 0, height: 0 }
    }
    //const huedata = hue ? getNumCol(df, findCol(df, hue)) : []

    // inner height is determined by the size of the largest bubble plot
    const size = settings.plot.size

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

    const nodeMap = new Map<string, INode>(
      network.nodes.map((node) => [node.id, node])
    )

    const labelSet = new Set(
      settings.labels
        .map((label) => label.toLowerCase())
        .filter((x) => x.length > 0)
    )

    // map relative coordinates to absolute coordinates within the SVG canvas
    const realCoordinates = new Map<string, IPos>(
      coordinates.entries().map(([id, pos]) => [
        id,
        {
          x: pos.x + size.w / 2,
          y: pos.y + size.h / 2,
        },
      ])
    )

    const svg = (
      <>
        <SvgMargin margin={settings.plot.margin}>
          {/* <rect
            x={0}
            y={0}
            width={size.w}
            height={size.h}
            fill="none"
            stroke="black"
          /> */}

          {settings.plot.edges.line.show &&
            network.edges
              .filter((edge) => {
                const sourceNode = nodeMap.get(edge.source)
                const targetNode = nodeMap.get(edge.target)

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

                    strokeWidth={edge.score * settings.plot.edges.scale}
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
  }, [settings, network, coordinates, groups])

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
  coordinates,
}: {
  node: INode
  groupMap: Map<string, IGroup>
  labelSet: Set<string>
  coordinates: Map<string, IPos>
}) {
  const { settings, updateSettings } = useNetworkSettings()
  //  const { coordinates } = useNetwork()
  const { showCrosshair, hideCrosshair } = useCrosshair()
  const radius = node.size * 0.5 * settings.plot.nodes.scale
  const { textAnchor, baseline, offset } = getTextAnchor(settings, radius)
  const pos = coordinates.get(node.id) || ZERO_POS
  const { ref } = useSVG()

  const [hover, setHover] = useState(false)

  let fillColor = useMemo(() => {
    switch (settings.plot.nodes.color.mode) {
      case 'group':
        return groupMap.get(node.group.toLowerCase())?.color ?? COLOR_BLACK
      default:
        return COLOR_BLACK
    }
  }, [settings.plot.nodes.color.mode, groupMap, node.group])

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

      // const svgP = screenToSvgPoint(ref.current, {
      //   x: e.clientX,
      //   y: e.clientY,
      // })

      // const plotP = {
      //   x: svgP.x - pos.x - settings.plot.margin.left,
      //   y: svgP.y - pos.y - settings.plot.margin.top,
      // }

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
            <span> {node.name}</span>
            <span>{node.group}</span>
            <span>Size: {node.size}</span>
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
          if (settings.labels.includes(node.id2)) {
            updateSettings(
              produce(settings, (draft) => {
                draft.labels = draft.labels.filter(
                  (label) => label !== node.id2
                )
              })
            )
          } else {
            updateSettings(
              produce(settings, (draft) => {
                draft.labels.push(node.id2)
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
            {node.label}
          </SvgText>
        </SvgG>
      )}
    </SvgG>
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
