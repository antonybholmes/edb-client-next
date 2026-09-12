import { ReactElement, useMemo, type ReactNode } from 'react'

import {
  axisDomainToRange,
  axisDomainToRangeFunc,
  axisLength,
  IAxis,
} from '@/components/plot/axes/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import type { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'

import { range } from '@/lib/math/range'
import { zip } from '@/lib/utils'

import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgPolyLine } from '@/components/plot/svg-poly-line'
import { SvgPolygon } from '@/components/plot/svg-polygon'
import { SvgText } from '@/components/plot/svg-text'
import { IDim } from '@/interfaces/dim'
import { COLOR_BLACK } from '@/lib/color/color'
import type { IGeneSet, IRankedGene } from '@/lib/gsea/geneset'
import { abs } from '@/lib/math/abs'
import { end, max } from '@/lib/math/math'
import { where } from '@/lib/math/where'
import { IExtGseaPlotResult, useExtGseaContext } from './ext-gsea-provider'
import { IExtGseaSettings } from './ext-gsea-settings'

function LineSvg({
  result,
  ix,
  x,
  y,
  x1,
  gsea1,
  gs1,
  xax,
}: {
  result: IExtGseaPlotResult
  ix: number[]
  x: number[]
  y: number[]
  x1: number[]
  y1: number[]
  gsea1: IGseaResult
  gs1: IGeneSet
  xax: IAxis
}) {
  const { plot } = useExtGseaContext()

  const { axis: yaxEs } = useAxis({
    plotId: result.id,
    groupId: 'es',
    axisId: 'y',
  })

  const displayProps: IExtGseaSettings = plot.props

  let y1 = ix.map((i) => y[i]!)

  y1[0] = 0
  y1[y1.length - 1] = 0

  let leadingEdgeIdx =
    gsea1.es >= 0
      ? gsea1.leadingEdge[gsea1.leadingEdge.length - 1].rank
      : gsea1.leadingEdge[0].rank

  // now we want the ix that are within the leading edge
  let leadingIdx =
    gsea1.es >= 0
      ? ix.filter((i) => i <= leadingEdgeIdx)
      : ix.filter((i) => i >= leadingEdgeIdx)

  let xlead = leadingIdx.map((i) => x[i]!)
  let ylead = leadingIdx.map((i) => y[i]!)

  // fix ends

  xlead =
    gsea1.es >= 0 ? [...xlead, xlead[xlead.length - 1]!] : [xlead[0]!, ...xlead]
  ylead = gsea1.es >= 0 ? [...ylead, 0] : [0, ...ylead]

  let leadingEdge1Svg: ReactNode | undefined = undefined

  if (displayProps.es.gs1.leadingEdge.show) {
    const xs = axisDomainToRange(xax, xlead)
    const ys = axisDomainToRange(yaxEs, ylead)

    const points = zip(xs, ys)
      .map(([px, py]) => `${px},${py}`)
      .join(', ')

    leadingEdge1Svg = (
      <SvgPolyLine
        points={points}
        fill={gs1.color}
        fillOpacity={displayProps.es.gs1.leadingEdge.opacity}
        stroke="none"
      />
    )
  }

  let line1Svg: ReactNode | undefined = undefined

  if (displayProps.es.gs1.line.show) {
    const xs = axisDomainToRange(xax, x1)
    const ys = axisDomainToRange(yaxEs, y1)

    const points = zip(xs, ys)
      .map(([px, py]) => `${px},${py}`)
      .join(', ')

    line1Svg = (
      <SvgPolyLine
        points={points}
        stroke={gs1.color}
        s={displayProps.es.gs1.line}
        fill="none"
      />
    )
  }
  return (
    <>
      {leadingEdge1Svg}
      {line1Svg}
    </>
  )
}

function ExtGseaSvgPlot({ result }: { result: IExtGseaPlotResult }) {
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

  const { axis: yaxSnr } = useAxis({
    plotId: result.id,
    groupId: 'snr',
    axisId: 'y',
  })

  const displayProps: IExtGseaSettings = plot.props

  const rankedGenes: IRankedGene[] = result.rankedGenes
  const gs1: IGeneSet = result.gs1
  const gs2: IGeneSet = result.gs2

  const extGsea: IExtGseaResult = result.extGsea
  const gsea1: IGseaResult = result.gsea1
  const gsea2: IGseaResult = result.gsea2

  const { esSvg, genesSvg, rankingSvg, titleSvg } = useMemo(() => {
    // size of plot with padding

    let y = gsea1.esAll //self._ranked_scores
    const x = range(y.length)

    // subsample so we don't draw every point
    const ix = range(0, x.length, 100)

    const x1 = ix.map((i) => x[i]!)

    // we must end at the last point so zero the ends and fix
    // fix x
    x1[0] = 0
    x1[x1.length - 1] = x[x.length - 1]!

    let y1 = ix.map((i) => y[i]!)
    y1[0] = 0
    y1[y1.length - 1] = 0

    let leadingEdgeIdx =
      gsea1.es >= 0
        ? gsea1.leadingEdge[gsea1.leadingEdge.length - 1].rank
        : gsea1.leadingEdge[0].rank

    // now we want the ix that are within the leading edge
    let leadingIdx =
      gsea1.es >= 0
        ? where(x1, (xi) => xi <= leadingEdgeIdx)
        : where(x1, (xi) => xi >= leadingEdgeIdx)

    let xlead = leadingIdx.map((i) => x1[i]!)
    let ylead = leadingIdx.map((i) => y1[i]!)

    // fix ends

    xlead =
      gsea1.es >= 0
        ? [...xlead, xlead[xlead.length - 1]!]
        : [xlead[0]!, ...xlead]

    ylead = gsea1.es >= 0 ? [...ylead, 0] : [0, ...ylead]

    let leadingEdge1Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs1.leadingEdge.show) {
      const xs = axisDomainToRange(xax, xlead)
      const ys = axisDomainToRange(yaxEs, ylead)

      const points = zip(xs, ys)
        .map(([px, py]) => `${px},${py}`)
        .join(', ')

      leadingEdge1Svg = (
        <SvgPolyLine
          points={points}
          fill={gs1.color ?? displayProps.es.gs1.leadingEdge.value}
          fillOpacity={displayProps.es.gs1.leadingEdge.opacity}
          stroke="none"
        />
      )
    }

    let line1Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs1.line.show) {
      const xs = axisDomainToRange(xax, x1)
      const ys = axisDomainToRange(yaxEs, y1)

      const points = zip(xs, ys)
        .map(([px, py]) => `${px},${py}`)
        .join(', ')

      line1Svg = (
        <SvgPolyLine
          points={points}
          stroke={gs1.color ?? displayProps.es.gs1.line.value}
          s={displayProps.es.gs1.line}
          fill="none"
        />
      )
    }

    //
    // line 2
    //

    y = gsea2.esAll //self._ranked_scores

    y1 = ix.map((i) => y[i]!)

    // we must end at the last point so zero the ends and fix
    // fix x

    y1[0] = 0
    y1[y1.length - 1] = 0

    leadingEdgeIdx =
      gsea2.es >= 0
        ? gsea2.leadingEdge[gsea2.leadingEdge.length - 1].rank
        : gsea2.leadingEdge[0].rank

    console.log(leadingEdgeIdx, gsea2)

    // now we want the indices that are within the leading edge
    leadingIdx =
      gsea2.es >= 0
        ? where(x1, (xi) => xi <= leadingEdgeIdx)
        : where(x1, (xi) => xi >= leadingEdgeIdx)

    xlead = leadingIdx.map((i) => x1[i]!)
    ylead = leadingIdx.map((i) => y1[i]!)

    xlead =
      gsea2.es >= 0
        ? [...xlead, xlead[xlead.length - 1]!]
        : [xlead[0]!, ...xlead]
    ylead = gsea2.es >= 0 ? [...ylead, 0] : [0, ...ylead]

    //x = range(y.length)

    //y1 = ix.map((i) => y[i]!)
    //y1[0] = 0
    //y1[y1.length - 1] = 0

    //xlead = gsea2.leadingEdge.map((g) => x[g.rank]!)
    //ylead = gsea2.leadingEdge.map((g) => y[g.rank]!)

    // fix ends

    xlead = [xlead[0]!, ...xlead, xlead[xlead.length - 1]!]
    ylead = [0, ...ylead, 0]

    console.log(xlead)

    let leadingEdge2Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs2.leadingEdge.show) {
      const xs = axisDomainToRange(xax, xlead)
      const ys = axisDomainToRange(yaxEs, ylead)

      const points = zip(xs, ys)
        .map(([px, py]) => `${px},${py}`)
        .join(', ')

      leadingEdge2Svg = (
        <SvgPolyLine
          points={points}
          fill={gs2.color ?? displayProps.es.gs2.leadingEdge.value}
          fillOpacity={displayProps.es.gs2.leadingEdge.opacity}
          stroke="none"
        />
      )
    }

    let line2Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs2.line.show) {
      const xs = axisDomainToRange(xax, x1)
      const ys = axisDomainToRange(yaxEs, y1)

      const points = zip(xs, ys)
        .map(([px, py]) => `${px},${py}`)
        .join(', ')

      line2Svg = (
        <SvgPolyLine
          points={points}
          stroke={gs2.color ?? displayProps.es.gs2.line.value}
          s={displayProps.es.gs2.line}
        />
      )
    }

    const esSvg = (
      <SvgG
        pos={{
          x: 0,
          y: 0,
        }}
      >
        {leadingEdge1Svg && leadingEdge1Svg}
        {line1Svg && line1Svg}

        {leadingEdge2Svg && leadingEdge2Svg}
        {line2Svg && line2Svg}

        <AxisLeftSvg ax={yaxEs} />
        <SvgG
          pos={{
            x: 0,
            y: axisDomainToRange(yaxEs, [0])[0],
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

    let genesSvg: ReactNode | undefined = undefined

    if (displayProps.genes.line.show) {
      // scale colors to score, for generic ext gsea
      // score is always 1 so no effect, for viper
      // we can scale by strength of interaction with
      // target
      let maxScore = max(
        abs([
          ...gs1.genes.map((g) => g.score),
          ...gs2.genes.map((g) => g.score),
        ])
      )

      let hitIdx = where(gsea1.hits, (x) => x > 0)

      let xs = axisDomainToRange(xax, hitIdx)

      const extGseaRes1Svg = (
        <SvgG>
          <SvgG>
            {hitIdx.map((hit, hiti) => {
              const x = xs[hiti]

              const score = Math.abs(gs1.genes[hiti].score) / maxScore
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
                  stroke={gs1.color ?? displayProps.es.gs1.line.value}
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
                    ? (gs1.color ?? displayProps.es.gs1.line.value)
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

      hitIdx = where(gsea2.hits, (x) => x > 0)
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
              const score = Math.abs(gs2.genes[hiti].score) / maxScore
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
                  stroke={gs2.color ?? displayProps.es.gs2.line.value}
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
                    ? (gs2.color ?? displayProps.es.gs2.line.value)
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
          {extGseaRes1Svg}
          {extGsea2Svg}
        </SvgG>
      )
    }

    // ranking
    let rankingSvg: ReactNode | null = null

    if (displayProps.ranking.show) {
      const xaf = axisDomainToRangeFunc(xax)
      const yaf = axisDomainToRangeFunc(yaxSnr)
      let displayPoints = rankedGenes.map((e, ei) => [xaf(ei), yaf(e.score)])

      displayPoints = [[xaf(0), yaf(0)], ...displayPoints]

      displayPoints = [...displayPoints, [xaf(rankedGenes.length - 1), yaf(0)]]

      // crossing point

      const crossIndex = end(where(rankedGenes, (gene) => gene.score > 0)) + 1

      const crossingX = xaf(crossIndex)

      const y =
        displayProps.es.axes.y.length +
        displayProps.plot!.gap.y +
        (displayProps.genes.line.show
          ? 2 * (displayProps.genes.height + displayProps.plot!.gap.y)
          : 0)

      rankingSvg = (
        <SvgG
          pos={{
            x: 0,
            y: y,
          }}
        >
          <SvgPolygon
            points={displayPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
            stroke="none"
            fp={displayProps.ranking.fill}
          />
          {displayProps.ranking.zeroCross.show && (
            <SvgG
              pos={{
                x: crossingX,
                y: 0,
              }}
            >
              <line
                y2={displayProps.ranking.axes.y.length}
                stroke={COLOR_BLACK}
                strokeWidth="2"
                strokeDasharray="8"
              />
              <SvgG
                pos={{
                  x: 0,
                  y:
                    displayProps.ranking.axes.y.length +
                    displayProps.plot!.gap.y,
                }}
              >
                <SvgText
                  font={displayProps.axes.x.font}
                  textAnchor="middle"
                  //fontWeight="bold"
                >
                  Zero cross at {crossIndex.toLocaleString()}
                </SvgText>
              </SvgG>
            </SvgG>
          )}
          <AxisLeftSvg ax={yaxSnr} />
        </SvgG>
      )
    }

    let titleSvg: ReactNode = null

    if (displayProps.title.show) {
      titleSvg = (
        <SvgG
          pos={{
            x: displayProps.axes.x.length / 2,
            y: displayProps.title.offset,
          }}
        >
          <SvgText
            font={displayProps.title}
            textAnchor="middle"
            //fontWeight="bold"
          >
            {result.name}
          </SvgText>
        </SvgG>
      )
    }

    return { esSvg, genesSvg, rankingSvg, titleSvg }
  }, [xax, yaxEs, yaxSnr, displayProps])

  return (
    <>
      {titleSvg && titleSvg}

      {esSvg}

      {genesSvg && genesSvg}

      {rankingSvg && rankingSvg}
    </>
  )
}

export function ExtGseaSvg() {
  const { plot } = useExtGseaContext()

  const displayProps: IExtGseaSettings = plot.props

  const innerPlotSize: IDim = useMemo(
    () => ({
      w: displayProps.axes.x.length,
      h:
        displayProps.es.axes.y.length +
        (displayProps.genes.line.show
          ? displayProps.plot!.gap.y + displayProps.genes.height
          : 0) +
        (displayProps.ranking.show
          ? displayProps.plot!.gap.y + displayProps.ranking.axes.y.length
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
    elems.push(
      <SvgG id={`ext-gsea-${result.id}`} key={result.id} pos={{ x, y }}>
        <ExtGseaSvgPlot result={result} />
      </SvgG>
    )

    x += plotSize.w

    if (ri % displayProps.page.columns === displayProps.page.columns - 1) {
      x = 0
      y += plotSize.h
    }
  }

  return (
    <SvgBase
      width={pageSize.w}
      height={pageSize.h}
      scale={displayProps.page.scale}
    >
      <SvgMargin margin={displayProps.plot!.margin}>{elems}</SvgMargin>
    </SvgBase>
  )
}
