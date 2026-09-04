import { ZERO_POS, type IPos } from '@/interfaces/pos'
import type { IClusterFrame, IClusterTree } from '@/lib/math/hcluster'

import { useHeatmapContext } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-provider'
import { SVG_CRISP_EDGES } from '@/consts'
import { COLOR_WHITE } from '@/lib/color/color'
import { numSort } from '@/lib/math/math'
import { range } from '@/lib/math/range'
import { ReactElement } from 'react'
import type { IHeatMapSettings } from '../../pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
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
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      {gElems}
    </g>
  )
}

export interface IColLabelsSvgProps {
  leaves: number[]

  colorMap?: Map<string, Map<number, string>>
  pos?: IPos
}

export function ColLabelsSvg({
  leaves,

  colorMap,
  pos = { ...ZERO_POS },
}: IColLabelsSvgProps) {
  const { plot } = useHeatmapContext()
  const props = plot.props

  const df = (plot.dataframes['main'] as IClusterFrame).df

  const groupRows = plot.groupRows || []
  const id = groupRows[0]?.id

  const blockSize = props.blockSize
  const halfW = blockSize.w / 2

  const xbreaks = [
    0,
    ...numSort([...new Set(props.gaps.cols.indexes)]),
    leaves.length,
  ]

  const gElems: ReactElement[] = []

  let x = blockSize.w / 2

  for (const [ci, col] of leaves.entries()) {
    x += props.gaps.cols.indexes.includes(ci) ? props.gaps.cols.size : 0

    gElems.push(
      <SvgText
        key={ci}
        transform={`translate(${x}, 0) rotate(270)`}
        fill={
          props.colLabels.isColored
            ? (colorMap?.get(id)?.get(col) ?? props.colLabels.font.fill.value)
            : undefined
        }
        dominantBaseline="central"
        textAnchor={props.colLabels.position === 'top' ? 'start' : 'end'}
        font={props.colLabels}
      >
        {df.colName(col)}
      </SvgText>
    )

    x += blockSize.w
  }

  return <g transform={`translate(${pos.x}, ${pos.y})`}>{gElems}</g>
}

export function ColGroupsSvg({
  leaves,

  colorMap,
  pos = { ...ZERO_POS },
}: IColLabelsSvgProps) {
  const { plot } = useHeatmapContext()

  const props = plot.props

  const groupRows = plot.groupRows || []

  const blockSize = props.blockSize

  const xbreaks = [
    0,
    ...numSort([...new Set(props.gaps.cols.indexes)]),
    leaves.length,
  ]

  const elems: ReactElement[] = []
  let y = 0

  for (const [gri, gr] of groupRows.entries()) {
    let x = 0

    const gElems: ReactElement[] = []

    for (const [ci, col] of leaves.entries()) {
      const fill: string = colorMap?.get(gr.id)?.get(col) ?? COLOR_WHITE

      x += props.gaps.cols.indexes.includes(ci) ? props.gaps.cols.size : 0

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

      x += blockSize.w
    }

    if (props.groups.border.show) {
      let x1 = xbreaks[0] * blockSize.w
      let x2 = 0
      let w = 0

      for (let b = 0; b < xbreaks.length - 1; b++) {
        w = (xbreaks[b + 1] - xbreaks[b]) * blockSize.w

        x2 = x1 + w

        gElems.push(
          <rect
            key={`group-border:${gri}:${b}`}
            x={x1}
            y={0}
            width={w}
            height={props.groups.height}
            fill="none"
            stroke={props.groups.border.value}
            strokeWidth={props.groups.border.width}
            shapeRendering={SVG_CRISP_EDGES}
          />
        )

        x1 = x2 + props.gaps.cols.size
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
      <g key={`group-row:${gri}`} transform={`translate(0, ${y})`}>
        {gElems}
      </g>
    )

    elems.push(grElem)

    y += props.groups.height + props.padding
  }

  return <g transform={`translate(${pos.x}, ${pos.y})`}>{elems}</g>
}
