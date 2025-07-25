import { SVG_CRISP_EDGES } from '@/consts'
import type { LeftRightPos } from '@components/side'
import { ZERO_POS } from '@interfaces/pos'
import { range } from 'd3'
import { Fragment } from 'react'
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
            mode === 'left'
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
  const rowMetaN = range(
    0,
    props.rowLabels.showMetadata ? df.rowMetaData.shape[1] : 1
  )
  const isLeft = props.rowLabels.position === 'left'

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {leaves.map((row, ri) => {
        return (
          <Fragment key={row}>
            {rowMetaN.map(rmi => {
              return (
                <text
                  key={`${row}:${rmi}`}
                  id={`${row}:${rmi}`}
                  x={rmi * props.rowLabels.width * (isLeft ? -1 : 1)}
                  y={ri * blockSize.h + halfH}
                  fill={props.rowLabels.color}
                  dominantBaseline="central"
                  fontSize="smaller"
                  textAnchor={isLeft ? 'end' : 'start'}
                >
                  {df.rowMetaData.str(row, rmi)}
                </text>
              )
            })}
          </Fragment>
        )
      })}
    </g>
  )
}
