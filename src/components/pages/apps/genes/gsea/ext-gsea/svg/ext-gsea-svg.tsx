import { memo, ReactElement, useMemo } from 'react'

import { useAxis } from '@/components/plot/axes/axes-store'
import { axisDomainToRangeFunc, axisLength } from '@/components/plot/axes/axis'
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
import { ExtGseaEsSvgPlot } from './ext-gsea-es-svg'
import { ExtGseaGenesSvgPlot } from './ext-gsea-hits'
import { ExtGseaTitleSvg } from './title-svg'

const ExtGseaSvgPlot = memo(function ExtGseaSvgPlot({
  result,
  pos,
}: {
  result: IExtGseaPlotResult
  pos: IPos
}) {
  const { settings: gseaSettings } = useGseaSettings()

  const { axis: xax } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'x',
  })

  const { axis: yax } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'y',
  })

  const ylen = axisLength(yax)

  const yOffset = ylen + 1.5 * gseaSettings.plot!.gap.y

  const xaf = useMemo(() => axisDomainToRangeFunc(xax), [xax])

  const scores = result.scores

  const crossing = useMemo(() => crossingIndex(scores, xaf), [scores, xaf])

  return (
    <>
      {gseaSettings.title.show && (
        <ExtGseaTitleSvg name={result.name} xax={xax} />
      )}

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

      {gseaSettings.ranking.show && (
        <SvgG
          pos={{
            x: 0,
            y:
              ylen +
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
})

export function ExtGseaSvgContent() {
  const { results } = useExtGseaContext()
  const { settings: gseaSettings } = useGseaSettings()
  const { zoom } = useZoom()

  const innerPlotSize: IDim = useMemo(() => {
    return {
      w: gseaSettings.axes.x.length,
      h:
        gseaSettings.es.axes.y.length +
        (gseaSettings.genes.stroke.show
          ? 2 * (gseaSettings.plot.gap.y + gseaSettings.genes.height)
          : 0) +
        (gseaSettings.ranking.show
          ? gseaSettings.plot.gap.y + gseaSettings.ranking.axes.y.length
          : 0),
    }
  }, [gseaSettings])

  const plotSize: IDim = useMemo(() => {
    return {
      w:
        innerPlotSize.w +
        gseaSettings.plot.margin.left +
        gseaSettings.plot.margin.right,
      h:
        innerPlotSize.h +
        gseaSettings.plot.margin.top +
        gseaSettings.plot.margin.bottom,
    }
  }, [innerPlotSize, gseaSettings])

  const pageSize: IDim = useMemo(() => {
    return {
      w: plotSize.w * gseaSettings.page.columns,
      h: plotSize.h * Math.ceil(results.length / gseaSettings.page.columns),
    }
  }, [plotSize, gseaSettings.page.columns, results.length])

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

      if (ri % gseaSettings.page.columns === gseaSettings.page.columns - 1) {
        x = 0
        y += plotSize.h
      }
    }

    return <SvgMargin margin={gseaSettings.plot.margin}>{elems}</SvgMargin>
  }, [results, plotSize, gseaSettings.page.columns, gseaSettings.plot.margin])

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
