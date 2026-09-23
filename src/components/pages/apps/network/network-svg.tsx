import { useCallback, useMemo } from 'react'

import { SvgBase } from '@/components/plot/svg-base'

import { SvgMargin } from '@/components/plot/svg-margin'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgText } from '@/components/plot/svg-text'
import { COLOR_BLACK } from '@/lib/color/color'
import { useTooltip } from '@/providers/tooltip-provider'
import { useZoom } from '@/providers/zoom-provider'
import { useNetworkSettings } from './network-settings-store'
import { IGroup, useNetwork } from './network-store'

export function NetworkSvg() {
  const { zoom } = useZoom()

  const { hideTooltip } = useTooltip()

  const { settings } = useNetworkSettings()
  const { settings: edbSettings } = useEdbSettings()
  const { network, groups, coordinates, size } = useNetwork()

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

  const handleVariantLeave = useCallback(() => {
    hideTooltip()
  }, [hideTooltip])

  const { svg, width, height } = useMemo(() => {
    //const huedata = hue ? getNumCol(df, findCol(df, hue)) : []

    // inner height is determined by the size of the largest bubble plot

    const width =
      size.w + settings.plot.margin.left + settings.plot.margin.right
    const height =
      size.h + settings.plot.margin.top + settings.plot.margin.bottom

    const groupMap: Record<string, IGroup> = Object.fromEntries(
      groups
        .map((group) => [
          [group.id, group],
          [group.name.toLowerCase(), group],
        ])
        .flat()
    )

    console.log(groupMap, settings.plot.margin)

    const svg = (
      <>
        <SvgMargin margin={settings.plot.margin}>
          <rect
            x={0}
            y={0}
            width={size.w}
            height={size.h}
            fill="none"
            stroke="black"
          />
          {settings.plot.edges.line.show &&
            network.edges.map((edge, idx) => {
              const sourcePos = coordinates[edge.source] || { x: 0, y: 0 }
              const targetPos = coordinates[edge.target] || { x: 0, y: 0 }
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

          {network.nodes.map((node) => {
            const pos = coordinates[node.id] || { x: 0, y: 0 }

            let fillColor = COLOR_BLACK

            switch (settings.plot.nodes.color.mode) {
              case 'group':
                fillColor =
                  groupMap[node.group.toLowerCase()]?.color ?? COLOR_BLACK
                break

              default:
                fillColor = COLOR_BLACK
                break
            }

            if (node.label === 'BLOOD MODULE-1.4 UNDETERMINED') {
              console.log('found node:', node, pos)
            }

            let textAnchor: 'start' | 'middle' | 'end' = 'middle'

            switch (settings.plot.nodes.labels.position) {
              case 'left':
                textAnchor = 'start'
                break
              case 'center':
                textAnchor = 'middle'
                break
              case 'right':
                textAnchor = 'end'
                break
              case 'below':
              case 'above':
                textAnchor = 'middle'
                break
              default:
                textAnchor = 'middle'
                break
            }

            return (
              <SvgG key={node.id} pos={pos}>
                <circle
                  r={node.size * settings.plot.nodes.scale}
                  fill={fillColor}
                  fillOpacity={settings.plot.nodes.color.opacity}
                />
                <SvgText
                  textAnchor={textAnchor}
                  //dy=".3em"
                  font={settings.plot.nodes.labels.text}
                  fill={
                    settings.plot.nodes.labels.color.on
                      ? fillColor
                      : settings.plot.nodes.labels.color.default
                  }
                >
                  {node.label}
                </SvgText>
              </SvgG>
            )
          })}
        </SvgMargin>
        <SvgG
          pos={{
            x: settings.plot.margin.left + size.w + 20,
            y: settings.plot.margin.top,
          }}
        >
          <SvgG id="group-legend">
            <SvgText
              textAnchor="start"
              font={settings.plot.nodes.labels.text}
              fill={COLOR_BLACK}
              fontWeight="bold"
            >
              Groups
            </SvgText>
            <SvgG
              pos={{ x: settings.plot.legend.dot.radius, y: 10 }}
              id="groups"
            >
              {groups.map((group, gi) => (
                <SvgG
                  key={group.id}
                  pos={{
                    x: 0,
                    y: 10 + gi * (settings.plot.legend.dot.radius * 2 + 5),
                  }}
                >
                  <SvgCircle
                    r={settings.plot.legend.dot.radius}
                    fill={group.color}
                    stroke={COLOR_BLACK}
                  />
                  <SvgG pos={{ x: settings.plot.legend.dot.radius + 5, y: 0 }}>
                    <SvgText
                      textAnchor="start"
                      font={settings.plot.nodes.labels.text}
                      fill={COLOR_BLACK}
                    >
                      {group.name}
                    </SvgText>
                  </SvgG>
                </SvgG>
              ))}
            </SvgG>
          </SvgG>
        </SvgG>
      </>
    )

    return { svg, width, height }
  }, [settings, size, network, coordinates])

  console.log('bee  ', width, height)

  return (
    <SvgBase width={width} height={height} scale={zoom}>
      {svg}
    </SvgBase>
  )
}
