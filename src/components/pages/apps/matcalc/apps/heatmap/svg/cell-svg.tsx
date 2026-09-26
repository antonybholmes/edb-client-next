import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgG } from '@/components/plot/svg-g'
import { SvgPath } from '@/components/plot/svg-path'
import { IMarginProps } from '@/components/plot/svg-props'
import { SvgMouseRect, SvgRect } from '@/components/plot/svg-rect'
import { SvgText } from '@/components/plot/svg-text'
import { SVG_CRISP_EDGES } from '@/consts'
import type { ICell } from '@/interfaces/cell'
import { IDim } from '@/interfaces/dim'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { COLOR_WHITE, getTextColorForBackground } from '@/lib/color/color'
import { getColorMapFromCmap } from '@/lib/color/colormap'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import { cellStr } from '@/lib/dataframe/cell'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { normalize } from '@/lib/math/normalize'
import { formatNumber } from '@/lib/text/text'
import { useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import * as d3 from 'd3'
import { memo, ReactNode } from 'react'
import { IHeatMapSettings } from '../heatmap-settings-store'
import { CellGaps } from './cell-gaps'

// we want circles slightly smaller than box to allow for borders
//const RADIUS_FACTOR = 1 //0.96

export interface ICellsSvgProps {
  df: BaseDataFrame
  margin: IMarginProps
  plotSize: IDim
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

export const CellsSvg = memo(function CellsSvg({
  df,
  margin,
  xgaps,
  ygaps,
  plotSize,
  rowLeaves,
  colLeaves,
  props,

  pos = { ...ZERO_POS },
}: ICellsSvgProps) {
  const { ref } = useSVG()

  const { showCrosshair, hideCrosshair } = useCrosshair() // Assuming there is a useCrosshair hook similar to useTooltip

  const { blockSize } = props

  const cmap = getColorMapFromCmap(props.cmap)

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

  // function _hideTooltip() {
  //   hideTooltip()
  //   hideCrosshair()
  // }

  function handleMouseMove(e: React.MouseEvent) {
    const svgP = screenToSvgPoint(ref.current, { x: e.clientX, y: e.clientY })

    const plotP = {
      x: svgP.x - margin.left,
      y: svgP.y - margin.top,
    }

    const cell = { col: xgaps.nearest(plotP.x), row: ygaps.nearest(plotP.y) }

    //console.log('bb', cell.col.index, cell.row.index)

    //if (cell.col.index === -1 || cell.row.index === -1) {
    //  _hideTooltip()
    //return
    //}

    const { relativeP } = svgPointToScreen(ref.current, {
      x: cell.col.x + blockSize.w / 2 + margin.left,
      y: cell.row.x + blockSize.h / 2 + margin.top,
    })

    showCrosshair({
      pos: relativeP,
      content: (
        <>
          <span className="font-semibold">{`${df.rowName(
            cell.row.index
          )}, ${df.colName(cell.col.index)}`}</span>
          <span>{`Row ${cell.row.index + 1}, col ${cell.col.index + 1}`}</span>
          <span>{cellStr(df.get(cell.row.index, cell.col.index))}</span>
        </>
      ),
    })
  }

  const isSquare = df.shape[0] === df.shape[1]

  return (
    <>
      <defs>{uniqueColorRects}</defs>
      <SvgG pos={pos} shapeRendering={SVG_CRISP_EDGES}>
        {rowLeaves.map((row, ri) => {
          const y = ygaps.position(ri)

          return colLeaves.map((col, ci) => {
            const x = xgaps.position(ci)

            if (!props.showDiagonal && ri === ci) {
              return null
            }

            const isLowerTriangle = ri > ci

            // only apply if we are square
            if (isSquare && props.upperTriangular && isLowerTriangle) {
              return null
            }

            const fill = colors[ri]![ci]!

            const id = getUseRectId(fill)

            return (
              <use
                key={`${ri}:${ci}`}
                xlinkHref={`#${id}`}
                transform={`translate(${x},${y})`}
              />
            )
          })
        })}

        <SvgMouseRect
          width={plotSize.w}
          height={plotSize.h}

          onMouseMove={handleMouseMove}
          onMouseLeave={hideCrosshair}
        />
      </SvgG>
    </>
  )
})

export const DotsSvg = memo(function DotsSvg({
  df,
  dfRaw,
  dfSize,
  plotSize,
  margin,
  xgaps,
  ygaps,
  rowLeaves,
  colLeaves,

  props,
  pos = { ...ZERO_POS },
}: ICellsSvgProps) {
  const blockSize = props.blockSize
  const { ref } = useSVG()
  //const { showTooltip, hideTooltip } = useTooltip()
  const { showCrosshair, hideCrosshair } = useCrosshair()

  function handleMouseMove(e: React.MouseEvent) {
    const svgP = screenToSvgPoint(ref.current, { x: e.clientX, y: e.clientY })

    const plotP = {
      x: svgP.x - margin.left,
      y: svgP.y - margin.top,
    }

    const cell = { col: xgaps.nearest(plotP.x), row: ygaps.nearest(plotP.y) }

    if (cell.col.index === -1 || cell.row.index === -1) {
      return
    }

    // const { screenP } = svgPointToScreen(ref.current, {
    //   x: cell.col.x + blockSize.w + margin.left,
    //   y: cell.row.x + blockSize.h + margin.top,
    // })

    const { relativeP } = svgPointToScreen(ref.current, {
      x: cell.col.x + blockSize.w / 2 + margin.left,
      y: cell.row.x + blockSize.h / 2 + margin.top,
    })

    // showTooltip({
    //   pos: { x: screenP.x + 2, y: screenP.y + 2 },
    //   content: (
    //     <>
    //       <span className="font-semibold">{`${df.rowName(
    //         cell.row.index
    //       )}, ${df.colName(cell.col.index)}`}</span>
    //       <span>{`Row ${cell.row.index + 1}, col ${cell.col.index + 1}`}</span>
    //       <span>{cellStr(df.get(cell.row.index, cell.col.index))}</span>
    //     </>
    //   ),
    // })

    showCrosshair({
      pos: relativeP,
      content: (
        <>
          <span className="font-semibold">{`${df.rowName(
            cell.row.index
          )}, ${df.colName(cell.col.index)}`}</span>
          <span>{`Row ${cell.row.index + 1}, col ${cell.col.index + 1}`}</span>
          <span>{cellStr(df.get(cell.row.index, cell.col.index))}</span>
        </>
      ),
    })
  }

  function bound(x: number) {
    const r = props.range[1] - props.range[0]

    return (
      (Math.max(props.range[0], Math.min(props.range[1], x)) - props.range[0]) /
      r
    )
  }

  const cmap = getColorMapFromCmap(props.cmap)

  const w = Math.min(blockSize.w, blockSize.h)

  const isSquare = df.shape[0] === df.shape[1]

  const radiusScale = nodeRadiusFunc(w, props.dot.scale.mode)

  return (
    <SvgG
      pos={pos}
      onMouseMove={handleMouseMove}
      onMouseLeave={hideCrosshair}
      //shapeRendering={SVG_CRISP_EDGES}
    >
      <SvgMouseRect width={plotSize.w} height={plotSize.h} />

      {rowLeaves.map((row, ri) => {
        const y = ygaps.position(ri)
        return colLeaves.map((col, ci) => {
          const x = xgaps.position(ci)

          if (!props.showDiagonal && ri === ci) {
            return null
          }

          const isLowerTriangle = ri > ci

          // only apply if we are square
          if (isSquare && props.upperTriangular && isLowerTriangle) {
            return null
          }

          const v = df.get(row, col) as number

          const dotSize =
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
          //const r = 0.5 * w * dotSize * props.dot.scale.factor
          const r = 0.5 * radiusScale(dotSize) * props.dot.scale.factor

          const textColor =
            props.cells.values.autoColor.on && dotSize > 0.4
              ? getTextColorForBackground(
                  fill,
                  props.cells.values.autoColor.threshold
                )
              : props.cells.values.color

          return (
            <SvgG key={`${ri}:${ci}`} pos={{ x: x, y: y }}>
              {/* Handle mouse events on transparent rect on top of circles to avoid 
              issues with small circles not triggering mouse events */}

              <SvgCircle
                id={`${ri}:${ci}`}
                key={`${ri}:${ci}`}
                cx={cx}
                cy={cy}
                r={r}
                fill={fill}
                sp={props.cells.border}

                pointerEvents="none"
              />

              {!Number.isNaN(cellValue) && (
                <SvgText
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
                </SvgText>
              )}

              <SvgMouseRect width={blockSize.w} height={blockSize.h} />
            </SvgG>
          )
        })
      })}
    </SvgG>
  )
})

interface IGridSvgProps {
  width: number
  height: number
  props: IHeatMapSettings
  pos?: IPos
  xgaps: CellGaps
  ygaps: CellGaps
}

export const GridSvg = memo(function GridSvg({
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
})

export type RadiusScaleMode = 'linear' | 'area'

/**
 * Given a normalized value (between 0 and 1),
 * returns a scaled radius function based on the mode.
 * @param max The maximum radius value.
 * @param mode The scaling mode, either 'linear' or 'area'.
 * @returns A function that takes a normalized value (0 to 1) and returns the scaled radius.
 */
export function nodeRadiusFunc(
  max: number,
  mode: RadiusScaleMode
): (v: number) => number {
  const nodeRadiusScale = (mode === 'area' ? d3.scaleSqrt() : d3.scaleLinear())
    .domain([0, 1]) // Your 0 to 1 score
    .range([1, max])

  return nodeRadiusScale
}
