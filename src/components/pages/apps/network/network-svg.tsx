import { useCallback, useMemo } from 'react'

import { SvgBase } from '@/components/plot/svg-base'

import { SvgMargin } from '@/components/plot/svg-margin'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { SvgG } from '@/components/plot/svg-g'
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

    console.log(groupMap)

    const svg = (
      <SvgMargin margin={settings.plot.margin}>
        {network.edges.map((edge, idx) => {
          const sourcePos = coordinates[edge.source] || { x: 0, y: 0 }
          const targetPos = coordinates[edge.target] || { x: 0, y: 0 }
          return (
            <line
              key={idx}
              x1={sourcePos.x}
              y1={sourcePos.y}
              x2={targetPos.x}
              y2={targetPos.y}
              stroke="#cbd5e1"
              strokeWidth={edge.score * settings.plot.edges.scale}
            />
          )
        })}

        {network.nodes.map((node) => {
          const pos = coordinates[node.id] || { x: 0, y: 0 }

          let color = COLOR_BLACK

          switch (settings.plot.nodes.color.mode) {
            case 'group':
              console.log(node.group, groupMap[node.group.toLowerCase()])
              color = groupMap[node.group.toLowerCase()]?.color ?? COLOR_BLACK
              break

            default:
              color = COLOR_BLACK
              break
          }

          return (
            <SvgG key={node.id} pos={pos}>
              <circle r={node.size * settings.plot.nodes.scale} fill={color} />
              <text textAnchor="middle" dy=".3em" fill="#fff" fontSize={11}>
                {node.label}
              </text>
            </SvgG>
          )
        })}
      </SvgMargin>
    )

    return { svg, width, height }
  }, [settings, size, network, coordinates])

  return (
    <SvgBase width={width} height={height} scale={zoom}>
      {svg}
    </SvgBase>
  )
}
