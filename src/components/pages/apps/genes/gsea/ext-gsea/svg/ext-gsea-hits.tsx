import { useCallback, useMemo, type ReactNode } from 'react'

import {
  axisDomainToRangeFunc,
  axisLength,
  IAxis,
} from '@/components/plot/axes/axis'

import {
  geneSetScores,
  IRankedGene,
  type IGeneSet,
} from '@/components/pages/apps/genes/gsea/gsea-plot/geneset'
import { gsea } from '@/components/pages/apps/genes/gsea/gsea-plot/gsea'
import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgRect } from '@/components/plot/svg-rect'
import { SvgText } from '@/components/plot/svg-text'
import { IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { getColorMap } from '@/lib/color/colormap'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import { max } from '@/lib/math/math'
import { findNearest } from '@/lib/search'
import { useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { useGseaSettings } from '../../gsea-plot/gsea-settings-store'
import { IExtGseaPlotResult, useExtGseaContext } from '../ext-gsea-provider'
import { IExtGseaSettings } from '../ext-gsea-settings'

export function ExtGseaHitsSvg({
  xax,
  gs,
  esHits,
  maxScore,
  gsMode,
  pos,
}: {
  xax: IAxis
  gs: IGeneSet
  esHits: IRankedGene[]
  //scores: IRankedGene[]
  maxScore: number
  gsMode: 'gs1' | 'gs2'
  pos: IPos
}) {
  const { displayProps } = useExtGseaContext()
  const { ref } = useSVG()
  const { showCrosshair, hideCrosshair } = useCrosshair()
  const { settings } = useGseaSettings()
  //const { showTooltip, hideTooltip } = useTooltip()

  const w = useMemo(() => axisLength(xax), [xax])

  const cmap = getColorMap(settings.genes.cmap).reverse()

  const points = useMemo(() => {
    if (!xax) {
      return []
    }

    const xaf = axisDomainToRangeFunc(xax)

    const points = esHits.map((e) => ({
      x: xaf(e.rank),
      y: 0,
    }))

    return points
  }, [esHits, xax])

  //   const _hideTooltip = useCallback(() => {
  //     hideCrosshair()
  //     hideTooltip()
  //   }, [hideCrosshair, hideTooltip])

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
        plotP.x > w ||
        plotP.y < 0 ||
        plotP.y > displayProps.genes.height
      ) {
        hideCrosshair()
        return
      }

      const { value: nearest, index: index } = findNearest(
        plotP.x,
        points.map((p) => p.x)
      )

      if (Math.abs(plotP.x - nearest) > 5) {
        hideCrosshair()
        return
      }

      //const rank = esHits[index].rank

      const barP = {
        x: nearest + displayProps.plot.margin.left + pos.x,
        y: displayProps.plot.margin.top + pos.y + displayProps.genes.height / 2,
      }

      const { relativeP: barScreenP } = svgPointToScreen(ref.current, barP)

      showCrosshair({
        pos: barScreenP,
        content: (
          <>
            <strong>
              {esHits[index].name} ({gs.name})
            </strong>
            <span>{`Score: ${esHits[index].score.toFixed(3)}`}</span>
            <span>{`Rank: ${esHits[index].rank.toLocaleString()}`}</span>
          </>
        ),
      })
      //   showTooltip({
      //     pos: { x: screenP.x + 5, y: screenP.y + 5 },
      //     content: (
      //       <>
      //         <strong>{gs.name}</strong>
      //         <span>{`Name: ${esHits[index].name}`}</span>
      //         <span>{`Rank: ${esHits[index].rank.toLocaleString()}, Score: ${esHits[index].score.toFixed(3)}`}</span>
      //       </>
      //     ),
      //   })
    },
    [pos, ref, displayProps, esHits, gs, points, showCrosshair, hideCrosshair]
  )

  const genesSvg = useMemo(() => {
    let genesSvg: ReactNode | undefined = undefined

    if (!points || points.length === 0) {
      return null
    }

    if (displayProps.genes.line.show) {
      // scale colors to score, for generic ext gsea
      // score is always 1 so no effect, for viper
      // we can scale by strength of interaction with
      // target

      //let hitIdx = gsea.esHits.map((g) => g.rank)

      //let xs = axisDomainToRange(xax, hitIdx)

      //const xaf = axisDomainToRangeFunc(xax)

      return (
        <>
          <SvgG id="hits">
            {esHits.map((hit, hiti) => {
              const x = points[hiti].x // ?? xaf(gsea.esHits[hiti].rank)

              const score = (Math.abs(hit.score) / maxScore) * 0.5
              const diff = 1 - score

              //need to vary between 1 and score/max score according to the gene score
              const opacity =
                score + diff * (1 - displayProps.genes.geneScoreWeight)

              const color = cmap.getHexColor(
                score + (gsMode === 'gs2' ? 0.5 : 0)
              )

              return (
                <SvgLine
                  key={hiti}
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={displayProps.genes.height}
                  s={displayProps.genes.line}
                  stroke={color} //gs.color ?? displayProps.es[gsMode].curve.value}
                  strokeOpacity={opacity}
                />
              )
            })}
          </SvgG>

          {displayProps.genes.labels.font.show && (
            <SvgG
              pos={{
                x: displayProps.axes.x.length + displayProps.plot!.gap.x / 2,
                y: displayProps.genes.height * 0.5,
              }}
            >
              <SvgText
                fill={
                  displayProps.genes.labels.isColored
                    ? (gs.color ?? displayProps.es[gsMode].curve.value)
                    : COLOR_BLACK
                }
                font={displayProps.genes.labels.font}
              >
                {gs.name}
              </SvgText>
            </SvgG>
          )}

          <SvgRect
            id="mouse-rect"
            data-interaction-only="true"
            width={w}
            height={displayProps.genes.height}
            fill="transparent"
            pointerEvents="all"
            onMouseMove={onMouseMove}
            onMouseLeave={hideCrosshair}
          />
        </>
      )
    }

    return genesSvg
  }, [
    gs,
    gsMode,
    gsea,
    xax,
    points,
    maxScore,
    displayProps,
    pos,
    onMouseMove,
    hideCrosshair,
  ])

  return genesSvg
}

export function ExtGseaGenesSvgPlot({
  result,
  pos,
}: {
  result: IExtGseaPlotResult
  pos: IPos
}) {
  const { plot } = useExtGseaContext()

  const { axis: xax } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'x',
  })

  const displayProps: IExtGseaSettings = plot.props

  const { gs1, gs2, esHits1, esHits2, scores1, scores2 } = useMemo(() => {
    /* let gs1 = settings.phenotypes.invert ? result.gs2 : result.gs1
    let gs2 = settings.phenotypes.invert ? result.gs1 : result.gs2
    let esHits1 = settings.phenotypes.invert
      ? result.gsea2.esHits
      : result.gsea1.esHits
    let esHits2 = settings.phenotypes.invert
      ? result.gsea1.esHits
      : result.gsea2.esHits */

    let gs1 = result.gs1
    let gs2 = result.gs2
    let esHits1 = result.gsea1.esHits
    let esHits2 = result.gsea2.esHits

    let scores1 = geneSetScores(gs1).map((g) => ({
      ...g,
      score: Math.abs(g.score),
    }))

    let scores2 = geneSetScores(gs2).map((g) => ({
      ...g,
      score: Math.abs(g.score),
    }))

    // if (settings.phenotypes.invert) {
    //   const maxRank = result.scores.length - 1
    //   esHits1 = esHits1.map((hit) => ({
    //     ...hit,
    //     rank: maxRank - hit.rank,
    //     score: -hit.score,
    //   })) // reverse the rank
    //   esHits2 = esHits2.map((hit) => ({
    //     ...hit,
    //     rank: maxRank - hit.rank,
    //     score: -hit.score,
    //   })) // reverse the rank

    //   scores1 = scores1.reverse()
    //   scores2 = scores2.reverse()
    // }

    return { gs1, gs2, esHits1, esHits2, scores1, scores2 }
  }, [result])

  const genesSvg = useMemo(() => {
    let genesSvg: ReactNode | undefined = undefined

    if (displayProps.genes.line.show) {
      // scale colors to score, for generic ext gsea
      // score is always 1 so no effect, for viper
      // we can scale by strength of interaction with
      // target
      let maxScore = max([
        ...scores1.map((g) => g.score),
        ...scores2.map((g) => g.score),
      ])

      const yOffset = displayProps.genes.height + 0.25 * displayProps.plot.gap.y

      return (
        <>
          <ExtGseaHitsSvg
            xax={xax}
            gs={gs1}
            esHits={esHits1}
            //scores={scores1}
            maxScore={maxScore}
            gsMode="gs1"
            pos={pos}
          />

          <SvgG
            pos={{
              x: 0,
              y: yOffset,
            }}
          >
            <ExtGseaHitsSvg
              xax={xax}
              gs={gs2}
              esHits={esHits2}
              //scores={scores2}
              maxScore={maxScore}
              gsMode="gs2"
              pos={{
                x: pos.x,
                y: pos.y + yOffset,
              }}
            />
          </SvgG>
        </>
      )
    }

    return genesSvg
  }, [result, pos, gs1, gs2, esHits1, esHits2, displayProps])

  return genesSvg
}
