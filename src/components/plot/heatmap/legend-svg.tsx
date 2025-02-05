import { ZERO_POS, type IPos } from '@interfaces/pos'

import { GroupsContext } from '@/components/pages/modules/matcalc/groups-provider'
import { COLOR_BLACK, SVG_CRISP_EDGES } from '@/consts'
import { useContext } from 'react'
import {
  LEGEND_BLOCK_SIZE,
  type IHeatMapDisplayOptions,
} from './heatmap-svg-props'

export interface ILegendSvgProps {
  props: IHeatMapDisplayOptions
  pos?: IPos
}

export function LegendRightSvg({
  props,
  pos = { ...ZERO_POS },
}: ILegendSvgProps) {
  const { groupState } = useContext(GroupsContext)
  const legendBlockSize = LEGEND_BLOCK_SIZE.h

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {groupState.order
        .map((i) => groupState.groups.get(i)!)
        .map((g, gi) => {
          const y = (legendBlockSize + props.padding) * gi

          return (
            <g key={`group:${gi}`} transform={`translate(0, ${y})`}>
              <rect
                x={0}
                y={0}
                width={legendBlockSize}
                height={legendBlockSize}
                fill={g.color}
                stroke={
                  props.legend.stroke.show ? props.legend.stroke.color : 'none'
                }
                strokeWidth={
                  props.legend.stroke.show ? props.legend.stroke.width : 0
                }
                shapeRendering={SVG_CRISP_EDGES}
              />

              <text
                x={legendBlockSize + props.padding}
                y={0.5 * legendBlockSize}
                fill={COLOR_BLACK}
                dominantBaseline="central"
                //fontSize="smaller"
              >
                {g.name}
              </text>
            </g>
          )
        })}
    </g>
  )
}

export function LegendBottomSvg({
  props,
  pos = { ...ZERO_POS },
}: ILegendSvgProps) {
  const { groupState } = useContext(GroupsContext)
  const legendBlockSize = LEGEND_BLOCK_SIZE.h

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {groupState.order
        .map((i) => groupState.groups.get(i)!)
        .map((g, gi) => {
          const x =
            (legendBlockSize + props.legend.width * 0.4 + props.padding) * gi
          return (
            <g key={`group:${gi}`} transform={`translate(${x}, 0)`}>
              <rect
                width={legendBlockSize}
                height={legendBlockSize}
                fill={g.color}
                stroke={
                  props.legend.stroke.show ? props.legend.stroke.color : 'none'
                }
                strokeWidth={props.legend.stroke.width}
                shapeRendering={SVG_CRISP_EDGES}
              />

              <text
                x={legendBlockSize + props.padding}
                y={0.5 * legendBlockSize}
                fill={COLOR_BLACK}
                dominantBaseline="central"
                fontSize="smaller"
              >
                {g.name}
              </text>
            </g>
          )
        })}
    </g>
  )
}

export function DotLegend({ props, pos = { ...ZERO_POS } }: ILegendSvgProps) {
  const legendBlockSize = LEGEND_BLOCK_SIZE.h
  const halfW = legendBlockSize / 2
  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {props.dotLegend.sizes.map((ds, dsi) => {
        const y = (legendBlockSize + props.padding) * dsi
        const r =
          (halfW * (ds - props.dotLegend.lim[0])) /
          (props.dotLegend.lim[1] - props.dotLegend.lim[0])
        const cx = 0.5 * legendBlockSize
        return (
          <g key={`dot:${dsi}`} transform={`translate(0, ${y})`}>
            <circle cx={cx} cy={cx} r={r} fill="gray" />

            <text
              x={legendBlockSize + props.padding}
              y={cx}
              fill={COLOR_BLACK}
              dominantBaseline="central"
              fontSize="smaller"
            >
              {`${ds} ${props.dotLegend.type}`}
            </text>
          </g>
        )
      })}
    </g>
  )
}
