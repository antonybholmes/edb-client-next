import { SVG_CRISP_EDGES } from '@/consts'
import { COLOR_MAPS } from '@/lib/color/colormap'
import { ZERO_POS, type IPos } from '@interfaces/pos'
import { COLOR_WHITE, getTextColorForBackground } from '@lib/color/color'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { normalize } from '@lib/math/normalize'
import { range } from '@lib/math/range'
import { formatNumber } from '@lib/text/text'
import type { IHeatMapDisplayOptions } from './heatmap-svg-props'

// we want circles slightly smaller than box to allow for borders
const RADIUS_FACTOR = 1 //0.96

export interface ICellsSvgProps {
  df: BaseDataFrame
  dfRaw?: BaseDataFrame | undefined
  dfSize?: BaseDataFrame | undefined
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

  // function bound(x: number) {
  //   const r = props.range[1] - props.range[0]

  //   return (
  //     (Math.max(props.range[0], Math.min(props.range[1], x)) - props.range[0]) /
  //     r
  //   )
  // }

  const cmap = COLOR_MAPS[props.cmap]!

  console.log(COLOR_MAPS, props.cmap)

  const colors = rowLeaves.map(row => {
    return colLeaves.map(col => {
      const v = df.get(row, col) as number

      //console.log(row, col, v)

      const fill: string = !isNaN(v)
        ? cmap.getHexColor(normalize(v, props.range), false)
        : COLOR_WHITE
      return fill
    })
  })

  const uniqueColorRects = [...new Set(colors.flat())].sort().map(color => {
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
  dfRaw,
  dfSize,
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

  const cmap = COLOR_MAPS[props.cmap]!

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      //shapeRendering={SVG_CRISP_EDGES}
    >
      {rowLeaves.map((row, ri) => {
        return colLeaves.map((col, ci) => {
          const v = df.get(row, col) as number

          const radius =
            props.mode === 'dot' && dfSize
              ? (dfSize.get(row, col) as number)
              : 1

          const fill: string = !isNaN(v)
            ? cmap.getHexColor(bound(v), false)
            : COLOR_WHITE

          let cellValue: number | undefined = undefined

          if (props.cells.values.show) {
            if (props.dot.useOriginalValuesForSizes) {
              cellValue = dfRaw ? (dfRaw.get(row, col) as number) : undefined
            } else {
              cellValue = df.get(row, col) as number
            }
          }

          if (
            cellValue !== undefined &&
            props.cells.values.filter.on &&
            cellValue < props.cells.values.filter.value
          ) {
            cellValue = undefined
          }

          const cx = 0.5 * blockSize.w
          const cy = 0.5 * blockSize.h
          const r = 0.5 * blockSize.w * radius * RADIUS_FACTOR

          const textColor =
            props.cells.values.autoColor.on && radius > 0.4
              ? getTextColorForBackground(
                  fill,
                  props.cells.values.autoColor.threshold
                )
              : props.cells.values.color

          return (
            <g
              key={`${ri}:${ci}`}
              transform={`translate(${ci * blockSize.w},${ri * blockSize.h})`}
            >
              <circle
                id={`${ri}:${ci}`}
                key={`${ri}:${ci}`}
                cx={cx}
                cy={cx}
                r={r}
                fill={fill}
                stroke={
                  props.cells.border.show ? props.cells.border.color : 'none'
                }
                strokeWidth={
                  props.cells.border.show ? props.cells.border.width : 0
                }
                //shapeRendering={SVG_CRISP_EDGES}
              />

              {cellValue !== undefined && (
                <text
                  x={cx}
                  y={cy}
                  fill={textColor}
                  dominantBaseline="middle"
                  fontSize="small"
                  textAnchor="middle"
                  //fontWeight={track.displayOptions.font.weight}
                >
                  {formatNumber(cellValue, props.cells.values.dp)}
                </text>
              )}
            </g>
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
    .map(y => `M 0,${y} L ${width},${y}`)
    .join(' ')

  const vlines = range(blockSize.w, width, blockSize.w)
    .map(x => `M ${x},0 L ${x},${height}`)
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
