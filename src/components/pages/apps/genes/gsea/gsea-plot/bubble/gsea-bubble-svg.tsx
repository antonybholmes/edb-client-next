import { useMemo } from 'react'
import { useGseaBubbleSettings } from './gsea-bubble-settings-store'

import { AxisBottomSvg } from '../../../../../../plot/axes/svg-axis'

import { SvgBase } from '@/components/plot/svg-base'

import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgVColorBar } from '@/components/plot/svg-color-bar'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgText } from '@/components/plot/svg-text'
import { COLOR_MAPS } from '@/lib/color/colormap'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { Axis } from '@/components/plot/axes/axis'
import { DEFAULT_STROKE_PROPS } from '@/components/plot/svg-props'
import { SvgRect } from '@/components/plot/svg-rect'
import { SVG_CRISP_EDGES } from '@/consts'
import { IPos } from '@/interfaces/pos'
import { svgPointToScreen } from '@/lib/graphics/svg'
import { ILim } from '@/lib/math/math'
import { useSVG } from '@/providers/svg-provider'
import { useTooltip } from '@/providers/tooltip-provider'
import { IDisplayAxis } from '../../../../matcalc/apps/volcano/volcano-plot-svg'
import { IGseaBubble } from '../gsea-plot-store'
import { IBubblePoint, useGseaBubbleContext } from './gsea-bubble-provider'

const TOOLTIP_OFFSET = 10

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
      stroke: { ...DEFAULT_STROKE_PROPS },
    },
  },
}

interface IPlotInfo {
  plot: IGseaBubble
  points: IBubblePoint[]
  xlim: ILim
  pos: IPos
}

function GseaBubbleLegendSvg() {
  const { plots, globalXLim } = useGseaBubbleContext()
  const { settings } = useGseaBubbleSettings()
  const { settings: edbSettings } = useEdbSettings()
  const { showTooltip, hideTooltip } = useTooltip()

  const sizes = settings.legend.bubbles.sizes

  if (plots.length === 0) {
    return null
  }

  const plot = plots[0]!

  const cmap = COLOR_MAPS[settings.scale.cmap]!

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

  const range =
    settings.scale.mode === 'p'
      ? settings.scale.p.range[1] - settings.scale.p.range[0]
      : globalXLim[1] - globalXLim[0]

  let xax =
    settings.scale.mode === 'p'
      ? new Axis()
          .setDomain(settings.scale.p.range)
          .setLength(edbSettings.plots.colorbar.size.w)
          .setTicks([
            settings.scale.p.range[0],
            settings.scale.p.range[0] + range / 2,
            settings.scale.p.range[1],
          ])
          .setTicks(
            [
              settings.scale.p.range[0] + range * 0.25,
              settings.scale.p.range[0] + range * 0.75,
            ],
            { which: 'minor' }
          )
      : new Axis()
          .setDomain(globalXLim)
          .setLength(edbSettings.plots.colorbar.size.w)
          .setTicks([globalXLim[0], globalXLim[0] + range / 2, globalXLim[1]])
          .setTicks(
            [globalXLim[0] + range * 0.25, globalXLim[0] + range * 0.75],
            { which: 'minor' }
          )

  xax = xax
    .setTickParams({
      which: 'major',
      show: edbSettings.plots.axes.x.ticks.major.show,
    })
    .setTickParams({
      which: 'minor',
      show: edbSettings.plots.axes.x.ticks.minor.show,
    })

  const label =
    settings.scale.mode === 'p' ? `-log10(${plot.log10q.label})` : 'NES'

  return (
    <>
      {settings.colorbar.show &&
        settings.colorbar.position.includes('right') && (
          <>
            <g id="p-legend">
              <SvgText
                x={edbSettings.plots.colorbar.size.h / 2}
                y={0}
                textAnchor="middle"
              >
                {label}
              </SvgText>
              <g transform={`translate(0, ${settings.padding * 2})`}>
                <SvgVColorBar
                  ax={xax}

                  cmap={cmap}
                />
              </g>
            </g>
            <g
              id="dot-legend"
              transform={`translate(0, ${edbSettings.plots.colorbar.size.w + settings.padding * 5})`}
            >
              <SvgText
                x={edbSettings.plots.colorbar.size.h / 2}
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
                      cx={edbSettings.plots.colorbar.size.h / 2}
                      cy={d.y}
                      r={d.r}
                      stroke="black"
                    />
                    <SvgText
                      x={
                        edbSettings.plots.colorbar.size.h / 2 +
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

function BubblePlot({
  info,
  innerPlotWidth,
  innerPlotHeight,
  handleVariantEnter,
  handleVariantLeave,
}: {
  info: IPlotInfo

  innerPlotWidth: number
  innerPlotHeight: number
  handleVariantEnter: (plot: IGseaBubble, row: number, p: IPos) => void
  handleVariantLeave: () => void
}) {
  const { settings } = useGseaBubbleSettings()
  const { settings: edbSettings } = useEdbSettings()

  const domain = settings.axes.x.auto ? info.xlim : settings.axes.x.domain

  // offer per plot x-axis domain
  const xax = new Axis()
    //.autoDomain(domain)
    .setDomain(domain)
    .setLength(settings.axes.x.length)
    .setTickParams({
      which: 'major',
      show: edbSettings.plots.axes.x.ticks.major.show,
    })
    .setTickParams({
      which: 'minor',
      show: edbSettings.plots.axes.x.ticks.minor.show,
    })

  return (
    <>
      <SvgMargin margin={settings.plot.margin}>
        {info.points.map((point, xi) => {
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
                handleVariantEnter(info.plot, xi, {
                  x:
                    x1 +
                    settings.margin.left +
                    settings.plot.margin.left +
                    info.pos.x +
                    TOOLTIP_OFFSET,
                  y:
                    y1 +
                    settings.margin.top +
                    settings.plot.margin.top +
                    info.pos.y +
                    TOOLTIP_OFFSET,
                })
              }}
            />
          )
        })}
      </SvgMargin>

      <g
        transform={`translate(${settings.plot.margin.left - settings.padding}, ${settings.plot.margin.top})`}
      >
        {info.points.map((p, xi) => {
          const y1 = p.y * settings.axes.y.rowHeight

          return (
            <SvgText
              key={xi}
              y={y1}
              textAnchor="end"
              font={edbSettings.plots.axes.y.ticks.major.labels}
            >
              {p.label}
            </SvgText>
          )
        })}
      </g>

      {settings.border.show && (
        <SvgMargin margin={settings.plot.margin}>
          <SvgRect
            shapeRendering={SVG_CRISP_EDGES}
            width={innerPlotWidth}
            height={innerPlotHeight}
            stroke={settings.border.value}
            strokeWidth={settings.border.width}
            fill="none"
          />
        </SvgMargin>
      )}

      {settings.title.show && info.plot.name && (
        <g
          transform={`translate(${settings.plot.margin.left + innerPlotWidth / 2}, ${settings.plot.margin.top - settings.padding * 1.5})`}
        >
          <SvgText textAnchor="middle" fontWeight="bold">
            {info.plot.name}
          </SvgText>
        </g>
      )}

      {edbSettings.plots.axes.x.show && (
        <AxisBottomSvg
          ax={xax}

          pos={{
            x: settings.plot.margin.left,
            y: settings.plot.margin.top + innerPlotHeight,
          }}

          title={info.plot.nes.label}
        />
      )}
    </>
  )
}

export function GseaBubblePlotSvg() {
  const { plots, points, xlims } = useGseaBubbleContext()
  const { ref: svgRef } = useSVG()

  const { settings } = useGseaBubbleSettings()

  const { showTooltip, hideTooltip } = useTooltip()

  function handleVariantEnter(plot: IGseaBubble, row: number, p: IPos) {
    const screenP = svgPointToScreen(svgRef.current, p)

    const newP = {
      x: screenP.x,
      y: screenP.y,
    }

    showTooltip({
      pos: newP,
      content: (
        <>
          <p className="font-semibold">{`${plot.genesets[row]!.name}`}</p>
          <p>{`${plot.nes.label}: ${plot.genesets[row]!.nes.toFixed(2)}`}</p>
          <p>{`-log10(${plot.log10q.label}): ${plot.genesets[row]!.log10q.toFixed(2)}`}</p>
          <p>{`${plot.size.label}: ${plot.genesets[row]!.size}`}</p>
        </>
      ),
    })
  }

  const { svg, width, height } = useMemo(() => {
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

    const svg = (
      <SvgMargin margin={settings.margin}>
        {plotGrid.map((row, ri) => (
          <g key={ri} transform={`translate(0, ${row[0]!.pos.y})`}>
            {row.map((p, ci) => (
              <g key={ci} transform={`translate(${p.pos.x}, 0)`}>
                <BubblePlot
                  info={p}
                  innerPlotWidth={innerPlotWidth}
                  innerPlotHeight={innerPlotHeight}
                  handleVariantEnter={handleVariantEnter}
                  handleVariantLeave={hideTooltip}
                />
              </g>
            ))}
          </g>
        ))}

        <g
          transform={`translate(${settings.margin.left + innerWidth + settings.padding * 3.5}, ${settings.margin.top + settings.padding})`}
        >
          <GseaBubbleLegendSvg />
        </g>
      </SvgMargin>
    )

    return { svg, width, height }
  }, [plots, points, settings])

  if (plots.length === 0) {
    return null
  }

  return (
    <SvgBase width={width} height={height} scale={settings.page.scale}>
      {svg}
    </SvgBase>
  )
}
