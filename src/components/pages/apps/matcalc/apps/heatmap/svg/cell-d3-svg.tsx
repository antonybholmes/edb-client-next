import { SvgG } from '@/components/plot/svg-g'
import { SvgMouseRect } from '@/components/plot/svg-rect'
import { SVG_CRISP_EDGES } from '@/consts'
import { ZERO_POS } from '@/interfaces/pos'
import { COLOR_WHITE, getTextColorForBackground } from '@/lib/color/color'
import { getColorMap } from '@/lib/color/colormap'
import { cellStr } from '@/lib/dataframe/cell'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { normalize } from '@/lib/math/normalize'
import { formatNumber } from '@/lib/text/text'
import { useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import * as d3 from 'd3'
import { memo, useEffect, useMemo, useRef } from 'react'
import { getUseRectId, ICellsSvgProps, nodeRadiusFunc } from './cell-svg'

// we want circles slightly smaller than box to allow for borders
//const RADIUS_FACTOR = 1 //0.96

export const CellsD3Svg = memo(function CellsD3Svg({
  df,
  margin,
  xgaps,
  ygaps,
  plotSize,
  rowLeaves,
  colLeaves,
  props,
  blockSize,
  pos = { ...ZERO_POS },
}: ICellsSvgProps) {
  const { ref } = useSVG()
  const hostRef = useRef<SVGGElement | null>(null)

  const { showCrosshair, hideCrosshair } = useCrosshair()

  const cmap = getColorMap(props.cmap)

  const colors = useMemo(
    () =>
      rowLeaves.map((row) => {
        return colLeaves.map((col) => {
          const v = df.get(row, col) as number

          const fill: string = !isNaN(v)
            ? cmap.getHexColor(normalize(v, props.range), false)
            : COLOR_WHITE
          return fill
        })
      }),
    [rowLeaves, colLeaves, df, cmap, props.range]
  )

  const cellData = useMemo(() => {
    const isSquare = df.shape[0] === df.shape[1]

    return rowLeaves.flatMap((_, ri) => {
      const y = ygaps.position(ri)

      return colLeaves.flatMap((_, ci) => {
        const x = xgaps.position(ci)

        if (!props.showDiagonal && ri === ci) {
          return []
        }

        const isLowerTriangle = ri > ci

        if (isSquare && props.upperTriangular && isLowerTriangle) {
          return []
        }

        return [
          {
            id: `${ri}:${ci}`,
            fill: colors[ri]![ci]!,
            x,
            y,
          },
        ]
      })
    })
  }, [
    rowLeaves,
    colLeaves,
    xgaps,
    ygaps,
    props.showDiagonal,
    props.upperTriangular,
    colors,
    df,
  ])

  const uniqueColorRects = useMemo(
    () =>
      [...new Set(colors.flat())].sort().map((color) => {
        const id = getUseRectId(color)

        return (
          <rect
            id={id}
            key={id}
            width={blockSize.w}
            height={blockSize.h}
            fill={color}
          />
        )
      }),
    [colors, blockSize]
  )

  useEffect(() => {
    if (!hostRef.current) {
      return
    }

    const selection = d3.select(hostRef.current)

    selection
      .selectAll<SVGUseElement, (typeof cellData)[number]>('use')
      .data(cellData, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append('use')
            .attr('href', (d) => `#${getUseRectId(d.fill)}`)
            .attr('xlink:href', (d) => `#${getUseRectId(d.fill)}`),
        (update) => update,
        (exit) => exit.remove()
      )
      .attr('transform', (d) => `translate(${d.x},${d.y})`)
      .attr('shape-rendering', 'crispEdges')
  }, [cellData])

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

    const { relativeP, screenP } = svgPointToScreen(ref.current, {
      x: cell.col.x + blockSize.w / 2 + margin.left,
      y: cell.row.x + blockSize.h / 2 + margin.top,
    })

    showCrosshair({
      pos: relativeP,
      screenPos: screenP,
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

  return (
    <>
      <defs>{uniqueColorRects}</defs>
      <SvgG pos={pos} shapeRendering={SVG_CRISP_EDGES}>
        <g ref={hostRef} shapeRendering={SVG_CRISP_EDGES} />

        <SvgMouseRect
          width={plotSize.w}
          height={plotSize.h}
          onPointerMove={handleMouseMove}
          onPointerLeave={hideCrosshair}
        />
      </SvgG>
    </>
  )
})

export const DotsD3Svg = memo(function DotsD3Svg({
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
  const hostRef = useRef<SVGGElement | null>(null)
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

    const { relativeP, screenP } = svgPointToScreen(ref.current, {
      x: cell.col.x + blockSize.w / 2 + margin.left,
      y: cell.row.x + blockSize.h / 2 + margin.top,
    })

    showCrosshair({
      pos: relativeP,
      screenPos: screenP,
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

  const cmap = getColorMap(props.cmap)
  const w = Math.min(blockSize.w, blockSize.h)
  const isSquare = df.shape[0] === df.shape[1]
  const radiusScale = nodeRadiusFunc(w, props.dot.scale.mode)

  const cellData = useMemo(() => {
    return rowLeaves.flatMap((row, ri) => {
      const y = ygaps.position(ri)

      return colLeaves.flatMap((col, ci) => {
        const x = xgaps.position(ci)

        if (!props.showDiagonal && ri === ci) {
          return []
        }

        const isLowerTriangle = ri > ci

        if (isSquare && props.upperTriangular && isLowerTriangle) {
          return []
        }

        const v = df.get(row, col) as number

        const dotSize =
          props.mode === 'dot' && dfSize ? (dfSize.get(row, col) as number) : 1

        const fill: string = !isNaN(v)
          ? cmap.getHexColor(bound(v), false)
          : COLOR_WHITE

        let cellValue: number = Number.NaN

        if (props.cells.values.show) {
          if (props.dot.useOriginalValuesForSizes && dfRaw !== undefined) {
            cellValue = dfRaw.get(row, col) as number
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
        const r = 0.5 * radiusScale(dotSize) * props.dot.scale.factor

        const textColor =
          props.cells.values.autoColor.on && dotSize > 0.4
            ? getTextColorForBackground(
                fill,
                props.cells.values.autoColor.threshold
              )
            : props.cells.values.color

        return [
          {
            id: `${ri}:${ci}`,
            x,
            y,
            cx,
            cy,
            r,
            fill,
            textColor,
            cellValue,
            showValue: !Number.isNaN(cellValue),
            label: formatNumber(cellValue, { dp: props.cells.values.dp }),
          },
        ]
      })
    })
  }, [
    rowLeaves,
    colLeaves,
    xgaps,
    ygaps,
    props,
    df,
    dfRaw,
    dfSize,
    cmap,
    blockSize,
    isSquare,
    radiusScale,
  ])

  useEffect(() => {
    if (!hostRef.current) {
      return
    }

    const container = d3.select(hostRef.current)

    const groups = container
      .selectAll<SVGGElement, (typeof cellData)[number]>('g[data-cell-id]')
      .data(cellData, (d) => d.id)
      .join(
        (enter) => {
          const g = enter.append('g').attr('data-cell-id', (d) => d.id)
          g.append('circle')
          g.append('text')
          return g
        },
        (update) => update,
        (exit) => exit.remove()
      )
      .attr('transform', (d) => `translate(${d.x},${d.y})`)

    groups
      .selectAll<SVGCircleElement, (typeof cellData)[number]>('circle')
      .data((d) => [d])
      .join('circle')
      .attr('cx', (d) => d.cx)
      .attr('cy', (d) => d.cy)
      .attr('r', (d) => d.r)
      .attr('fill', (d) => d.fill)
      .attr('pointer-events', 'none')
    //.attr('shape-rendering', 'crispEdges')

    groups
      .selectAll<SVGTextElement, (typeof cellData)[number]>('text')
      .data((d) => [d])
      .join('text')
      .attr('x', (d) => d.cx)
      .attr('y', (d) => d.cy)
      .attr('fill', (d) => d.textColor)
      .attr('dominant-baseline', 'middle')
      .attr('text-anchor', 'middle')
      .attr('font-size', 'small')
      .attr('pointer-events', 'none')
      .text((d) => (d.showValue ? d.label : ''))
  }, [cellData])

  return (
    <SvgG pos={pos}>
      <g ref={hostRef} />

      <SvgMouseRect
        width={plotSize.w}
        height={plotSize.h}
        onPointerMove={handleMouseMove}
        onPointerLeave={hideCrosshair}
      />
    </SvgG>
  )
})
