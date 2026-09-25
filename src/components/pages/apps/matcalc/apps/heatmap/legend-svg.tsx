import { ZERO_POS, type IPos } from '@/interfaces/pos'

import { LEGEND_BLOCK_SIZE } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgG } from '@/components/plot/svg-g'
import { SvgRect } from '@/components/plot/svg-rect'
import { SvgText } from '@/components/plot/svg-text'
import { SVG_CRISP_EDGES } from '@/consts'
import type { IClusterGroupRow } from '@/lib/cluster-group'
import { COLOR_BLACK } from '@/lib/color/color'
import { memo, type ReactElement, type ReactNode } from 'react'
import { useHeatmapContext } from './heatmap-provider'
import { nodeRadiusFunc } from './svg/cell-svg'

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
            <SvgCircle
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
            <SvgRect
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
        <SvgG key={`group:${gri}:${gi}`} pos={{ x: 0, y }}>
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
        </SvgG>
      )

      y += props.legend.icon.size + props.padding / 2
    }
  }

  return (
    <SvgG pos={pos}>
      {props.legend.title.show && (
        <SvgText font={props.legend.title} fontWeight="bold" y={-cx}>
          {props.legend.title.text}
        </SvgText>
      )}
      {items}
    </SvgG>
  )
}

export const LegendBottomSvg = memo(function LegendBottomSvg({
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
            <SvgCircle
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
            <SvgRect
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
        <SvgG key={`group:${gi}`} pos={{ x, y: 0 }}>
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
        </SvgG>
      )
      x += legendBlockSize + props.legend.width * 0.4 + props.padding
    }
  }

  return <SvgG pos={pos}>{items}</SvgG>
})

export const DotLegend = memo(function DotLegend({
  pos = { ...ZERO_POS },
}: ILegendSvgProps) {
  const { plot } = useHeatmapContext()

  const props = plot.props

  const legendBlockSize = Math.min(props.blockSize.w, props.blockSize.h) //  LEGEND_BLOCK_SIZE.h
  const halfW = legendBlockSize / 2
  //const suffix = props.dot.mode === 'groups' ? '%' : ''
  const cx = 0.5 * legendBlockSize

  const radiusScale = nodeRadiusFunc(halfW, props.dot.scale.mode)

  const elems: ReactElement[] = []

  let y = 0
  for (const [dsi, ds] of props.dot.sizes.entries()) {
    //const r = halfW * ds.size * props.dot.scale.factor // (halfW * (ds - props.dot.lim[0])) / (props.dot.lim[1] - props.dot.lim[0])
    const r = radiusScale(ds.size) * props.dot.scale.factor

    elems.push(
      <SvgG key={`dot:${dsi}`} pos={{ x: 0, y }}>
        <SvgCircle cx={cx} cy={cx} r={r} fill="gray" />

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
      </SvgG>
    )

    // add our radius plus radius of next element to get
    // nice spacing
    if (dsi < props.dot.sizes.length - 1) {
      y +=
        r +
        radiusScale(props.dot.sizes[dsi + 1].size) * props.dot.scale.factor +
        props.padding
    }
  }

  return (
    <SvgG pos={pos}>
      {props.dot.legend.title.show && (
        <SvgText font={props.legend.title} y={-cx}>
          {props.dot.legend.title.text}
        </SvgText>
      )}

      {elems}
    </SvgG>
  )
})
