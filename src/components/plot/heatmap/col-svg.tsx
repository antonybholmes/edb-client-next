import { ZERO_POS, type IPos } from '@/interfaces/pos'
import type { IClusterFrame, IClusterTree } from '@/lib/math/hcluster'

import { useHeatmapContext } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-provider'
import { SVG_CRISP_EDGES } from '@/consts'
import { COLOR_WHITE } from '@/lib/color/color'
import { range } from '@/lib/math/range'
import { ReactElement } from 'react'
import type { IHeatMapSettings } from '../../pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { SvgG } from '../svg-g'
import { SvgText } from '../svg-text'
import { CellGaps } from './cell-gaps'

export interface ITreeSvgProps {
  tree: IClusterTree
  width: number
  height: number
  gaps: CellGaps
  props: IHeatMapSettings
  pos?: IPos
}

export function ColTreeTopSvg({
  tree,
  width,
  height,
  gaps,
  props,
  pos = { ...ZERO_POS },
}: ITreeSvgProps) {
  const gElems: ReactElement[] = []

  const points = range(4)

  for (let [ri, branch] of tree.coords.entries()) {
    const p = points.map((i) => {
      const x = branch.coords[i]!.x * width

      return {
        x: x + gaps.offset(x),
        y: height - branch.coords[i]!.y * height,
      }
    })

    gElems.push(
      <path
        key={ri}
        d={`M ${p[0]!.x},${p[0]!.y} L ${p[1]!.x},${p[1]!.y} L ${p[2]!.x},${p[2]!.y} L ${p[3]!.x},${p[3]!.y}`}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        stroke={props.tree.col.stroke.value}
        strokeWidth={props.tree.col.stroke.width}
      />
    )
  }

  return (
    <SvgG pos={pos} shapeRendering={SVG_CRISP_EDGES}>
      {gElems}
    </SvgG>
  )
}

export interface IColLabelsSvgProps {
  leaves: number[]
  gaps: CellGaps

  colorMap?: Map<string, Map<number, string>>
  pos?: IPos
}

export function ColLabelsSvg({
  leaves,
  gaps,
  colorMap,
  pos = { ...ZERO_POS },
}: IColLabelsSvgProps) {
  const { plot } = useHeatmapContext()
  const props = plot.props

  const df = (plot.dataframes['main'] as IClusterFrame).df

  const groupRows = plot.groupRows || []
  const id = groupRows[0]?.id

  const blockSize = props.blockSize

  const gElems: ReactElement[] = []

  const offset = blockSize.w / 2

  for (const [ci, col] of leaves.entries()) {
    const x = gaps.position(ci) + offset
    gElems.push(
      <SvgText
        key={ci}
        transform={`translate(${x}, 0) rotate(270)`}
        fill={
          props.labels.col.isColored
            ? (colorMap?.get(id)?.get(col) ?? props.labels.col.font.fill.value)
            : undefined
        }
        dominantBaseline="central"
        textAnchor={props.labels.col.position === 'top' ? 'start' : 'end'}
        font={props.labels.col}
      >
        {df.colName(col)}
      </SvgText>
    )

    // x += blockSize.w
  }

  return <SvgG pos={pos}>{gElems}</SvgG>
}

export function ColGroupsSvg({
  leaves,
  gaps,
  colorMap,
  pos = { ...ZERO_POS },
}: IColLabelsSvgProps) {
  const { plot } = useHeatmapContext()

  const props = plot.props

  const groupRows = plot.groupRows || []

  const blockSize = props.blockSize

  const elems: ReactElement[] = []
  let y = 0

  for (const [gri, gr] of groupRows.entries()) {
    let x = 0

    const gElems: ReactElement[] = []

    for (const [ci, col] of leaves.entries()) {
      const fill: string = colorMap?.get(gr.id)?.get(col) ?? COLOR_WHITE

      const x = gaps.position(col)

      gElems.push(
        <rect
          id={`group:${gri}:${ci}`}
          key={`group:${gri}:${ci}`}
          x={x}
          y={0}
          width={blockSize.w}
          height={props.groups.height}
          fill={fill}
          stroke={props.groups.grid.show ? props.groups.grid.value : 'none'}
          strokeWidth={props.groups.grid.width}
          shapeRendering={SVG_CRISP_EDGES}
        />
      )
    }

    if (props.groups.border.show) {
      for (const [spanIndex, span] of gaps.spans.entries()) {
        gElems.push(
          <rect
            key={`group-border:${gri}:${spanIndex}`}
            x={span.p1}
            y={0}
            width={span.w}
            height={props.groups.height}
            fill="none"
            stroke={props.groups.border.value}
            strokeWidth={props.groups.border.width}
            shapeRendering={SVG_CRISP_EDGES}
          />
        )
      }
    }

    if (props.groups.labels.show) {
      gElems.push(
        <SvgText
          key={`group-row-name:${gri}`}
          x={
            leaves.length * blockSize.w +
            props.gaps.cols.indexes.length * props.gaps.cols.size +
            props.padding
          }
          y={props.groups.height / 2}
          font={props.groups.labels}
        >
          {gr.name}
        </SvgText>
      )
    }

    const grElem = (
      <SvgG key={`group-row:${gri}`} pos={{ x: 0, y: y }}>
        {gElems}
      </SvgG>
    )

    elems.push(grElem)

    y += props.groups.height + props.padding
  }

  return <SvgG pos={pos}>{elems}</SvgG>
}
