import { useMemo, type ReactNode } from 'react'

import {
  axisDomainToRange,
  axisDomainToRangeFunc,
  axisLength,
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
import { COLOR_BLACK } from '@/lib/color/color'
import type { IGeneSet, IRankedGenes } from '@/lib/gsea/geneset'
import { end, type ILim } from '@/lib/math/math'
import { where } from '@/lib/math/where'
import { useExtGseaContext } from './ext-gsea-provider'
import { IExtGseaDisplayOptions } from './ext-gsea-store'

export function ExtGseaSvg() {
  const { plot } = useExtGseaContext()

  const { axis: xax } = useAxis({
    plotId: plot.id,
    groupId: 'ext-gsea',
    axisId: 'x',
  })
  const { axis: yaxEs } = useAxis({
    plotId: plot.id,
    groupId: 'es',
    axisId: 'y',
  })
  const { axis: yaxSnr } = useAxis({
    plotId: plot.id,
    groupId: 'snr',
    axisId: 'y',
  })

  const displayProps: IExtGseaDisplayOptions = plot.props

  const rankedGenes: IRankedGenes = plot.rankedGenes
  const gs1: IGeneSet = plot.gs1
  const gs2: IGeneSet = plot.gs2

  const extGseaRes: IExtGseaResult = plot.extGseaRes
  const gseaRes1: IGseaResult = plot.gseaRes1
  const gseaRes2: IGseaResult = plot.gseaRes2

  const { esSvg, genesSvg, rankingSvg, pageSize } = useMemo(() => {
    // size of plot with padding
    const plotSize: ILim = [
      displayProps.axes.x.length +
        displayProps.plot!.margin.left +
        displayProps.plot!.margin.right,
      displayProps.es.axes.y.length +
        (displayProps.genes.line.show
          ? displayProps.plot!.gap.y + displayProps.genes.height
          : 0) +
        (displayProps.ranking.show
          ? displayProps.plot!.gap.y + displayProps.ranking.axes.y.length
          : 0) +
        displayProps.plot!.margin.top +
        displayProps.plot!.margin.bottom,
    ]

    const rows = 1

    const pageSize: ILim = [
      plotSize[0]! * displayProps.page.columns,
      plotSize[1]! * rows,
    ]

    let y = gseaRes1.esAll //self._ranked_scores
    const x = range(y.length)

    // subsample so we don't draw every point
    const ix = range(0, x.length, 100)

    const x1 = ix.map((i) => x[i]!)
    let y1 = ix.map((i) => y[i]!)
    y1[0] = 0
    y1[y1.length - 1] = 0

    let xlead = gseaRes1.leadingEdge.map((g) => x[g.rank]!)
    let ylead = gseaRes1.leadingEdge.map((g) => y[g.rank]!)

    // fix ends

    xlead = [xlead[0]!, ...xlead]
    ylead = [0, ...ylead]

    xlead = [...xlead, xlead[xlead.length - 1]!]
    ylead = [...ylead, 0]

    let leadingEdge1Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs1.leadingEdge.fill.show) {
      const xs = axisDomainToRange(xax, xlead)
      const ys = axisDomainToRange(yaxEs, ylead)

      const points = zip(xs, ys)
        .map(([px, py]) => `${px},${py}`)
        .join(', ')

      leadingEdge1Svg = (
        <SvgPolyLine
          points={points}
          fill={gs1.color}
          fillOpacity={displayProps.es.gs1.leadingEdge.fill.opacity}
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

    //
    // line 2
    //

    y = gseaRes2.esAll //self._ranked_scores
    //x = range(y.length)

    y1 = ix.map((i) => y[i]!)
    y1[0] = 0
    y1[y1.length - 1] = 0

    xlead = gseaRes2.leadingEdge.map((g) => x[g.rank]!)
    ylead = gseaRes2.leadingEdge.map((g) => y[g.rank]!)

    // fix ends

    xlead = [xlead[0]!, ...xlead]
    ylead = [0, ...ylead]

    xlead = [...xlead, xlead[xlead.length - 1]!]
    ylead = [...ylead, 0]

    let leadingEdge2Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs2.leadingEdge.fill.show) {
      const xs = axisDomainToRange(xax, xlead)
      const ys = axisDomainToRange(yaxEs, ylead)

      const points = zip(xs, ys)
        .map(([px, py]) => `${px},${py}`)
        .join(', ')

      leadingEdge2Svg = (
        <SvgPolyLine
          points={points}
          fill={gs2.color}
          fillOpacity={displayProps.es.gs2.leadingEdge.fill.opacity}
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
          stroke={gs2.color}
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
              {rankedGenes.genes.length.toLocaleString()}
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
              {rankedGenes.group1.name}
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
              {rankedGenes.group2.name}
            </SvgText>
          </SvgG>
        </SvgG>

        <SvgG
          pos={{
            x: displayProps.axes.x.length,
            y: 0,
          }}
        >
          <SvgText fill={COLOR_BLACK} font={displayProps.axes.x.font}>
            NES: {extGseaRes.nes.toFixed(2)}
          </SvgText>

          <SvgG
            pos={{
              x: 0,
              y: 20,
            }}
          >
            <SvgText fill={COLOR_BLACK} font={displayProps.axes.x.font}>
              P-value: {extGseaRes.pvalue.toFixed(3)}
            </SvgText>
          </SvgG>
        </SvgG>
      </SvgG>
    )

    let genesSvg: ReactNode | undefined = undefined

    if (displayProps.genes.line.show) {
      let points = where(gseaRes1.hits, (x) => x > 0)

      let xs = axisDomainToRange(xax, points)

      const gengseaRes1Svg = (
        <SvgG>
          <SvgG>
            {points.map((p, pointi) => {
              const x = xs[pointi]

              return (
                <SvgLine
                  key={pointi}
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={displayProps.genes.height}
                  s={displayProps.genes.line}
                  stroke={gs1.color}
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
                  displayProps.genes.labels.isColored ? gs1.color : COLOR_BLACK
                }
                font={displayProps.genes.labels.font}
              >
                {gs1.name}
              </SvgText>
            </SvgG>
          )}
        </SvgG>
      )

      points = where(gseaRes2.hits, (x) => x > 0)
      xs = axisDomainToRange(xax, points)

      const gengseaRes2Svg = (
        <SvgG
          pos={{
            x: 0,
            y: displayProps.genes.height + 0.25 * displayProps.plot!.gap.y,
          }}
        >
          <SvgG>
            {points.map((p, pointi) => {
              const x = xs[pointi]

              return (
                <SvgLine
                  key={pointi}
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={displayProps.genes.height}
                  s={displayProps.genes.line}
                  stroke={gs2.color}
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
                  displayProps.genes.labels.isColored ? gs2.color : COLOR_BLACK
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
          {gengseaRes1Svg}
          {gengseaRes2Svg}
        </SvgG>
      )
    }

    // ranking
    let rankingSvg: ReactNode | null = null

    if (displayProps.ranking.show) {
      const xaf = axisDomainToRangeFunc(xax)
      const yaf = axisDomainToRangeFunc(yaxSnr)
      let displayPoints = rankedGenes.genes.map((e, ei) => [
        xaf(ei),
        yaf(e.score),
      ])

      displayPoints = [[xaf(0), yaf(0)], ...displayPoints]

      displayPoints = [
        ...displayPoints,
        [xaf(rankedGenes.genes.length - 1), yaf(0)],
      ]

      // crossing point

      const crossIndex =
        end(where(rankedGenes.genes, (gene) => gene.score > 0)) + 1

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

    return { esSvg, genesSvg, rankingSvg, pageSize }
  }, [xax, yaxEs, yaxSnr, displayProps])

  return (
    <SvgBase
      width={pageSize[0]!}
      height={pageSize[1]!}
      scale={displayProps.page.scale}
    >
      <SvgMargin margin={displayProps.plot!.margin}>
        {esSvg}

        {genesSvg && genesSvg}

        {rankingSvg && rankingSvg}
      </SvgMargin>
    </SvgBase>
  )
}
