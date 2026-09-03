import { SVG_CRISP_EDGES } from '@/consts'
import type { ICell } from '@/interfaces/cell'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { COLOR_WHITE, getTextColorForBackground } from '@/lib/color/color'
import { COLOR_MAPS } from '@/lib/color/colormap'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { ILim } from '@/lib/math/math'
import { normalize } from '@/lib/math/normalize'
import { formatNumber } from '@/lib/text/text'
import { ReactNode } from 'react'
import type { IHeatMapSettings } from '../../pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { SvgPath } from '../svg-path'
import { IMarginProps } from '../svg-props'
import { SvgRect } from '../svg-rect'
import { CellGaps } from './cell-gaps'

// we want circles slightly smaller than box to allow for borders
const RADIUS_FACTOR = 1 //0.96

export interface ICellsSvgProps {
  df: BaseDataFrame
  margin: IMarginProps
  xgaps: CellGaps
  ygaps: CellGaps
  dfRaw?: BaseDataFrame | undefined
  dfSize?: BaseDataFrame | undefined
  rowLeaves: number[]
  colLeaves: number[]
  handleVariantEnter?: (pos: IPos, cell: ICell) => void
  handleVariantLeave?: () => void
  props: IHeatMapSettings
  pos?: IPos
}

function getUseRectId(color: string): string {
  return `rect-${color.slice(1)}`
}

export function CellsSvg({
  df,
  margin,
  xgaps,
  ygaps,

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
          const y = ygaps.position(ri)

          return colLeaves.map((col, ci) => {
            const x = xgaps.position(ci)

            const fill = colors[ri]![ci]!

            const id = getUseRectId(fill)

            return (
              <use
                key={`${ri}:${ci}`}
                xlinkHref={`#${id}`}
                transform={`translate(${x},${y})`}
                onMouseEnter={() => {
                  handleVariantEnter?.(
                    {
                      x: x + margin.left,
                      y: y + margin.top,
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
  margin,
  xgaps,
  ygaps,
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
        const y = ygaps.position(ri)
        return colLeaves.map((col, ci) => {
          const x = xgaps.position(ci)
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
            <g key={`${ri}:${ci}`} transform={`translate(${x},${y})`}>
              {/* Handle mouse events on transparent rect on top of circles to avoid 
              issues with small circles not triggering mouse events */}
              <rect
                width={blockSize.w}
                height={blockSize.h}
                fill="transparent"
                onMouseEnter={() => {
                  handleVariantEnter?.(
                    {
                      x: x + margin.left,
                      y: y + margin.top,
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
  props: IHeatMapSettings
  pos?: IPos
  xgaps: CellGaps
  ygaps: CellGaps
}

export function GridSvg({
  props,
  xgaps,
  ygaps,
  pos = { ...ZERO_POS },
}: IGridSvgProps) {
  const blockSize = props.blockSize

  const hlines = []

  for (const xspan of xgaps.spans) {
    for (const yspan of ygaps.spans) {
      let y = yspan.p1
      for (let row = 0; row < yspan.size; row++) {
        hlines.push(`M ${xspan.p1},${y} L ${xspan.p2},${y}`)
        y += blockSize.h
      }
    }
  }

  const vlines = []

  for (const yspan of ygaps.spans) {
    for (const xspan of xgaps.spans) {
      let x = xspan.p1
      for (let col = 0; col < xspan.size; col++) {
        vlines.push(`M ${x},${yspan.p1} L ${x},${yspan.p2}`)
        x += blockSize.w
      }
    }
  }

  const rects: ReactNode[] = []

  if (props.border.show) {
    for (const [yi, yspan] of ygaps.spans.entries()) {
      for (const [xi, xspan] of xgaps.spans.entries()) {
        rects.push(
          <SvgRect
            key={`grid:${yi}:${xi}`}
            x={xspan.p1}
            y={yspan.p1}
            width={xspan.w}
            height={yspan.w}
            sp={props.border}
            shapeRendering={SVG_CRISP_EDGES}
          />
        )
      }
    }
  }

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {props.grid.show && (
        <>
          <SvgPath
            d={hlines.join(' ')}
            sp={props.grid}
            //stroke="black"
            shapeRendering={SVG_CRISP_EDGES}
          />

          <SvgPath
            d={vlines.join(' ')}
            sp={props.grid}

            shapeRendering={SVG_CRISP_EDGES}
          />
        </>
      )}

      {props.border.show && <>{rects}</>}
    </g>
  )
}

function xys({ props, shape }: { props: IHeatMapSettings; shape: ILim }): {
  xs: number[]
  ys: number[]
} {
  const blockSize = props.blockSize
  const rowGaps = new Set(props.gaps.rows.indexes)
  const colGaps = new Set(props.gaps.cols.indexes)

  const xs: number[] = []
  const ys: number[] = []
  let x = 0
  let y = 0

  console.log(rowGaps, colGaps)

  for (let i = 0; i < shape[1]; i++) {
    x += colGaps.has(i) ? props.gaps.cols.size : 0
    xs.push(x)
    x += blockSize.w
  }

  for (let i = 0; i < shape[0]; i++) {
    y += rowGaps.has(i) ? props.gaps.rows.size : 0
    ys.push(y)
    y += blockSize.h
  }
  return { xs, ys }
}
