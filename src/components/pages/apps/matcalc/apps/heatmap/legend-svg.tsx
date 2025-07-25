import { ZERO_POS, type IPos } from '@interfaces/pos'

import { SVG_CRISP_EDGES } from '@/consts'
import {
  LEGEND_BLOCK_SIZE,
  type IHeatMapDisplayOptions,
} from '@components/plot/heatmap/heatmap-svg-props'
import { COLOR_BLACK } from '@lib/color/color'
import { formatNumber } from '@lib/text/text'
import { useHistory } from '../../history/history-store'

export interface ILegendSvgProps {
  props: IHeatMapDisplayOptions
  pos?: IPos
}

export function LegendRightSvg({
  props,
  pos = { ...ZERO_POS },
}: ILegendSvgProps) {
  const { groups } = useHistory()

  const legendBlockSize = LEGEND_BLOCK_SIZE.h
  const cx = 0.5 * legendBlockSize

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {props.legend.title.show && (
        <text fontSize="small" fontWeight="bold" y={-cx}>
          {props.legend.title.text}
        </text>
      )}
      {groups.map((g, gi) => {
        // looks more visually appealing when gap is smaller
        const y = (legendBlockSize + props.padding / 2) * gi

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
              fontSize="small"
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
  const { groups } = useHistory()
  const legendBlockSize = LEGEND_BLOCK_SIZE.h

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {groups.map((g, gi) => {
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
  const suffix = props.dot.mode === 'groups' ? '%' : ''
  const cx = 0.5 * legendBlockSize

  //console.log('props in dot legend',props)

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {props.dot.legend.title.show && (
        <text fontSize="small" fontWeight="bold" y={-cx}>
          {props.dot.legend.title.text}
        </text>
      )}
      <g>
        {props.dot.sizes.map((ds, dsi) => {
          const y = (legendBlockSize + props.padding * 0.5) * dsi
          const r =
            (halfW * (ds - props.dot.lim[0])) /
            (props.dot.lim[1] - props.dot.lim[0])

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
                {`${formatNumber(ds, props.cells.values.dp)}${suffix ? suffix : ''}`}
              </text>
            </g>
          )
        })}
      </g>
    </g>
  )
}
