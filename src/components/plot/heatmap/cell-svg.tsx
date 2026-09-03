import { SVG_CRISP_EDGES } from '@/consts'
import type { ICell } from '@/interfaces/cell'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { COLOR_WHITE, getTextColorForBackground } from '@/lib/color/color'
import { COLOR_MAPS } from '@/lib/color/colormap'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { ILim, numSort } from '@/lib/math/math'
import { normalize } from '@/lib/math/normalize'
import { formatNumber } from '@/lib/text/text'
import { ReactNode } from 'react'
import type { IHeatMapSettings } from '../../pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { SvgPath } from '../svg-path'
import { SvgRect } from '../svg-rect'

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
  props: IHeatMapSettings
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

  const { xs, ys } = xys({ props, shape: df.shape })

  return (
    <>
      <defs>{uniqueColorRects}</defs>
      <g
        transform={`translate(${pos.x}, ${pos.y})`}
        shapeRendering={SVG_CRISP_EDGES}
      >
        {rowLeaves.map((row, ri) => {
          const y = ys[ri]

          return colLeaves.map((col, ci) => {
            const x = xs[ci]

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
  df: BaseDataFrame
  width: number
  height: number
  props: IHeatMapSettings
  pos?: IPos
}

export function GridSvg({
  df,

  props,
  pos = { ...ZERO_POS },
}: IGridSvgProps) {
  const blockSize = props.blockSize

  const xbreaks = [
    0,
    ...numSort([...new Set(props.gaps.cols.indexes)]),
    df.shape[1],
  ]

  const ybreaks = [
    0,
    ...numSort([...new Set(props.gaps.rows.indexes)]),
    df.shape[0],
  ]

  const { xs, ys } = xys({ props, shape: df.shape })

  const hlines = []
  let x1 = 0
  let x2 = 0
  let w = 0
  for (let b = 0; b < xbreaks.length - 1; b++) {
    w = (xbreaks[b + 1] - xbreaks[b]) * blockSize.w

    x2 = x1 + w

    for (let row = 0; row < df.shape[0]; row++) {
      hlines.push(`M ${x1},${ys[row]} L ${x2},${ys[row]}`)
    }

    x1 = x2 + props.gaps.cols.size
  }

  const vlines = []
  let y1 = 0
  let y2 = 0
  let h = 0

  for (let b = 0; b < ybreaks.length - 1; b++) {
    h = (ybreaks[b + 1] - ybreaks[b]) * blockSize.h

    y2 = y1 + h

    for (let col = 0; col < df.shape[1]; col++) {
      vlines.push(`M ${xs[col]},${y1} L ${xs[col]},${y2}`)
    }

    y1 = y2 + props.gaps.rows.size
  }

  x1 = 0
  x2 = 0
  y1 = 0
  y2 = 0
  w = 0
  h = 0

  const rects: ReactNode[] = []

  for (let yi = 0; yi < ybreaks.length - 1; yi++) {
    x1 = 0
    x2 = 0

    h = (ybreaks[yi + 1] - ybreaks[yi]) * blockSize.h
    y2 = y1 + h

    for (let xi = 0; xi < xbreaks.length - 1; xi++) {
      w = (xbreaks[xi + 1] - xbreaks[xi]) * blockSize.w
      x2 = x1 + w

      rects.push(
        <SvgRect
          key={`grid:${yi}:${xi}`}
          x={x1}
          y={y1}
          width={w}
          height={h}
          sp={props.border}
          shapeRendering={SVG_CRISP_EDGES}
        />
      )

      x1 = x2 + props.gaps.cols.size
    }

    y1 = y2 + props.gaps.rows.size
  }

  // const vlines = xs
  //   .slice(1, -1)
  //   .map((x) => `M ${x},0 L ${x},${height}`)
  //   .join(' ')

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
