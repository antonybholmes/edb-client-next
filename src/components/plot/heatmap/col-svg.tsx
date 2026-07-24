import { ZERO_POS, type IPos } from '@/interfaces/pos'
import type { IClusterFrame, IClusterTree } from '@/lib/math/hcluster'

import { useHeatmapContext } from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-provider'
import { SVG_CRISP_EDGES } from '@/consts'
import { COLOR_WHITE } from '@/lib/color/color'
import { range } from '@/lib/math/range'
import { ReactElement } from 'react'
import { SvgText } from '../svg-text'
import type { IHeatMapDisplayOptions } from './heatmap-svg-props'

export interface ITreeSvgProps {
  tree: IClusterTree
  width: number
  height: number
  props: IHeatMapDisplayOptions
  pos?: IPos
}

export function ColTreeTopSvg({
  tree,
  width,
  height,
  props,
  pos = { ...ZERO_POS },
}: ITreeSvgProps) {
  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      {tree.coords.map((coords, ri) => {
        const p = range(4).map((i) => ({
          x: coords[i]!.x * width,
          y: height - coords[i]!.y * height,
        }))

        return (
          <path
            key={ri}
            d={`M ${p[0]!.x},${p[0]!.y} L ${p[1]!.x},${p[1]!.y} L ${p[2]!.x},${p[2]!.y} L ${p[3]!.x},${p[3]!.y}`}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            stroke={props.colTree.stroke.value}
            strokeWidth={props.colTree.stroke.width}
          />
        )
      })}
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

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {leaves.map((col, ci) => {
        const x = ci * blockSize.w + halfW
        return (
          <SvgText
            key={ci}
            transform={`translate(${x}, 0) rotate(270)`}
            fill={
              props.colLabels.isColored
                ? (colorMap?.get(id)?.get(col) ??
                  props.colLabels.font.fill.value)
                : undefined
            }
            dominantBaseline="central"
            textAnchor={props.colLabels.position === 'top' ? 'start' : 'end'}
            font={props.colLabels}
          >
            {df.colName(col)}
          </SvgText>
        )
      })}
    </g>
  )
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

  const elems: ReactElement[] = []
  let y = 0

  for (const [gri, gr] of groupRows.entries()) {
    let x = 0

    const gElems: ReactElement[] = []

    for (const [ci, col] of leaves.entries()) {
      const fill: string = colorMap?.get(gr.id)?.get(col) ?? COLOR_WHITE

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
      gElems.push(
        <rect
          key={`group-border:${gri}`}
          x={0}
          y={0}
          width={leaves.length * blockSize.w}
          height={props.groups.height}
          fill="none"
          stroke={props.groups.border.value}
          strokeWidth={props.groups.border.width}
          shapeRendering={SVG_CRISP_EDGES}
        />
      )
    }

    if (props.groups.labels.show) {
      gElems.push(
        <SvgText
          key={`group-row-name:${gri}`}
          x={leaves.length * blockSize.w + props.padding}
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
