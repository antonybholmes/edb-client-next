import { useCallback, useMemo, useRef, useState } from 'react'
import { useGseaBubbleSettings } from './gsea-bubble-settings-store'

import { COLOR_BLACK } from '@/lib/color/color'

import { AxisBottomSvg } from '../../../../../../plot/svg-axis'

import { SvgBase } from '@/components/plot/svg-base'
import type { ISVGProps } from '@/interfaces/svg-props'

import { VColorBarSvg } from '@/components/plot/color-bar-svg'
import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgText } from '@/components/plot/svg-text'
import { COLOR_MAPS } from '@/lib/color/colormap'

import { Axis } from '@/components/plot/axis'
import { SvgRect } from '@/components/plot/svg-rect'
import { IPos } from '@/interfaces/pos'
import { ILim } from '@/lib/math/math'
import type { ITooltip } from '../../../../matcalc/apps/heatmap/heatmap-svg'
import { IDisplayAxis } from '../../../../matcalc/apps/volcano/volcano-plot-svg'
import { IGseaBubble } from '../gsea-plot-store'
import { IBubblePoint, useGseaBubbleContext } from './gsea-bubble-provider'

const TOOLTIP_OFFSET = 10

// export const COLOR_MAP = new ColorMap('Volcano', [
//   '#3366cc',
//   '#cccccc',
//   '#e62e00',
// ])

export interface IGseaBubbleDisplayOptions {
  axes: {
    xaxis: IDisplayAxis
  }
}

export const DEFAULT_GSEA_BUBBLE_PROPS: IGseaBubbleDisplayOptions = {
  axes: {
    xaxis: {
      name: 'Log2 fold change',

      domain: [-2, 2],
      length: 300,
      ticks: [],
      tickLabels: [],
      tickSize: 4,
      strokeWidth: 1,
      color: COLOR_BLACK,
    },
  },
}

function GseaBubbleLegendSvg() {
  const { plots } = useGseaBubbleContext()
  const { settings } = useGseaBubbleSettings()

  const sizes = settings.legend.bubbles.sizes

  if (plots.length === 0) {
    return null
  }

  const plot = plots[0]!

  const cmap = COLOR_MAPS[settings.p.cmap]!

  const dotLegendPos = []

  let y = 0

  for (const [si, s] of sizes.entries()) {
    const d = Math.min(s, settings.size.maxSize)

    const r1 = Math.min(d / settings.size.maxSize, 1) * settings.bubbles.size
    dotLegendPos.push({ label: d.toFixed(0), r: r1, y })

    if (si < sizes.length - 1) {
      const r2 =
        Math.min(sizes[si + 1]! / settings.size.maxSize, 1) *
        settings.bubbles.size
      y += r1 + r2 + settings.padding
    }
  }

  return (
    <>
      {settings.colorbar.show &&
        settings.colorbar.position.includes('right') && (
          <>
            <g id="p-legend">
              <SvgText
                x={settings.colorbar.size.h / 2}
                y={0}
                textAnchor="middle"
              >
                {`-log10(${plot.log10q.label})`}
              </SvgText>
              <g transform={`translate(0, ${settings.padding * 2})`}>
                <VColorBarSvg
                  axis={new Axis()
                    .setDomain(settings.p.range)
                    .setLength(settings.colorbar.size.w)
                    .setTicks([
                      settings.p.range[0],
                      settings.p.range[1] / 2,
                      settings.p.range[1],
                    ])
                    .setMinorTicks([
                      settings.p.range[1] * 0.25,
                      settings.p.range[1] * 0.75,
                    ])}
                  showMinorTicks={settings.colorbar.showMinorTicks}
                  cmap={cmap}
                  size={settings.colorbar.size}
                  // ticks={[
                  //   settings.p.range[0],
                  //   settings.p.range[1] / 2,
                  //   settings.p.range[1],
                  // ]}
                  //stroke={displayProps.colorbar.stroke}
                  //font={displayProps.legend}
                />
              </g>
            </g>
            <g
              id="dot-legend"
              transform={`translate(0, ${settings.colorbar.size.w + settings.padding * 5})`}
            >
              <SvgText
                x={settings.colorbar.size.h / 2}
                y={0}
                textAnchor="middle"
              >
                {plot.size.label}
              </SvgText>
              <g
                transform={`translate(0, ${settings.padding + settings.bubbles.size})`}
              >
                {dotLegendPos.map((d, di) => (
                  <g key={di}>
                    <SvgCircle
                      key={di}
                      cx={settings.colorbar.size.h / 2}
                      cy={d.y}
                      r={d.r}
                      stroke="black"
                    />
                    <SvgText
                      x={
                        settings.colorbar.size.h / 2 +
                        settings.bubbles.size +
                        settings.padding
                      }
                      y={d.y}
                      //textAnchor="start"
                      //dominantBaseline="central"
                    >
                      {d.label}
                    </SvgText>
                  </g>
                ))}
              </g>
            </g>
          </>
        )}
    </>
  )
}

function GseaPlot({
  points,
  plot,
  xlim,
  innerPlotWidth,
  innerPlotHeight,
  handleVariantEnter,
  handleVariantLeave,
}: {
  points: IBubblePoint[]
  plot: IGseaBubble
  xlim: ILim
  innerPlotWidth: number
  innerPlotHeight: number
  handleVariantEnter: (
    plot: IGseaBubble,
    row: number,
    x1: number,
    y1: number
  ) => void
  handleVariantLeave: () => void
}) {
  const { settings } = useGseaBubbleSettings()

  const domain = settings.axes.x.auto ? xlim : settings.axes.x.domain

  // offer per plot x-axis domain
  const xax = new Axis()
    .autoDomain(domain)
    //.setDomain(displayProps.xdomain)
    .setLength(settings.axes.x.length)

  return (
    <>
      <SvgMargin margin={settings.plot.margin}>
        {points.map((point, xi) => {
          const x1 = xax!.domainToRange(point.x)
          const y1 = point.y * settings.axes.y.rowHeight

          return (
            <SvgCircle
              cx={x1}
              cy={y1}
              r={point.r}
              fill={point.color}
              fp={settings.bubbles.fill}
              sp={settings.bubbles.stroke}
              key={xi}
              onMouseLeave={handleVariantLeave}
              onMouseEnter={() => {
                handleVariantEnter(plot, xi, x1, y1)
              }}
            />
          )
        })}
      </SvgMargin>

      <g
        transform={`translate(${settings.plot.margin.left - settings.padding}, ${settings.plot.margin.top})`}
      >
        {points.map((p, xi) => {
          const y1 = p.y * settings.axes.y.rowHeight

          return (
            <SvgText key={xi} y={y1} textAnchor="end">
              {p.label}
            </SvgText>
          )
        })}
      </g>

      {settings.border.show && (
        <SvgMargin margin={settings.plot.margin}>
          <SvgRect
            width={innerPlotWidth}
            height={innerPlotHeight}
            stroke={settings.border.value}
            strokeWidth={settings.border.width}
            fill="none"
          />
        </SvgMargin>
      )}

      {settings.title.show && plot.name && (
        <g
          transform={`translate(${settings.plot.margin.left + innerPlotWidth / 2}, ${settings.plot.margin.top - 10})`}
        >
          <SvgText textAnchor="middle" fontWeight="bold">
            {plot.name}
          </SvgText>
        </g>
      )}

      <AxisBottomSvg
        ax={xax}
        showLine={!settings.border.show}
        pos={{
          x: settings.plot.margin.left,
          y: settings.plot.margin.top + innerPlotHeight,
        }}
        tickSize={settings.axes.x.tickSize}
        strokeWidth={settings.axes.x.strokeWidth}
        title={plot.nes.label}
        color={settings.axes.x.color}
      />
    </>
  )
}

export function GseaBubblePlotSvg({ ref }: ISVGProps) {
  const { plots, points, xlims } = useGseaBubbleContext()

  const { settings } = useGseaBubbleSettings()

  const tooltipRef = useRef<HTMLDivElement>(null)

  const [toolTipInfo, setToolTipInfo] = useState<
    (ITooltip & { plot: IGseaBubble }) | null
  >(null)

  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleVariantEnter = useCallback(
    (plot: IGseaBubble, row: number, x1: number, y1: number) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setToolTipInfo({
        ...toolTipInfo,
        plot,
        pos: {
          x: x1 + settings.plot.margin.left + TOOLTIP_OFFSET,
          y: y1 + settings.plot.margin.top + TOOLTIP_OFFSET,
        },
        cell: { row: row, col: 0 },
      })
    },
    []
  )

  const handleVariantLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // wait before removing. if we re-enter quickly, the tooltip won't flicker
    // as this timeout will be cancelled so the tooltip won't disappear
    // and will be moved to next location
    timeoutRef.current = setTimeout(() => setToolTipInfo(null), 300)
  }, [])

  const svg = useMemo(() => {
    //const huedata = hue ? getNumCol(df, findCol(df, hue)) : []

    const cols = Math.min(settings.page.grid.cols, plots.length)
    const rows = Math.ceil(plots.length / cols)

    // inner height is determined by the size of the largest bubble plot
    const innerPlotHeight =
      settings.axes.y.rowHeight *
      (Math.max(...plots.map((p) => p.genesets.length)) + 1)

    const innerPlotWidth = settings.axes.x.length

    const plotWidth =
      innerPlotWidth + settings.plot.margin.left + settings.plot.margin.right
    const plotHeight =
      innerPlotHeight + settings.plot.margin.top + settings.plot.margin.bottom

    const innerWidth = plotWidth * cols
    const innerHeight = plotHeight * rows

    const width = innerWidth + settings.margin.left + settings.margin.right
    const height = innerHeight + settings.margin.top + settings.margin.bottom

    const plotGrid: {
      plot: IGseaBubble
      points: IBubblePoint[]
      xlim: ILim
      pos: IPos
    }[][] = []

    let y = 0
    for (let ri = 0; ri < rows; ri++) {
      const row: {
        plot: IGseaBubble
        points: IBubblePoint[]
        xlim: ILim
        pos: IPos
      }[] = []
      let x = 0
      for (let ci = 0; ci < cols; ci++) {
        const pi = ri * cols + ci
        if (pi < plots.length) {
          row.push({
            plot: plots[pi]!,
            points: points[pi]!,
            xlim: xlims[pi]!,
            pos: { x, y },
          })
        }

        x += plotWidth
      }
      plotGrid.push(row)
      y += plotHeight
    }

    return (
      <SvgBase
        ref={ref}
        width={width}
        height={height}
        scale={settings.page.scale}
      >
        <SvgMargin margin={settings.margin}>
          {plotGrid.map((row, ri) => (
            <g key={ri} transform={`translate(0, ${row[0]!.pos.y})`}>
              {row.map((p, ci) => (
                <g key={ci} transform={`translate(${p.pos.x}, 0)`}>
                  <GseaPlot
                    points={p.points}
                    plot={p.plot}
                    xlim={p.xlim}
                    innerPlotWidth={innerPlotWidth}
                    innerPlotHeight={innerPlotHeight}
                    handleVariantEnter={handleVariantEnter}
                    handleVariantLeave={handleVariantLeave}
                  />
                </g>
              ))}
            </g>
          ))}

          <g
            transform={`translate(${settings.margin.left + innerWidth + settings.padding * 5}, ${settings.margin.top})`}
          >
            <GseaBubbleLegendSvg />
          </g>
        </SvgMargin>
      </SvgBase>
    )
  }, [plots, points, settings])

  return (
    <>
      {svg}

      {toolTipInfo && (
        <div
          ref={tooltipRef}
          className="absolute z-50 rounded-theme bg-black/60 p-3 text-xs text-white opacity-100"
          style={{
            left: toolTipInfo.pos.x,
            top: toolTipInfo.pos.y,
          }}
        >
          <p className="font-semibold">{`${toolTipInfo.plot.genesets[toolTipInfo.cell.row]!.name}`}</p>
          <p>{`${toolTipInfo.plot.nes.label}: ${toolTipInfo.plot.genesets[toolTipInfo.cell.row]!.nes.toFixed(2)}`}</p>
          <p>{`-log10(${toolTipInfo.plot.log10q.label}): ${toolTipInfo.plot.genesets[toolTipInfo.cell.row]!.log10q.toFixed(2)}`}</p>
          <p>{`${toolTipInfo.plot.size.label}: ${toolTipInfo.plot.genesets[toolTipInfo.cell.row]!.size}`}</p>
        </div>
      )}
    </>
  )
}
