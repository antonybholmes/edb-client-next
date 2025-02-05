import type { LeftRightPos } from '@/components/side'
import { SVG_CRISP_EDGES } from '@/consts'
import { ZERO_POS } from '@interfaces/pos'
import { range } from 'd3'
import type { IColLabelsSvgProps, ITreeSvgProps } from './col-svg'

export function RowTreeSvg({
  tree,
  width,
  height,
  mode,
  props,
  pos = { ...ZERO_POS },
}: ITreeSvgProps & { mode: LeftRightPos }) {
  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      {tree.coords.map((coords, ri) => {
        const p = range(4).map(i => ({
          y: coords[i]!.x * width,
          x:
            mode === 'Left'
              ? height - coords[i]!.y * height
              : coords[i]!.y * height,
        }))

        return (
          <path
            key={ri}
            d={`M ${p[0]!.x},${p[0]!.y} L ${p[1]!.x},${p[1]!.y} L ${p[2]!.x},${p[2]!.y} L ${p[3]!.x},${p[3]!.y}`}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            stroke={props.rowTree.stroke.color}
            strokeWidth={props.rowTree.stroke.width}
          />
        )
      })}
    </g>
  )
}

export function RowLabelsSvg({
  df,
  leaves,
  props,
  pos = { ...ZERO_POS },
}: IColLabelsSvgProps) {
  const blockSize = props.blockSize
  const halfH = blockSize.h / 2

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {leaves.map((row, ri) => {
        return (
          <text
            key={ri}
            x={0}
            y={ri * blockSize.h + halfH}
            fill={props.rowLabels.color}
            dominantBaseline="central"
            fontSize="smaller"
            textAnchor={props.rowLabels.position === 'Left' ? 'end' : 'start'}
          >
            {df.rowNames[row]}
          </text>
        )
      })}
    </g>
  )
}
