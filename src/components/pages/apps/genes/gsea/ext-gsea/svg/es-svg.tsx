import { type ReactNode } from 'react'

import { axisDomainToRangeFunc } from '@/components/plot/axes/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import type { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'

import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { COLOR_BLACK } from '@/lib/color/color'
import { type IGeneSet, type IRankedGene } from '@/lib/gsea/geneset'
import { range } from '@/lib/math/range'
import { where } from '@/lib/math/where'
import { EsCurveSvg, EsLeadingEdgeSvg } from '../../gsea-plot/svg/es-svg'
import { IExtGseaPlotResult, useExtGseaContext } from '../ext-gsea-provider'
import { IExtGseaSettings } from '../ext-gsea-settings'

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

  if (gsea.leadingEdge.length === 0) {
    return null
  }

  const displayProps: IExtGseaSettings = plot.props

  // size of plot with padding

  const ix = range(0, gsea.esAll.length, displayProps.es.step)

  let subSampledRankedGenes = ix.map((i) => gsea.esAll[i]!)

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

  if (subSampledRankedGenes[0].rank !== 0) {
    subSampledRankedGenes = [
      { rank: 0, name: '', score: 0 },
      ...subSampledRankedGenes,
    ]
  }

  if (
    subSampledRankedGenes[subSampledRankedGenes.length - 1].rank !==
    result.rankedGenes.length - 1
  ) {
    subSampledRankedGenes = [
      ...subSampledRankedGenes,
      { rank: result.rankedGenes.length - 1, name: '', score: 0 },
    ]
  }

  let leadingEdgeIdx =
    gsea.es >= 0
      ? gsea.leadingEdge[gsea.leadingEdge.length - 1].rank
      : gsea.leadingEdge[0].rank

  // now we want the ix that are within the leading edge
  let leadingIdx =
    gsea.es >= 0
      ? where(subSampledRankedGenes, (p) => p.rank <= leadingEdgeIdx)
      : where(subSampledRankedGenes, (p) => p.rank >= leadingEdgeIdx)

  const leadingEs = subSampledRankedGenes.filter((g) =>
    gsea.es >= 0 ? g.rank <= leadingEdgeIdx : g.rank >= leadingEdgeIdx
  )

  let leadingRankedGenes = leadingIdx.map((i) => subSampledRankedGenes[i])

  // fix ends

  leadingRankedGenes =
    gsea.es >= 0
      ? [
          ...leadingRankedGenes,
          { ...leadingRankedGenes[leadingRankedGenes.length - 1]!, score: 0 },
        ]
      : [{ ...leadingRankedGenes[0]!, score: 0 }, ...leadingRankedGenes]

  let leadingEdge1Svg: ReactNode | undefined = undefined

  const xaf = axisDomainToRangeFunc(xax)
  const yaf = axisDomainToRangeFunc(yaxEs)

  if (displayProps.es[gsMode].leadingEdge.show) {
    leadingEdge1Svg = (
      <EsLeadingEdgeSvg
        leadingEdge={leadingEs}
        xaf={xaf}
        yaf={yaf}
        fill={gs.color ?? displayProps.es[gsMode].leadingEdge.value}
        fillOpacity={displayProps.es[gsMode].leadingEdge.opacity}
      />
    )
  }

  let line1Svg: ReactNode | undefined = undefined

  if (displayProps.es[gsMode].curve.show) {
    const points = subSampledRankedGenes.map((p) => ({
      x: xaf(p.rank),
      y: yaf(p.score),
    }))
    //const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ')

    line1Svg = (
      <EsCurveSvg
        es={gsea.esHits}
        points={points}
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

  const rankedGenes: IRankedGene[] = result.rankedGenes
  const gs1: IGeneSet = result.gs1
  const gs2: IGeneSet = result.gs2

  const extGsea: IExtGseaResult = result.extGsea
  const gsea1: IGseaResult = result.gsea1
  const gsea2: IGseaResult = result.gsea2

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
            {rankedGenes.length.toLocaleString()}
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
