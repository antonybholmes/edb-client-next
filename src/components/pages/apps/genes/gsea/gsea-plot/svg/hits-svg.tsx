import { useCallback, useMemo } from 'react'

import { IPos } from '@/interfaces/pos'
import { addAlphaToHex, COLOR_BLACK } from '@/lib/color/color'
import { ColorMap } from '@/lib/color/colormap'

import { axisDomainToRangeFunc, IAxis } from '@/components/plot/axes/axis'
import { SvgG } from '@/components/plot/svg-g'
import { SvgRect } from '@/components/plot/svg-rect'
import { IDim } from '@/interfaces/dim'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { IRankedGene } from '@/lib/gsea/geneset'
import { findNearest } from '@/lib/search'
import { useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { useGseaSettings } from '../gsea-settings-store'
import { IGseaTableResult, useGseaData } from '../gsea-store'

export function GenesSvg({
  pathway,

  innerPlotSize,

  es,
  hits,
  crossing,
  pos,
  xax,
  yaf,
}: {
  pathway: IGseaTableResult

  es: IRankedGene[]
  hits: IRankedGene[]
  crossing: { index: number; x: number }
  innerPlotSize: IDim
  pos: IPos
  xax: IAxis
  yaf: (v: number) => number
}) {
  const { settings } = useGseaSettings()

  const { ref } = useSVG()
  const { showCrosshair, hideCrosshair } = useCrosshair()

  const { result } = useGseaData(pathway.name)

  const c1 = settings.genes.pos.value
  const c2 = addAlphaToHex(
    settings.genes.pos.value,
    settings.genes.gradient.opacity
  )
  const c3 = addAlphaToHex(
    settings.genes.neg.value,
    settings.genes.gradient.opacity
  )
  const c4 = settings.genes.neg.value
  const cmap1 = new ColorMap('pos', 'pos', [c1, c2])
  const cmap2 = new ColorMap('neg', 'neg', [c3, c4])

  const xaf = useMemo(() => axisDomainToRangeFunc(xax), [xax])

  const points: IPos[] = useMemo(() => {
    return hits.map((e) => ({
      x: xaf(e.rank),
      y: yaf(e.score),
    }))
  }, [hits, xaf, yaf])

  const xp = points.map((p) => p.x)

  // for a given point, use its rank to find the corresponding gene in sortedRankedGenes,
  // then use its score to determine the color of the point. This is because we base
  // color on the ranking of all genes in the exp matrix so we are essentially using
  // the signal to noise ratio to color the points from red (positive) to blue (negative)
  const posPoints = points.filter((_, pi) => {
    return es[hits[pi]!.rank]!.score >= 0
  })

  const negPoints = points.filter((_, pi) => es[hits[pi]!.rank]!.score < 0)

  // const _hideTooltip = useCallback(() => {
  //   hideCrosshair()
  //   hideTooltip()
  // }, [hideCrosshair, hideTooltip])

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
        x: svgP.x - pos.x - settings.plot.margin.left,
        y: svgP.y - pos.y - settings.plot.margin.top,
      }

      const { index } = findNearest(plotP.x, xp)

      // find nearest es point using binary search
      const nearestEsPoint = points[index]

      if (Math.abs(plotP.x - nearestEsPoint.x) > 5) {
        hideCrosshair()
        return
      }

      const barP = {
        x: nearestEsPoint.x + settings.plot.margin.left + pos.x,
        y: settings.plot.margin.top + pos.y + settings.genes.height / 2,
      }

      const { relativeP: barScreenP } = svgPointToScreen(ref.current, barP)

      showCrosshair({
        pos: barScreenP,
        content: (
          <>
            <strong>{result.hits[index].name}</strong>
            <span>{`Rank: ${result.hits[index].rank.toLocaleString()}`}</span>
            <span>{`Score: ${result.hits[index].score.toFixed(3)}`}</span>
          </>
        ),
      })
      // showTooltip({
      //   pos: { x: screenP.x + 5, y: screenP.y + 5 },
      //   content: (
      //     <>
      //       <strong>{result.es[left].name}</strong>
      //       <span>{`Rank: ${result.es[left].rank.toLocaleString()}`}</span>
      //       <span>{`Score: ${result.es[left].score.toFixed(3)}`}</span>
      //     </>
      //   ),
      // })
    },
    [
      pos,
      ref,
      settings.plot.margin,
      points,
      showCrosshair,
      hideCrosshair,
      result,
      innerPlotSize,
      // showTooltip,
      // hideTooltip,
    ]
  )

  return (
    <SvgG pos={pos}>
      {posPoints.map((p, pi) => {
        const pc = p.x / crossing.x

        const color = settings.genes.color.on
          ? cmap1.getHexColor(pc)
          : COLOR_BLACK
        return (
          <line
            key={pi}
            x1={p.x}
            x2={p.x}
            y1={0}
            y2={settings.genes.height}
            strokeWidth={settings.genes.pos.width}
            stroke={color}
          />
        )
      })}

      {negPoints.map((p, pi) => {
        const pc = (p.x - crossing.x) / (xax.range[1] - crossing.x)

        const color = settings.genes.color.on
          ? cmap2.getHexColor(pc)
          : COLOR_BLACK
        return (
          <line
            key={posPoints.length + pi}
            x1={p.x}
            x2={p.x}
            y1={0}
            y2={settings.genes.height}
            strokeWidth={settings.genes.neg.width}
            stroke={color}
          />
        )
      })}

      <SvgRect
        id="mouse-rect"
        data-interaction-only="true"
        width={innerPlotSize.w}
        height={settings.genes.height}
        fill="transparent"
        pointerEvents="all"
        onMouseMove={onMouseMove}
        onMouseLeave={hideCrosshair}
      />
    </SvgG>
  )
}
