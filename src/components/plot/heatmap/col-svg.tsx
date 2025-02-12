import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import type { IClusterTree } from '@/lib/math/hcluster'
import { ZERO_POS, type IPos } from '@interfaces/pos'

import { COLOR_WHITE, SVG_CRISP_EDGES } from '@/consts'
import { range } from '@/lib/math/range'
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
            stroke={props.colTree.stroke.color}
            strokeWidth={props.colTree.stroke.width}
          />
        )
      })}
    </g>
  )
}

export interface IColLabelsSvgProps {
  df: BaseDataFrame
  leaves: number[]
  props: IHeatMapDisplayOptions
  colorMap?: Map<number, string>
  pos?: IPos
}

export function ColLabelsSvg({
  df,
  leaves,
  props,
  colorMap,
  pos = { ...ZERO_POS },
}: IColLabelsSvgProps) {
  const blockSize = props.blockSize
  const halfW = blockSize.w / 2

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {leaves.map((col, ci) => {
        const x = ci * blockSize.w + halfW
        return (
          <text
            key={ci}
            transform={`translate(${x}, 0) rotate(270)`}
            fill={
              props.colLabels.isColored
                ? (colorMap?.get(col) ?? props.colLabels.color)
                : props.colLabels.color
            }
            dominantBaseline="central"
            textAnchor={props.colLabels.position === 'Top' ? 'start' : 'end'}
            fontSize="smaller"
          >
            {df.colName(col)}
          </text>
        )
      })}
    </g>
  )
}

export function ColGroupsSvg({
  leaves,
  props,
  colorMap,
  pos = { ...ZERO_POS },
}: IColLabelsSvgProps) {
  const blockSize = props.blockSize

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {leaves.map((col, ci) => {
        const fill: string = colorMap?.get(col) ?? COLOR_WHITE

        return (
          <rect
            id={`color:${ci}`}
            key={`color:${ci}`}
            x={ci * blockSize.w}
            y={0}
            width={blockSize.w}
            height={props.groups.height}
            fill={fill}
            stroke={props.groups.grid.show ? props.groups.grid.color : 'none'}
            strokeWidth={props.groups.grid.width}
            shapeRendering={SVG_CRISP_EDGES}
          />
        )
      })}

      {props.groups.border.show && (
        <rect
          x={0}
          y={0}
          width={leaves.length * blockSize.w}
          height={props.groups.height}
          fill="none"
          stroke={props.groups.border.color}
          strokeWidth={props.groups.border.width}
          shapeRendering={SVG_CRISP_EDGES}
        />
      )}
    </g>
  )
}
