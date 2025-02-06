import { COLOR_WHITE, SVG_CRISP_EDGES } from '@/consts'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { range } from '@/lib/math/range'
import { ZERO_POS, type IPos } from '@interfaces/pos'
import type { IHeatMapDisplayOptions } from './heatmap-svg-props'

export interface ICellsSvgProps {
  df: BaseDataFrame
  dfPercent?: BaseDataFrame | undefined
  rowLeaves: number[]
  colLeaves: number[]
  props: IHeatMapDisplayOptions
  pos?: IPos
}

function getUseRectId(color: string): string {
  return `rect-${color.slice(1)}`
}

export function CellsSvg({
  df,
  rowLeaves,
  colLeaves,
  props,
  pos = { ...ZERO_POS },
}: ICellsSvgProps) {
  const blockSize = props.blockSize

  function bound(x: number) {
    const r = props.range[1] - props.range[0]

    return (
      (Math.max(props.range[0], Math.min(props.range[1], x)) - props.range[0]) /
      r
    )
  }

  const colors = rowLeaves.map((row) => {
    return colLeaves.map((col) => {
      const v = df.get(row, col) as number

      const fill: string = !isNaN(v)
        ? props.cmap.getColorWithoutAlpha(bound(v))
        : COLOR_WHITE
      return fill
    })
  })

  const uniqueColorRects = [...new Set(colors.flat())].sort().map((color) => {
    const id = getUseRectId(color)

    return (
      <rect
        id={id}
        key={id}
        width={blockSize.w}
        height={blockSize.h}
        fill={color}
        //shapeRendering={SVG_CRISP_EDGES}
      />
    )
  })

  //console.log(colLeaves)

  return (
    <>
      <defs>{uniqueColorRects}</defs>
      <g
        transform={`translate(${pos.x}, ${pos.y})`}
        shapeRendering={SVG_CRISP_EDGES}
      >
        {colors.map((row, ri) => {
          return row.map((fill, ci) => {
            const id = getUseRectId(fill)

            return (
              // <rect
              //   id={`${ri}:${ci}`}
              //   key={`${ri}:${ci}`}
              //   x={ci * blockSize.w}
              //   y={ri * blockSize.h}
              //   width={blockSize.w}
              //   height={blockSize.h}
              //   fill={fill}
              //   //shapeRendering={SVG_CRISP_EDGES}
              // />
              <use
                key={`${ri}:${ci}`}
                xlinkHref={`#${id}`}
                transform={`translate(${ci * blockSize.w},${ri * blockSize.h})`}
              />
            )
          })
        })}
      </g>
    </>
  )
}

export function DotsSvg({
  df,
  dfPercent,
  rowLeaves,
  colLeaves,
  props,
  pos = { ...ZERO_POS },
}: ICellsSvgProps) {
  const blockSize = props.blockSize

  function bound(x: number) {
    const r = props.range[1] - props.range[0]

    return (
      (Math.max(props.range[0], Math.min(props.range[1], x)) - props.range[0]) /
      r
    )
  }

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      //shapeRendering={SVG_CRISP_EDGES}
    >
      {rowLeaves.map((row, ri) => {
        return colLeaves.map((col, ci) => {
          const v = df.get(row, col) as number

          const radius =
            props.style === 'Dot' && dfPercent
              ? (dfPercent.get(row, col) as number)
              : 1

          const fill: string = !isNaN(v)
            ? props.cmap.getColorWithoutAlpha(bound(v))
            : COLOR_WHITE

          return (
            <circle
              id={`${ri}:${ci}`}
              key={`${ri}:${ci}`}
              cx={ci * blockSize.w + 0.5 * blockSize.w}
              cy={ri * blockSize.h + 0.5 * blockSize.h}
              r={0.5 * blockSize.w * radius}
              fill={fill}
            />
          )
        })
      })}
    </g>
  )
}

interface IGridSvgProps {
  width: number
  height: number
  props: IHeatMapDisplayOptions
  pos?: IPos
}

export function GridSvg({
  width,
  height,
  props,
  pos = { ...ZERO_POS },
}: IGridSvgProps) {
  const blockSize = props.blockSize

  const hlines = range(blockSize.h, height, blockSize.h)
    .map((y) => `M 0,${y} L ${width},${y}`)
    .join(' ')

  const vlines = range(blockSize.w, width, blockSize.w)
    .map((x) => `M ${x},0 L ${x},${height}`)
    .join(' ')

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {props.grid.show && (
        <>
          <path
            d={hlines}
            stroke={props.grid.color}
            strokeWidth={props.grid.width}
            shapeRendering={SVG_CRISP_EDGES}
          />

          <path
            d={vlines}
            stroke={props.grid.color}
            strokeWidth={props.grid.width}
            shapeRendering={SVG_CRISP_EDGES}
          />
        </>
      )}

      {props.border.show && (
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          stroke={props.border.color}
          strokeWidth={props.border.width}
          fill="none"
          shapeRendering={SVG_CRISP_EDGES}
        />
      )}
    </g>
  )
}
