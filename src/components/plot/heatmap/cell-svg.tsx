import { SVG_CRISP_EDGES } from '@/consts'
import type { ICell } from '@/interfaces/cell'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { COLOR_WHITE, getTextColorForBackground } from '@/lib/color/color'
import { COLOR_MAPS } from '@/lib/color/colormap'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { normalize } from '@/lib/math/normalize'
import { range } from '@/lib/math/range'
import { formatNumber } from '@/lib/text/text'
import { SvgPath } from '../svg-path'
import { SvgRect } from '../svg-rect'
import type { IHeatMapDisplayOptions } from './heatmap-svg-props'

// we want circles slightly smaller than box to allow for borders
const RADIUS_FACTOR = 1 //0.96

export interface ICellsSvgProps {
  df: BaseDataFrame
  dfRaw?: BaseDataFrame | undefined
  dfSize?: BaseDataFrame | undefined
  rowLeaves: number[]
  colLeaves: number[]
  handleVariantEnter?: (pos: IPos, cell: ICell) => void
  handleVariantLeave?: () => void
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
  handleVariantEnter,
  handleVariantLeave,
  pos = { ...ZERO_POS },
}: ICellsSvgProps) {
  const blockSize = props.blockSize

  const cmap = COLOR_MAPS[props.cmap]!

  const colors = rowLeaves.map((row) => {
    return colLeaves.map((col) => {
      const v = df.get(row, col) as number

      const fill: string = !isNaN(v)
        ? cmap.getHexColor(normalize(v, props.range), false)
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

  return (
    <>
      <defs>{uniqueColorRects}</defs>
      <g
        transform={`translate(${pos.x}, ${pos.y})`}
        shapeRendering={SVG_CRISP_EDGES}
      >
        {rowLeaves.map((row, ri) => {
          const y = pos.y + row * blockSize.h
          return colLeaves.map((col, ci) => {
            const x = pos.x + col * blockSize.w
            const fill = colors[ri]![ci]!

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
                onMouseEnter={() => {
                  handleVariantEnter?.(
                    {
                      x,
                      y,
                    },
                    { row: ri, col: ci }
                  )
                }}
                onMouseLeave={() => {
                  handleVariantLeave?.()
                }}
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
  handleVariantEnter,
  handleVariantLeave,
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
        const y = pos.y + row * blockSize.h
        return colLeaves.map((col, ci) => {
          const x = pos.x + col * blockSize.w
          const v = df.get(row, col) as number

          const radius =
            props.mode === 'dot' && dfSize
              ? (dfSize.get(row, col) as number)
              : 1

          const fill: string = !isNaN(v)
            ? cmap.getHexColor(bound(v), false)
            : COLOR_WHITE

          let cellValue: number = Number.NaN

          if (props.cells.values.show) {
            if (props.dot.useOriginalValuesForSizes && dfRaw !== undefined) {
              cellValue = dfRaw.get(row, col) as number //dfRaw ? (dfRaw.get(row, col) as number) : undefined
            } else {
              cellValue = df.get(row, col) as number
            }

            if (
              props.cells.values.filter.on &&
              cellValue < props.cells.values.filter.value
            ) {
              cellValue = Number.NaN
            }
          }

          const cx = 0.5 * blockSize.w
          const cy = 0.5 * blockSize.h
          const r =
            0.5 * Math.min(blockSize.w, blockSize.h) * radius * RADIUS_FACTOR

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
              {/* Handle mouse events on transparent rect on top of circles to avoid 
              issues with small circles not triggering mouse events */}
              <rect
                width={blockSize.w}
                height={blockSize.h}
                fill="transparent"
                onMouseEnter={() => {
                  handleVariantEnter?.(
                    {
                      x,
                      y,
                    },
                    { row: ri, col: ci }
                  )
                }}
                onMouseLeave={() => {
                  handleVariantLeave?.()
                }}
              />
              <circle
                id={`${ri}:${ci}`}
                key={`${ri}:${ci}`}
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                stroke={
                  props.cells.border.show ? props.cells.border.value : 'none'
                }
                strokeWidth={
                  props.cells.border.show ? props.cells.border.width : 0
                }
                pointerEvents="none"
              />

              {!Number.isNaN(cellValue) && (
                <text
                  x={cx}
                  y={cy}
                  fill={textColor}
                  dominantBaseline="middle"
                  fontSize="small"
                  textAnchor="middle"
                  pointerEvents="none"
                  //fontWeight={track.displayOptions.font.weight}
                >
                  {formatNumber(cellValue, { dp: props.cells.values.dp })}
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
    .map((y) => `M 0,${y} L ${width},${y}`)
    .join(' ')

  const vlines = range(blockSize.w, width, blockSize.w)
    .map((x) => `M ${x},0 L ${x},${height}`)
    .join(' ')

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {props.grid.show && (
        <>
          <SvgPath
            d={hlines}
            sp={props.grid}
            shapeRendering={SVG_CRISP_EDGES}
          />

          <SvgPath
            d={vlines}
            sp={props.grid}

            shapeRendering={SVG_CRISP_EDGES}
          />
        </>
      )}

      {props.border.show && (
        <SvgRect
          x={0}
          y={0}
          width={width}
          height={height}
          sp={props.border}

          shapeRendering={SVG_CRISP_EDGES}
        />
      )}
    </g>
  )
}
