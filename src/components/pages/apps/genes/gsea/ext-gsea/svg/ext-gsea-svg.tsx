import { ReactElement, useCallback, useMemo } from 'react'

import { axisDomainToRangeFunc } from '@/components/plot/axes/axis'
import type { IGseaResult } from '@/lib/gsea/ext-gsea'

import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgG } from '@/components/plot/svg-g'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgRect } from '@/components/plot/svg-rect'
import { IDim } from '@/interfaces/dim'
import { IPos } from '@/interfaces/pos'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { type IGeneSet } from '@/lib/gsea/geneset'
import { findNearest } from '@/lib/search'
import { CrosshairProvider, useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { useTooltip } from '@/providers/tooltip-provider'
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
  innerPlotSize,
}: {
  result: IExtGseaPlotResult
  pos: IPos
  innerPlotSize: IDim
}) {
  const { plot } = useExtGseaContext()

  const { axis: xax } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'x',
  })

  const { axis: yaxEs } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'y',
  })

  const { ref } = useSVG()
  const { showCrosshair, hideCrosshair } = useCrosshair()
  const { showTooltip, hideTooltip } = useTooltip()

  const displayProps: IExtGseaSettings = plot.props

  const gs1: IGeneSet = result.gs1
  const gs2: IGeneSet = result.gs2

  const gsea1: IGseaResult = result.gsea1
  const gsea2: IGseaResult = result.gsea2

  const { points1, points2 } = useMemo(() => {
    if (!xax || !yaxEs) {
      return { points1: [], points2: [] }
    }

    const xaf = axisDomainToRangeFunc(xax)
    const yaf = axisDomainToRangeFunc(yaxEs)

    const points1 = gsea1.esHits.map((e) => ({
      x: xaf(e.rank),
      y: yaf(e.score),
    }))
    const points2 = gsea2.esHits.map((e) => ({
      x: xaf(e.rank),
      y: yaf(e.score),
    }))

    return { points1, points2 }
  }, [gsea1.esHits, gsea2.esHits, xax, yaxEs])

  const _hideTooltip = useCallback(() => {
    hideCrosshair()
    hideTooltip()
  }, [hideCrosshair, hideTooltip])

  const onMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) {
        return
      }

      const svgP = screenToSvgPoint(ref.current, {
        x: e.clientX,
        y: e.clientY,
      })

      const plotP = {
        x: svgP.x - pos.x - displayProps.plot.margin.left,
        y: svgP.y - pos.y - displayProps.plot.margin.top,
      }

      if (
        plotP.x < 0 ||
        plotP.x > innerPlotSize.w ||
        plotP.y < 0 ||
        plotP.y > innerPlotSize.h
      ) {
        //setBarPos(null)
        _hideTooltip()
        return
      }

      const { value: nearest1, index: index1 } = findNearest(
        plotP.x,
        points1.map((p) => p.x)
      )
      const { value: nearest2, index: index2 } = findNearest(
        plotP.x,
        points2.map((p) => p.x)
      )

      if (
        Math.abs(plotP.x - nearest1) > 5 &&
        Math.abs(plotP.x - nearest2) > 5
      ) {
        _hideTooltip()
        return
      }

      const barP = {
        x: nearest1 + displayProps.plot.margin.left + pos.x,
        y: plotP.y + displayProps.plot.margin.top + pos.y,
      }

      const { relativeP: barScreenP, screenP } = svgPointToScreen(
        ref.current,
        barP
      )

      showCrosshair(barScreenP)
      showTooltip({
        pos: { x: screenP.x + 5, y: screenP.y + 5 },
        content: (
          <>
            <strong>{gs1.name}</strong>
            <span>{`Name: ${gsea1.esHits[index1].name}`}</span>
            <span>{`Rank: ${gsea1.esHits[index1].rank.toLocaleString()}, Score: ${gsea1.esHits[index1].score.toFixed(3)}`}</span>

            <strong>{gs2.name}</strong>
            <span>{`Name: ${gsea2.esHits[index2].name}`}</span>
            <span>{`Rank: ${gsea2.esHits[index2].rank.toLocaleString()},Score: ${gsea2.esHits[index2].score.toFixed(3)}`}</span>
          </>
        ),
      })
    },
    [
      pos,
      ref,
      displayProps.plot.margin,
      gsea1,
      gsea2,
      gs1,
      gs2,
      points1,
      points2,
      showCrosshair,
      hideCrosshair,
      result,
      innerPlotSize,
      showTooltip,
      hideTooltip,
    ]
  )

  return (
    <>
      {displayProps.title.show && (
        <ExtGseaTitleSvg name={result.name} displayProps={displayProps} />
      )}

      <ExtGseaEsSvgPlot result={result} />

      <ExtGseaGenesSvgPlot result={result} />

      {displayProps.ranking.show && <ExtGseaRankingSvg result={result} />}

      <SvgRect
        id="mouse-rect"
        data-interaction-only="true"
        width={innerPlotSize.w}
        height={innerPlotSize.h}
        fill="transparent"
        pointerEvents="all"
        onMouseMove={onMouseMove}
        onMouseLeave={_hideTooltip}
      />
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
          innerPlotSize={innerPlotSize}
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
