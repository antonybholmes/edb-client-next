import { useMemo } from 'react'
import { useGseaBubbleSettings } from '../gsea-bubble-settings-store'

import { SvgBase } from '@/components/plot/svg-base'

import { SvgMargin } from '@/components/plot/svg-margin'

import { SvgG } from '@/components/plot/svg-g'
import { DEFAULT_STROKE_PROPS } from '@/components/plot/svg-props'
import { IPos } from '@/interfaces/pos'
import { ILim } from '@/lib/math/math'
import { CrosshairProvider } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { useZoom } from '@/providers/zoom-provider'
import { IDisplayAxis } from '../../../../../matcalc/apps/volcano/volcano-plot-svg'
import { IGseaBubble } from '../../gsea-store'
import { IBubblePoint, useGseaBubbleContext } from '../gsea-bubble-provider'
import { BubblePlotSvg } from './bubble-plot-svg'
import { GseaBubbleLegendSvg } from './legend-svg'

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

export function GseaBubblePlotsContent() {
  const { plots, points, xlims } = useGseaBubbleContext()
  const { ref: svgRef } = useSVG()

  const { settings } = useGseaBubbleSettings()
  const { zoom } = useZoom()

  // const { showTooltip, hideTooltip } = useTooltip()

  // const handleVariantEnter = useCallback(
  //   (plot: IGseaBubble, row: number, p: IPos) => {
  //     const { screenP } = svgPointToScreen(svgRef.current, p)

  //     const newP = {
  //       x: screenP.x,
  //       y: screenP.y,
  //     }

  //     showTooltip({
  //       pos: newP,
  //       content: (
  //         <>
  //           <p className="font-semibold">{`${plot.genesets[row]!.name}`}</p>
  //           <p>{`${plot.nes.label}: ${plot.genesets[row]!.nes.toFixed(2)}`}</p>
  //           <p>{`-log10(${plot.log10q.label}): ${plot.genesets[row]!.log10q.toFixed(2)}`}</p>
  //           <p>{`${plot.size.label}: ${plot.genesets[row]!.size}`}</p>
  //         </>
  //       ),
  //     })
  //   },
  //   [svgRef, showTooltip, hideTooltip]
  // )

  // const handleVariantLeave = useCallback(() => {
  //   hideTooltip()
  // }, [hideTooltip])

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
          <SvgG key={ri} pos={{ x: 0, y: row[0]!.pos.y }}>
            {row.map((p, ci) => (
              <SvgG key={ci} pos={{ x: p.pos.x, y: 0 }}>
                <BubblePlotSvg
                  plotInfo={p}
                  innerPlotWidth={innerPlotWidth}
                  innerPlotHeight={innerPlotHeight}
                  pos={{
                    x: p.pos.x + settings.margin.left,
                    y: row[0]!.pos.y + settings.margin.top,
                  }}
                />
              </SvgG>
            ))}
          </SvgG>
        ))}

        <SvgG
          pos={{
            x: settings.margin.left + innerWidth + settings.padding * 3.5,
            y: settings.margin.top + settings.padding,
          }}
        >
          <GseaBubbleLegendSvg />
        </SvgG>
      </SvgMargin>
    )

    return { svg, width, height }
  }, [plots, points, settings])

  if (plots.length === 0) {
    return null
  }

  return (
    <SvgBase width={width} height={height} scale={zoom}>
      {svg}
    </SvgBase>
  )
}

export function GseaBubblePlotsSvg() {
  return (
    <CrosshairProvider>
      <GseaBubblePlotsContent />
    </CrosshairProvider>
  )
}
