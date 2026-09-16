import { ReactElement, useMemo } from 'react'

import { useAxis } from '@/components/plot/axes/axes-store'
import { axisDomainToRangeFunc } from '@/components/plot/axes/axis'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgG } from '@/components/plot/svg-g'
import { SvgMargin } from '@/components/plot/svg-margin'
import { IDim } from '@/interfaces/dim'
import { IPos } from '@/interfaces/pos'
import { CrosshairProvider } from '@/providers/crosshair-provider'
import { useZoom } from '@/providers/zoom-provider'
import { useGseaSettings } from '../../gsea-plot/gsea-settings-store'
import { crossingIndex, RankingSvg } from '../../gsea-plot/svg/ranking-svg'
import { IExtGseaPlotResult, useExtGseaContext } from '../ext-gsea-provider'
import { useExtGseaSettings } from '../ext-gsea-settings'
import { ExtGseaEsSvgPlot } from './ext-gsea-es-svg'
import { ExtGseaGenesSvgPlot } from './ext-gsea-hits'
import { ExtGseaTitleSvg } from './title-svg'

function ExtGseaSvgPlot({
  result,
  pos,
}: {
  result: IExtGseaPlotResult
  pos: IPos
}) {
  const { displayProps } = useExtGseaContext()
  const { settings } = useExtGseaSettings()
  const { settings: gseaSettings } = useGseaSettings()

  const yOffset = displayProps.es.axes.y.length + 1.5 * displayProps.plot!.gap.y

  const { axis: xax } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'x',
  })

  const xaf = useMemo(() => axisDomainToRangeFunc(xax), [xax])

  const scores = result.scores

  const crossing = useMemo(() => crossingIndex(scores, xaf), [scores, xaf])

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
              settings.es.axes.y.length +
              gseaSettings.plot.gap.y +
              (gseaSettings.genes.show
                ? 2 * (gseaSettings.genes.height + gseaSettings.plot.gap.y)
                : 0),
          }}
        >
          <RankingSvg
            plotId={result.id}
            xaf={xaf}
            es={result.scores}
            crossing={crossing}
          />
        </SvgG>
      )}
    </>
  )
}

export function ExtGseaSvgContent() {
  const { results, displayProps } = useExtGseaContext()
  const { zoom } = useZoom()

  const innerPlotSize: IDim = useMemo(() => {
    return {
      w: displayProps.axes.x.length,
      h:
        displayProps.es.axes.y.length +
        (displayProps.genes.line.show
          ? 2 * (displayProps.plot.gap.y + displayProps.genes.height)
          : 0) +
        (displayProps.ranking.show
          ? displayProps.plot.gap.y + displayProps.ranking.axes.y.length
          : 0),
    }
  }, [displayProps])

  const plotSize: IDim = useMemo(() => {
    return {
      w:
        innerPlotSize.w +
        displayProps.plot.margin.left +
        displayProps.plot.margin.right,
      h:
        innerPlotSize.h +
        displayProps.plot.margin.top +
        displayProps.plot.margin.bottom,
    }
  }, [innerPlotSize, displayProps])

  const pageSize: IDim = useMemo(() => {
    return {
      w: plotSize.w * displayProps.page.columns,
      h: plotSize.h * Math.ceil(results.length / displayProps.page.columns),
    }
  }, [plotSize, displayProps.page.columns, results.length])

  const svg = useMemo(() => {
    const elems: ReactElement[] = []

    let x = 0
    let y = 0

    for (const [ri, result] of results.entries()) {
      const pos: IPos = { x, y }

      elems.push(
        <SvgG id={`ext-gsea-${result.id}`} key={result.id} pos={pos}>
          <ExtGseaSvgPlot result={result} pos={pos} />
        </SvgG>
      )

      x += plotSize.w

      if (ri % displayProps.page.columns === displayProps.page.columns - 1) {
        x = 0
        y += plotSize.h
      }
    }

    return <SvgMargin margin={displayProps.plot.margin}>{elems}</SvgMargin>
  }, [results, plotSize, displayProps.page.columns, displayProps.plot.margin])

  return (
    <SvgBase width={pageSize.w} height={pageSize.h} scale={zoom}>
      {svg}
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
