import { ReactElement, useMemo } from 'react'

import { SvgBase } from '@/components/plot/svg-base'
import { SvgG } from '@/components/plot/svg-g'
import { SvgMargin } from '@/components/plot/svg-margin'
import { IDim } from '@/interfaces/dim'
import { IPos } from '@/interfaces/pos'
import { CrosshairProvider } from '@/providers/crosshair-provider'
import { useZoom } from '@/providers/zoom-provider'
import { IExtGseaPlotResult, useExtGseaContext } from '../ext-gsea-provider'
import { IExtGseaSettings } from '../ext-gsea-settings'
import { ExtGseaEsSvgPlot } from './es-svg'
import { ExtGseaGenesSvgPlot } from './genes-svg'
import { ExtGseaRankingSvg } from './ranking-svg'
import { ExtGseaTitleSvg } from './title-svg'

function ExtGseaSvgPlot({
  result,
  pos,
}: {
  result: IExtGseaPlotResult
  pos: IPos
}) {
  const { plot } = useExtGseaContext()

  const displayProps: IExtGseaSettings = plot.props

  const yOffset = displayProps.es.axes.y.length + 1.5 * displayProps.plot!.gap.y

  return (
    <>
      {displayProps.title.show && <ExtGseaTitleSvg name={result.name} />}

      <ExtGseaEsSvgPlot result={result} />

      <SvgG
        pos={{
          x: 0,
          y: yOffset,
        }}
      >
        <ExtGseaGenesSvgPlot
          result={result}
          pos={{
            x: pos.x,
            y: pos.y + yOffset,
          }}
        />
      </SvgG>

      {displayProps.ranking.show && (
        <SvgG
          pos={{
            x: 0,
            y:
              displayProps.es.axes.y.length +
              displayProps.plot.gap.y +
              (displayProps.genes.line.show
                ? 2 * (displayProps.genes.height + displayProps.plot.gap.y)
                : 0),
          }}
        >
          <ExtGseaRankingSvg result={result} />
        </SvgG>
      )}
    </>
  )
}

export function ExtGseaSvgContent() {
  const { plot } = useExtGseaContext()
  const { zoom } = useZoom()

  const displayProps: IExtGseaSettings = plot.props

  const innerPlotSize: IDim = useMemo(
    () => ({
      w: displayProps.axes.x.length,
      h:
        displayProps.es.axes.y.length +
        (displayProps.genes.line.show
          ? 2 * (displayProps.plot.gap.y + displayProps.genes.height)
          : 0) +
        (displayProps.ranking.show
          ? displayProps.plot.gap.y + displayProps.ranking.axes.y.length
          : 0),
    }),
    [displayProps]
  )

  const plotSize: IDim = useMemo(
    () => ({
      w:
        innerPlotSize.w +
        displayProps.plot!.margin.left +
        displayProps.plot!.margin.right,
      h:
        innerPlotSize.h +
        displayProps.plot!.margin.top +
        displayProps.plot!.margin.bottom,
    }),
    [displayProps, innerPlotSize]
  )

  const rows = Math.ceil(plot.results.length / displayProps.page.columns)

  const pageSize: IDim = {
    w: plotSize.w * displayProps.page.columns,
    h: plotSize.h * rows,
  }

  const elems: ReactElement[] = []

  let x = 0
  let y = 0

  for (const [ri, result] of plot.results.entries()) {
    const pos: IPos = { x, y }
    elems.push(
      <SvgG id={`ext-gsea-${result.id}`} key={result.id} pos={pos}>
        <ExtGseaSvgPlot
          result={result}

          pos={pos}
        />
      </SvgG>
    )

    x += plotSize.w

    if (ri % displayProps.page.columns === displayProps.page.columns - 1) {
      x = 0
      y += plotSize.h
    }
  }

  return (
    <SvgBase width={pageSize.w} height={pageSize.h} scale={zoom}>
      <SvgMargin margin={displayProps.plot!.margin}>{elems}</SvgMargin>
    </SvgBase>
  )
}

export function ExtGseaSvg() {
  return (
    <CrosshairProvider>
      <ExtGseaSvgContent />
    </CrosshairProvider>
  )
}
