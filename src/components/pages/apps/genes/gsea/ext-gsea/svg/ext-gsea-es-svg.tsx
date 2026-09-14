import { useMemo, type ReactNode } from 'react'

import type { IGseaResult } from '@/components/pages/apps/genes/gsea/ext-gsea/ext-gsea'
import { axisDomainToRangeFunc } from '@/components/plot/axes/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'

import { type IGeneSet } from '@/components/pages/apps/genes/gsea/gsea-plot/geneset'
import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { COLOR_BLACK } from '@/lib/color/color'
import { EsCurveSvg, EsLeadingEdgeSvg } from '../../gsea-plot/svg/es-svg'
import { IExtGseaPlotResult, useExtGseaContext } from '../ext-gsea-provider'

export function ExtGseaEsCurveSvg({
  result,
  gs,
  gsea,
  gsMode,
}: {
  result: IExtGseaPlotResult
  gs: IGeneSet
  gsea: IGseaResult
  gsMode: 'gs1' | 'gs2'
}) {
  const { displayProps } = useExtGseaContext()

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

  if (gsea.leadingEdge.length === 0) {
    return null
  }

  // size of plot with padding

  // const subSampledRankedGenes = subsampleRankedGenes(
  //   gsea.esAll,
  //   settings.es.step
  // )

  // let points: IPos[] = subSampledRankedGenes.map((g) => ({
  //   x: g.rank,
  //   y: g.score,
  // }))

  //let hitPoints: IPos[] = gsea.esHits.map((g) => ({ x: g.rank, y: g.score }))

  // subsample so we don't draw every point
  //const ix = range(0, x.length, displayProps.es.step)
  //
  //const x1 = ix.map((i) => x[i]!)

  // we must end at the last point so zero the ends and fix
  // fix x

  // let leadingEdgeIdx =
  //   gsea.es >= 0
  //     ? gsea.leadingEdge[gsea.leadingEdge.length - 1].rank
  //     : gsea.leadingEdge[0].rank

  // // now we want the ix that are within the leading edge
  // let leadingIdx =
  //   gsea.es >= 0
  //     ?
  //     : where(  hits, (p) => p.rank >= leadingEdgeIdx)

  // const leadingHits = hits.filter((g) =>
  //   gsea.es >= 0 ? g.rank <= leadingEdgeIdx : g.rank >= leadingEdgeIdx
  // )

  // let leadingRankedGenes = leadingIdx.map((i) => hits[i])

  // fix ends

  const yaf = axisDomainToRangeFunc(yaxEs)

  const { leadingEdge, es, esHits } = gsea

  //const maxRank = result.scores.length - 1

  let leadingEdgeEs = useMemo(() => {
    let les = leadingEdge.map((g) => es[g.rank])

    les =
      gsea.esScore >= 0
        ? [...les, { ...les[les.length - 1]!, esScore: 0 }]
        : [{ ...les[0]!, esScore: 0 }, ...les]

    return les
  }, [leadingEdge, es]) //.map((g) => result.es[g.rank])

  let leadingEdge1Svg: ReactNode | undefined = undefined

  // const esHits: IRankedGene[] = useMemo(
  //   () =>
  //     settings.phenotypes.invert
  //       ? gsea.esHits
  //           .map((e) => ({ ...e, rank: maxRank - e.rank, score: -e.score }))
  //           .sort((a, b) => a.rank - b.rank)
  //       : gsea.esHits,
  //   [gsea.esHits, maxRank, settings.phenotypes.invert]
  // )

  if (displayProps.es[gsMode].leadingEdge.show) {
    leadingEdge1Svg = (
      <EsLeadingEdgeSvg
        leadingEdge={leadingEdgeEs}
        xax={xax}
        yaf={yaf}
        fill={gs.color ?? displayProps.es[gsMode].leadingEdge.value}
        fillOpacity={displayProps.es[gsMode].leadingEdge.opacity}
      />
    )
  }

  let line1Svg: ReactNode | undefined = undefined

  if (displayProps.es[gsMode].curve.show) {
    //const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ')

    line1Svg = (
      <EsCurveSvg
        hits={esHits}
        xax={xax}
        yax={yaxEs}
        stroke={gs.color ?? displayProps.es[gsMode].curve.value}
      />
    )

    // line1Svg = (
    //   <SvgPolyLine
    //     points={pointsStr}
    //     stroke={gs.color ?? displayProps.es[gsMode].curve.value}
    //     s={displayProps.es[gsMode].curve}
    //     fill="none"
    //   />
    // )
  }

  return (
    <>
      {leadingEdge1Svg && leadingEdge1Svg}
      {line1Svg && line1Svg}
    </>
  )
}

export function ExtGseaEsSvgPlot({ result }: { result: IExtGseaPlotResult }) {
  const { displayProps } = useExtGseaContext()

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

  // const { scores, gs1, gs2, extGsea, gsea1, gsea2 } = useMemo(() => {
  //   return {
  //     scores: result.scores,
  //     gs1: settings.phenotypes.invert ? result.gs2 : result.gs1,
  //     gs2: settings.phenotypes.invert ? result.gs1 : result.gs2,
  //     extGsea: result.extGsea,
  //     gsea1: settings.phenotypes.invert ? result.gsea2 : result.gsea1,
  //     gsea2: settings.phenotypes.invert ? result.gsea1 : result.gsea2,
  //   }
  // }, [result, settings.phenotypes.invert])

  const { scores, gs1, gs2, extGsea, gsea1, gsea2 } = result

  const yaf = axisDomainToRangeFunc(yaxEs)

  if (!gsea1 || !gsea2) {
    return null
  }

  return (
    <SvgG
      pos={{
        x: 0,
        y: 0,
      }}
    >
      <ExtGseaEsCurveSvg result={result} gs={gs1} gsea={gsea1} gsMode="gs1" />

      <ExtGseaEsCurveSvg result={result} gs={gs2} gsea={gsea2} gsMode="gs2" />

      <AxisLeftSvg ax={yaxEs} />
      <SvgG
        pos={{
          x: 0,
          y: yaf(0),
        }}
      >
        <AxisBottomSvg ax={xax} showTicks={displayProps.es.axes.x.showTicks} />
        <SvgG
          pos={{
            x: displayProps.axes.x.length + displayProps.plot!.gap.x / 2,
            y: 0,
          }}
        >
          <SvgText fill={COLOR_BLACK} font={displayProps.axes.x.font}>
            {scores.length.toLocaleString()}
          </SvgText>
        </SvgG>
      </SvgG>

      <SvgG
        pos={{
          x: 0,
          y: displayProps.es.axes.y.length + displayProps.plot!.gap.y / 2,
        }}
      >
        <SvgG>
          <SvgText fill={COLOR_BLACK} font={displayProps.axes.x.font}>
            {gs1.name}
          </SvgText>
        </SvgG>

        <SvgG
          pos={{
            x: displayProps.axes.x.length,
            y: 0,
          }}
        >
          <SvgText
            fill={COLOR_BLACK}
            font={displayProps.axes.x.font}
            textAnchor="end"
          >
            {gs2.name}
          </SvgText>
        </SvgG>
      </SvgG>

      {displayProps.es.stats.show && (
        <SvgG
          id="stats"
          pos={{
            x: displayProps.axes.x.length,
            y: 0,
          }}
        >
          <SvgText fill={COLOR_BLACK} font={displayProps.axes.x.font}>
            NES: {extGsea.nes.toFixed(2)}
          </SvgText>

          <SvgG
            pos={{
              x: 0,
              y: 20,
            }}
          >
            <SvgText fill={COLOR_BLACK} font={displayProps.axes.x.font}>
              P-value: {extGsea.pvalue.toFixed(3)}
            </SvgText>
          </SvgG>
        </SvgG>
      )}
    </SvgG>
  )
}
