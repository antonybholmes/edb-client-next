import { ReactElement, useCallback, useMemo, type ReactNode } from 'react'

import {
  axisDomainToRange,
  axisDomainToRangeFunc,
  axisLength,
} from '@/components/plot/axes/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import type { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'

import { useAxis } from '@/components/plot/axes/axes-store'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgPolyLine } from '@/components/plot/svg-poly-line'
import { SvgPolygon } from '@/components/plot/svg-polygon'
import { SvgRect } from '@/components/plot/svg-rect'
import { SvgText } from '@/components/plot/svg-text'
import { IDim } from '@/interfaces/dim'
import { IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { screenToSvgPoint, svgPointToScreen } from '@/lib/graphics/svg'
import {
  geneSetScores,
  type IGeneSet,
  type IRankedGene,
} from '@/lib/gsea/geneset'
import { abs } from '@/lib/math/abs'
import { end, max } from '@/lib/math/math'
import { where } from '@/lib/math/where'
import { findNearest } from '@/lib/search'
import { CrosshairProvider, useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { useTooltip } from '@/providers/tooltip-provider'
import { useZoom } from '@/providers/zoom-provider'
import { IExtGseaPlotResult, useExtGseaContext } from './ext-gsea-provider'
import { IExtGseaSettings } from './ext-gsea-settings'

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

  const { axis: yaxSnr } = useAxis({
    plotId: result.id,
    groupId: 'snr',
    axisId: 'y',
  })

  const { ref } = useSVG()
  const { showCrosshair, hideCrosshair } = useCrosshair()
  const { showTooltip, hideTooltip } = useTooltip()

  const displayProps: IExtGseaSettings = plot.props

  const rankedGenes: IRankedGene[] = result.rankedGenes
  const gs1: IGeneSet = result.gs1
  const gs2: IGeneSet = result.gs2

  const extGsea: IExtGseaResult = result.extGsea
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

  const { esSvg, genesSvg, rankingSvg, titleSvg } = useMemo(() => {
    // size of plot with padding

    let hitPoints: IPos[] = gsea1.esHits.map((g) => ({ x: g.rank, y: g.score }))

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
      gsea1.es >= 0
        ? gsea1.leadingEdge[gsea1.leadingEdge.length - 1].rank
        : gsea1.leadingEdge[0].rank

    // now we want the ix that are within the leading edge
    let leadingIdx =
      gsea1.es >= 0
        ? where(hitPoints, (p) => p.x <= leadingEdgeIdx)
        : where(hitPoints, (p) => p.x >= leadingEdgeIdx)

    let lead = leadingIdx.map((i) => hitPoints[i])

    // fix ends

    lead =
      gsea1.es >= 0
        ? [...lead, { ...lead[lead.length - 1]!, y: 0 }]
        : [{ ...lead[0]!, y: 0 }, ...lead]

    let leadingEdge1Svg: ReactNode | undefined = undefined

    const xaf = axisDomainToRangeFunc(xax)
    const yaf = axisDomainToRangeFunc(yaxEs)

    if (displayProps.es.gs1.leadingEdge.show) {
      const points = lead.map((p) => ({ x: xaf(p.x), y: yaf(p.y) }))

      // const xs = axisDomainToRange(xax, xlead)
      // const ys = axisDomainToRange(yaxEs, ylead)

      const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ')

      leadingEdge1Svg = (
        <SvgPolyLine
          points={pointsStr}
          fill={gs1.color ?? displayProps.es.gs1.leadingEdge.value}
          fillOpacity={displayProps.es.gs1.leadingEdge.opacity}
          stroke="none"
        />
      )
    }

    let line1Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs1.curve.show) {
      const points = hitPoints.map((p) => ({ x: xaf(p.x), y: yaf(p.y) }))
      const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ')

      line1Svg = (
        <SvgPolyLine
          points={pointsStr}
          stroke={gs1.color ?? displayProps.es.gs1.curve.value}
          s={displayProps.es.gs1.curve}
          fill="none"
        />
      )
    }

    //
    // line 2
    //

    hitPoints = gsea2.esHits.map((g) => ({ x: g.rank, y: g.score }))

    if (hitPoints[0].x !== 0) {
      hitPoints = [{ x: 0, y: 0 }, ...hitPoints]
    }

    if (hitPoints[hitPoints.length - 1].x !== result.rankedGenes.length - 1) {
      hitPoints = [...hitPoints, { x: result.rankedGenes.length - 1, y: 0 }]
    }

    leadingEdgeIdx =
      gsea2.es >= 0
        ? gsea2.leadingEdge[gsea2.leadingEdge.length - 1].rank
        : gsea2.leadingEdge[0].rank

    // now we want the ix that are within the leading edge
    leadingIdx =
      gsea2.es >= 0
        ? where(hitPoints, (p) => p.x <= leadingEdgeIdx)
        : where(hitPoints, (p) => p.x >= leadingEdgeIdx)

    lead = leadingIdx.map((i) => hitPoints[i]!)

    lead =
      gsea2.es >= 0
        ? [...lead, { ...lead[lead.length - 1]!, y: 0 }]
        : [{ ...lead[0]!, y: 0 }, ...lead]

    //x = range(y.length)

    //y1 = ix.map((i) => y[i]!)
    //y1[0] = 0
    //y1[y1.length - 1] = 0

    //xlead = gsea2.leadingEdge.map((g) => x[g.rank]!)
    //ylead = gsea2.leadingEdge.map((g) => y[g.rank]!)

    let leadingEdge2Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs2.leadingEdge.show) {
      const points = lead.map((p) => ({ x: xaf(p.x), y: yaf(p.y) }))

      const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ')

      leadingEdge2Svg = (
        <SvgPolyLine
          points={pointsStr}
          fill={gs2.color ?? displayProps.es.gs2.leadingEdge.value}
          fillOpacity={displayProps.es.gs2.leadingEdge.opacity}
          stroke="none"
        />
      )
    }

    let line2Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs2.curve.show) {
      const points = hitPoints.map((p) => ({ x: xaf(p.x), y: yaf(p.y) }))

      const pointsStr = points.map((p) => `${p.x},${p.y}`).join(' ')

      line2Svg = (
        <SvgPolyLine
          points={pointsStr}
          stroke={gs2.color ?? displayProps.es.gs2.curve.value}
          s={displayProps.es.gs2.curve}
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
        displayProps.plot.gap.y +
        (displayProps.genes.line.show
          ? 2 * (displayProps.genes.height + displayProps.plot.gap.y)
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
              <SvgLine
                y2={displayProps.ranking.axes.y.length}
                s={displayProps.ranking.zeroCross}
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
            y: -displayProps.title.offset,
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
