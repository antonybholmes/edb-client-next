import { useCallback, useMemo } from 'react'

import { IPos } from '@/interfaces/pos'
import { COLOR_BLACK, COLOR_WHITE } from '@/lib/color/color'
import { ColorMap, getColorMap } from '@/lib/color/colormap'

import { IRankedGene } from '@/components/pages/apps/genes/gsea/gsea-plot/geneset'
import { axisDomainToRangeFunc, IAxis } from '@/components/plot/axes/axis'
import { SvgG } from '@/components/plot/svg-g'
import { SvgRect } from '@/components/plot/svg-rect'
import { IDim } from '@/interfaces/dim'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { makeUuid } from '@/lib/id'
import { abs } from '@/lib/math/abs'
import { max } from '@/lib/math/math'
import { findNearest } from '@/lib/search'
import { useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { IGseaDisplayProps, useGseaSettings } from '../gsea-settings-store'
import { IGseaTableResult, useGseaData } from '../gsea-store'

export function getColorMapFromSettings(settings: IGseaDisplayProps): ColorMap {
  if (settings.genes.color.gradient.mode === 'cmap') {
    return getColorMap(settings.genes.color.gradient.cmap).reverse()
  }

  //we make a custom heatmap using the user specified colors

  return new ColorMap(makeUuid(), 'user', [
    settings.genes.pos.value,
    COLOR_WHITE,
    settings.genes.neg.value,
  ])
}

export function GenesSvg({
  pathway,
  innerPlotSize,
  scores,
  hits,
  crossing,
  pos,
  xax,
  yaf,
}: {
  pathway: IGseaTableResult
  scores: IRankedGene[]
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

  // const c1 = settings.genes.pos.value
  // const c2 = addAlphaToHex(
  //   settings.genes.pos.value,
  //   settings.genes.gradient.opacity
  // )
  // const c3 = addAlphaToHex(
  //   settings.genes.neg.value,
  //   settings.genes.gradient.opacity
  // )
  //const c4 = settings.genes.neg.value
  //const cmap1 = new ColorMap('pos', 'pos', [c1, c2])
  //const cmap2 = new ColorMap('neg', 'neg', [c3, c4])

  // we reverse the colormap because in a gsea plot,
  // red/up appears on the left and blue/down appears on the right
  const cmap = getColorMapFromSettings(settings)

  const xaf = useMemo(() => axisDomainToRangeFunc(xax), [xax])

  //const rightWidth = xax.range[1] - crossing.x

  const maxRank = scores.length - 1

  const xp: number[] = useMemo(() => {
    return hits.map((e) => xaf(e.rank))
  }, [hits, xaf, yaf])

  const maxAbsScore = useMemo(
    () => max(abs(scores.map((e) => e.score))),
    [scores]
  )

  // for a given point, use its rank to find the corresponding gene in sortedRankedGenes,
  // then use its score to determine the color of the point. This is because we base
  // color on the ranking of all genes in the exp matrix so we are essentially using
  // the signal to noise ratio to color the points from red (positive) to blue (negative)
  // const posPoints = xp.filter((_, pi) => {
  //   return scores[hits[pi]!.rank]!.score >= 0
  // })

  // const negPoints = xp.filter((_, pi) => scores[hits[pi]!.rank]!.score < 0)

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
      const nearestEsPoint = xp[index]

      if (Math.abs(plotP.x - nearestEsPoint) > 5) {
        hideCrosshair()
        return
      }

      const barP = {
        x: nearestEsPoint + settings.plot.margin.left + pos.x,
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
    },
    [
      pos,
      ref,
      settings.plot.margin,
      xp,
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
      {hits.map((hit, hi) => {
        const x = xp[hi]

        // scale from -1 to 1 and then normalize to 0-1 range

        let pc = 0

        const isLeft = hit.rank <= crossing.index

        if (settings.genes.color.mode === 'score') {
          pc = (1 - hit.score / maxAbsScore) * 0.5
        } else {
          pc = isLeft
            ? 0.5 * (hit.rank / crossing.index)
            : 0.5 +
              0.5 * ((hit.rank - crossing.index) / (maxRank - crossing.index))
        }

        pc =
          (1 - settings.genes.color.gradient.weight) * (isLeft ? 0 : 1) +
          settings.genes.color.gradient.weight * pc

        const color = settings.genes.color.on
          ? cmap.getHexColor(pc)
          : COLOR_BLACK

        return (
          <line
            key={hi}
            x1={x}
            x2={x}
            y1={0}
            y2={settings.genes.height}
            strokeWidth={settings.genes.pos.width}
            stroke={color}
            strokeOpacity={settings.genes.color.gradient.opacity}
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
