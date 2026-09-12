import { useMemo, type ReactNode } from 'react'

import { axisDomainToRange, axisLength } from '@/components/plot/axes/axis'
import type { IGseaResult } from '@/lib/gsea/ext-gsea'

import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgText } from '@/components/plot/svg-text'
import { COLOR_BLACK } from '@/lib/color/color'
import { geneSetScores, type IGeneSet } from '@/lib/gsea/geneset'
import { abs } from '@/lib/math/abs'
import { max } from '@/lib/math/math'
import { IExtGseaPlotResult, useExtGseaContext } from '../ext-gsea-provider'
import { IExtGseaSettings } from '../ext-gsea-settings'

export function ExtGseaGenesSvgPlot({
  result,
}: {
  result: IExtGseaPlotResult
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

  const displayProps: IExtGseaSettings = plot.props

  const gs1: IGeneSet = result.gs1
  const gs2: IGeneSet = result.gs2

  const gsea1: IGseaResult = result.gsea1
  const gsea2: IGseaResult = result.gsea2

  const genesSvg = useMemo(() => {
    let genesSvg: ReactNode | undefined = undefined

    if (displayProps.genes.line.show) {
      const scores1 = abs(geneSetScores(gs1).map((g) => g.score))
      const scores2 = abs(geneSetScores(gs2).map((g) => g.score))
      // scale colors to score, for generic ext gsea
      // score is always 1 so no effect, for viper
      // we can scale by strength of interaction with
      // target
      let maxScore = max([...scores1, ...scores2])

      let hitIdx = gsea1.esHits.map((g) => g.rank)

      let xs = axisDomainToRange(xax, hitIdx)

      const extGsea1Svg = (
        <SvgG>
          <SvgG>
            {hitIdx.map((hit, hiti) => {
              const x = xs[hiti]

              const score = scores1[hiti] / maxScore
              const diff = 1 - score

              //need to vary between 1 and score/max score according to the gene score
              const opacity =
                score + diff * (1 - displayProps.genes.geneScoreWeight)

              return (
                <SvgLine
                  key={hiti}
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={displayProps.genes.height}
                  s={displayProps.genes.line}
                  stroke={gs1.color ?? displayProps.es.gs1.curve.value}
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
                    ? (gs1.color ?? displayProps.es.gs1.curve.value)
                    : COLOR_BLACK
                }
                font={displayProps.genes.labels.font}
              >
                {gs1.name}
              </SvgText>
            </SvgG>
          )}
        </SvgG>
      )

      hitIdx = gsea2.esHits.map((g) => g.rank)
      xs = axisDomainToRange(xax, hitIdx)

      const extGsea2Svg = (
        <SvgG
          pos={{
            x: 0,
            y: displayProps.genes.height + 0.25 * displayProps.plot!.gap.y,
          }}
        >
          <SvgG>
            {hitIdx.map((hit, hiti) => {
              const x = xs[hiti]
              const score = scores2[hiti] / maxScore
              const diff = 1 - score

              // when weight is 0 -> score + diff = 1 -> no weighting
              // when weight is 1 -> opacity = score -> full weighting as no
              // influence of diff
              const opacity =
                score + diff * (1 - displayProps.genes.geneScoreWeight)

              return (
                <SvgLine
                  key={hiti}
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={displayProps.genes.height}
                  s={displayProps.genes.line}
                  stroke={gs2.color ?? displayProps.es.gs2.curve.value}
                  strokeOpacity={opacity}
                />
              )
            })}
          </SvgG>

          {displayProps.genes.labels.font.show && (
            <SvgG
              pos={{
                x: axisLength(xax) + displayProps.plot!.gap.x / 2,
                y: displayProps.genes.height / 2,
              }}
            >
              <SvgText
                fill={
                  displayProps.genes.labels.isColored
                    ? (gs2.color ?? displayProps.es.gs2.curve.value)
                    : COLOR_BLACK
                }
                font={displayProps.genes.labels.font}
              >
                {gs2.name}
              </SvgText>
            </SvgG>
          )}
        </SvgG>
      )

      genesSvg = (
        <SvgG
          pos={{
            x: 0,
            y: displayProps.es.axes.y.length + 1.5 * displayProps.plot!.gap.y,
          }}
        >
          {extGsea1Svg}
          {extGsea2Svg}
        </SvgG>
      )
    }

    return genesSvg
  }, [xax, yaxEs, displayProps])

  return genesSvg
}
