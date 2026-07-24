import { ZERO_POS, type IPos } from '@/interfaces/pos'

import { LEGEND_BLOCK_SIZE } from '@/components/plot/heatmap/heatmap-svg-props'
import { SvgText } from '@/components/plot/svg-text'
import { SVG_CRISP_EDGES } from '@/consts'
import type { IClusterGroupRow } from '@/lib/cluster-group'
import { COLOR_BLACK } from '@/lib/color/color'
import type { ReactElement, ReactNode } from 'react'
import { useHeatmapContext } from './heatmap-provider'

export interface ILegendSvgProps {
  groupRows: IClusterGroupRow[]
  pos?: IPos
}

export function LegendRightSvg({
  groupRows,
  pos = { ...ZERO_POS },
}: ILegendSvgProps) {
  const { plot } = useHeatmapContext()
  const props = plot.props

  //const legendBlockSize = LEGEND_BLOCK_SIZE.h
  const cx = 0.5 * props.legend.icon.size

  const items: ReactElement[] = []
  let y = 0

  for (const [gri, gr] of groupRows.entries()) {
    for (const [gi, g] of gr.groups.entries()) {
      //const cg = g.group
      // looks more visually appealing when gap is smaller

      let shape: ReactNode

      switch (props.legend.icon.shape) {
        case 'c':
          shape = (
            <circle
              cx={props.legend.icon.size / 2}
              cy={props.legend.icon.size / 2}
              r={props.legend.icon.size / 2}
              fill={g.color}
              stroke={
                props.legend.stroke.show ? props.legend.stroke.value : 'none'
              }
              strokeWidth={
                props.legend.stroke.show ? props.legend.stroke.width : 0
              }
            />
          )
          break
        default:
          shape = (
            <rect
              x={0}
              y={0}
              width={props.legend.icon.size}
              height={props.legend.icon.size}
              fill={g.color}
              stroke={
                props.legend.stroke.show ? props.legend.stroke.value : 'none'
              }
              strokeWidth={
                props.legend.stroke.show ? props.legend.stroke.width : 0
              }
              shapeRendering={SVG_CRISP_EDGES}
            />
          )
      }

      items.push(
        <g key={`group:${gri}:${gi}`} transform={`translate(0, ${y})`}>
          {shape}

          <SvgText
            x={props.legend.icon.size + props.padding}
            y={0.5 * props.legend.icon.size}
            fill={COLOR_BLACK}
            dominantBaseline="central"
            font={props.legend}
          >
            {g.name}
          </SvgText>
        </g>
      )
      y += props.legend.icon.size + props.padding / 2
    }
  }

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {props.legend.title.show && (
        <SvgText font={props.legend.title} fontWeight="bold" y={-cx}>
          {props.legend.title.text}
        </SvgText>
      )}
      {items}
    </g>
  )
}

export function LegendBottomSvg({
  groupRows,

  pos = { ...ZERO_POS },
}: ILegendSvgProps) {
  const { plot } = useHeatmapContext()
  const props = plot.props
  //const { groups } = useHistory()
  const legendBlockSize = LEGEND_BLOCK_SIZE.h

  //const groupsToPlot = groups.filter(g => g.group.show)

  const items: ReactElement[] = []
  let x = 0

  for (const [gri, gr] of groupRows.entries()) {
    for (const [gi, g] of gr.groups.entries()) {
      //const cg = g.group
      // looks more visually appealing when gap is smaller

      let shape: ReactNode

      switch (props.legend.icon.shape) {
        case 'c':
          shape = (
            <circle
              cx={props.legend.icon.size / 2}
              cy={props.legend.icon.size / 2}
              r={props.legend.icon.size / 2}
              fill={g.color}
              stroke={
                props.legend.stroke.show ? props.legend.stroke.value : 'none'
              }
              strokeWidth={
                props.legend.stroke.show ? props.legend.stroke.width : 0
              }
            />
          )
          break
        default:
          shape = (
            <rect
              x={0}
              y={0}
              width={props.legend.icon.size}
              height={props.legend.icon.size}
              fill={g.color}
              stroke={
                props.legend.stroke.show ? props.legend.stroke.value : 'none'
              }
              strokeWidth={
                props.legend.stroke.show ? props.legend.stroke.width : 0
              }
              shapeRendering={SVG_CRISP_EDGES}
            />
          )
      }

      items.push(
        <g key={`group:${gi}`} transform={`translate(${x}, 0)`}>
          {shape}

          <SvgText
            x={legendBlockSize + props.padding}
            y={0.5 * legendBlockSize}
            fill={COLOR_BLACK}
            dominantBaseline="central"
            font={props.legend}
          >
            {g.name}
          </SvgText>
        </g>
      )
      x += legendBlockSize + props.legend.width * 0.4 + props.padding
    }
  }

  return <g transform={`translate(${pos.x}, ${pos.y})`}>{items}</g>
}

export function DotLegend({ pos = { ...ZERO_POS } }: ILegendSvgProps) {
  const { plot } = useHeatmapContext()

  const props = plot.props

  const legendBlockSize = Math.min(props.blockSize.w, props.blockSize.h) //  LEGEND_BLOCK_SIZE.h
  const halfW = legendBlockSize / 2
  //const suffix = props.dot.mode === 'groups' ? '%' : ''
  const cx = 0.5 * legendBlockSize

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {props.dot.legend.title.show && (
        <SvgText font={props.legend.title} y={-cx}>
          {props.dot.legend.title.text}
        </SvgText>
      )}
      <g>
        {props.dot.sizes.map((ds, dsi) => {
          const y = (legendBlockSize + props.padding * 0.5) * dsi
          const r = halfW * ds.size // (halfW * (ds - props.dot.lim[0])) / (props.dot.lim[1] - props.dot.lim[0])

          return (
            <g key={`dot:${dsi}`} transform={`translate(0, ${y})`}>
              <circle cx={cx} cy={cx} r={r} fill="gray" />

              <SvgText
                x={legendBlockSize + props.padding}
                y={cx}
                dominantBaseline="central"
                font={props.legend}
              >
                {/* {`${formatNumber(ds, props.cells.values.dp)}${suffix ? suffix : ''}`} */}
                {/* {`${ds.value}${suffix ? suffix : ''}`} */}
                {ds.value}
              </SvgText>
            </g>
          )
        })}
      </g>
    </g>
  )
}
