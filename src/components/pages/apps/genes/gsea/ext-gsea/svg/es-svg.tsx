import { useMemo, type ReactNode } from 'react'

import { axisDomainToRangeFunc } from '@/components/plot/axes/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import type { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'

import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgG } from '@/components/plot/svg-g'
import { SvgPolyLine } from '@/components/plot/svg-poly-line'
import { SvgText } from '@/components/plot/svg-text'
import { IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { type IGeneSet, type IRankedGene } from '@/lib/gsea/geneset'
import { where } from '@/lib/math/where'
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

  const displayProps: IExtGseaSettings = plot.props

  const curveSvg = useMemo(() => {
    // size of plot with padding

    let hitPoints: IPos[] = gsea.esHits.map((g) => ({ x: g.rank, y: g.score }))

    //range(y.length)

    // subsample so we don't draw every point
    //const ix = range(0, x.length, displayProps.es.step)
    //
    //const x1 = ix.map((i) => x[i]!)

    // we must end at the last point so zero the ends and fix
    // fix x

    if (hitPoints[0].x !== 0) {
      hitPoints = [{ x: 0, y: 0 }, ...hitPoints]
    }

    if (hitPoints[hitPoints.length - 1].x !== result.rankedGenes.length - 1) {
      hitPoints = [...hitPoints, { x: result.rankedGenes.length - 1, y: 0 }]
    }

    //let y1 = ix.map((i) => y[i]!)
    //y1[0] = 0
    //y1[y1.length - 1] = 0

    let leadingEdgeIdx =
      gsea.es >= 0
        ? gsea.leadingEdge[gsea.leadingEdge.length - 1].rank
        : gsea.leadingEdge[0].rank

    // now we want the ix that are within the leading edge
    let leadingIdx =
      gsea.es >= 0
        ? where(hitPoints, (p) => p.x <= leadingEdgeIdx)
        : where(hitPoints, (p) => p.x >= leadingEdgeIdx)

    let lead = leadingIdx.map((i) => hitPoints[i])

    // fix ends

    lead =
      gsea.es >= 0
        ? [...lead, { ...lead[lead.length - 1]!, y: 0 }]
        : [{ ...lead[0]!, y: 0 }, ...lead]

    let leadingEdge1Svg: ReactNode | undefined = undefined

    const xaf = axisDomainToRangeFunc(xax)
    const yaf = axisDomainToRangeFunc(yaxEs)

    if (displayProps.es[gsMode].leadingEdge.show) {
      const points = lead.map((p) => ({ x: xaf(p.x), y: yaf(p.y) }))

      // const xs = axisDomainToRange(xax, xlead)
      // const ys = axisDomainToRange(yaxEs, ylead)

      const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ')

      leadingEdge1Svg = (
        <SvgPolyLine
          points={pointsStr}
          fill={gs.color ?? displayProps.es[gsMode].leadingEdge.value}
          fillOpacity={displayProps.es[gsMode].leadingEdge.opacity}
          stroke="none"
        />
      )
    }

    let line1Svg: ReactNode | undefined = undefined

    if (displayProps.es[gsMode].curve.show) {
      const points = hitPoints.map((p) => ({ x: xaf(p.x), y: yaf(p.y) }))
      const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ')

      line1Svg = (
        <SvgPolyLine
          points={pointsStr}
          stroke={gs.color ?? displayProps.es[gsMode].curve.value}
          s={displayProps.es[gsMode].curve}
          fill="none"
        />
      )
    }

    return (
      <>
        {leadingEdge1Svg && leadingEdge1Svg}
        {line1Svg && line1Svg}
      </>
    )
  }, [xax, yaxEs, displayProps, result, gs, gsea, gsMode])

  return curveSvg
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

  const esSvg = useMemo(() => {
    const rankedGenes: IRankedGene[] = result.rankedGenes
    const gs1: IGeneSet = result.gs1
    const gs2: IGeneSet = result.gs2

    const extGsea: IExtGseaResult = result.extGsea
    const gsea1: IGseaResult = result.gsea1
    const gsea2: IGseaResult = result.gsea2

    const yaf = axisDomainToRangeFunc(yaxEs)

    const esSvg = (
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
          <AxisBottomSvg
            ax={xax}
            showTicks={displayProps.es.axes.x.showTicks}
          />
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
            <SvgText
              fill={COLOR_BLACK}
              font={displayProps.axes.x.font}
              //fontSize="x-small"
              //textAnchor="middle"
              //fontWeight="bold"
            >
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
              //fontSize="x-small"
              textAnchor="end"
              //fontWeight="bold"
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

    return esSvg
  }, [xax, yaxEs, result, displayProps])

  return esSvg
}
