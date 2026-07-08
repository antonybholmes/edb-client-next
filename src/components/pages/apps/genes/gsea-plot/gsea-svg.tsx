import { type ReactNode } from 'react'

import { Axis, YAxis } from '@/components/plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/svg-axis'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgPolyLine } from '@/components/plot/svg-poly-line'
import { SvgPolygon } from '@/components/plot/svg-polygon'
import { IPos } from '@/interfaces/pos'
import type { ISVGProps } from '@/interfaces/svg-props'
import { addAlphaToHex, COLOR_BLACK } from '@/lib/color/color'
import { ColorMap } from '@/lib/color/colormap'
import { SvgText } from '../../../../plot/svg-text'
import { IGseaGeneRankScore, IGseaPathway, useGsea } from './gsea-plot-store'
import { useGseaSettings } from './gsea-settings-store'

/**
 * Create SVG for GSEA plot. We create separate SVG for each plot and then combine them in the main SVG.
 * This allows us to have different y axes for ES and ranked genes, and to have different settings for each plot.
 *
 * Notes: Rank is 0-based in the results files.
 * @param param0
 * @returns
 */
export function GseaSvg({ ref }: ISVGProps) {
  const { settings } = useGseaSettings()

  const { rankedGenes, reports, resultsMap, datasetsForUse } = useGsea()

  // size of plot with padding
  const plotSize = [
    settings.axes.x.length,
    settings.es.axes.y.length +
      (settings.genes.show ? settings.plot.gap.y + settings.genes.height : 0) +
      (settings.ranking.show
        ? settings.plot.gap.y + settings.ranking.axes.y.length
        : 0),
  ]

  // keep only pathways for which we have results, i.e. with
  // suitable q values. If q == 1, unlikely GSEA generated it
  // so we cannot plot it
  const pathways = reports.filter(
    (report) =>
      (datasetsForUse[report.id] ?? false) &&
      report.q < 1 &&
      report.name in resultsMap
  )

  const rows = Math.ceil(pathways.flat().length / settings.page.columns)

  const pageSize = [
    (plotSize[0]! + settings.plot.margin.left + settings.plot.margin.right) *
      settings.page.columns,
    (plotSize[1]! + settings.plot.margin.top + settings.plot.margin.bottom) *
      rows,
  ]

  let ploti = 0

  const plots = pathways.map((pathway, pi) => {
    const col = ploti % settings.page.columns
    const row = Math.floor(ploti / settings.page.columns)
    const x =
      col *
      (plotSize[0]! + settings.plot.margin.left + settings.plot.margin.right)
    const y =
      row *
      (plotSize[1]! + settings.plot.margin.top + settings.plot.margin.bottom)

    //console.log('pathway', pathway)

    const results = resultsMap[pathway.name]!

    // ranks are 0-based in the results files
    const maxRank = rankedGenes.length - 1

    const sortedRankedGenes: IGseaGeneRankScore[] = settings.phenotypes.invert
      ? rankedGenes
          .map((e) => ({
            ...e,
            rank: maxRank - e.rank,
            score: -e.score,
          }))
          .sort((a, b) => a.rank - b.rank)
      : rankedGenes

    let xax = new Axis()
      .setDomain([0, maxRank])
      .setLength(settings.axes.x.length)

    xax = xax.setTicks(xax.ticks.slice(1))

    const es = settings.phenotypes.invert
      ? results.es
          .map((e) => ({
            ...e,
            rank: maxRank - e.rank,
            score: -e.score,
          }))
          .sort((a, b) => a.rank - b.rank)
      : results.es

    const ylim: [number, number] = [
      Math.min(...es.map((e) => e.score)),
      Math.max(...es.map((e) => e.score)),
    ]

    let yax = new YAxis().autoDomain(ylim).setLength(settings.es.axes.y.length)

    const points: IPos[] = es.map((e) => ({
      x: xax.domainToRange(e.rank),
      y: yax.domainToRange(e.score),
    }))

    // Some commonly used points on the graph. We calculate them here to
    // avoid repeating the calculations in each plot component
    // and to ensure consistency across plots.
    const x0 = xax.domainToRange(0)
    const x1 = xax.domainToRange(maxRank)

    let esSvg: ReactNode | null = null

    let plotY: number = 0

    if (settings.es.show) {
      esSvg = (
        <EsSvg
          pathway={pathway}
          sortedRankedGenes={sortedRankedGenes}
          es={es}
          maxRank={maxRank}
          x0={x0}
          x1={x1}
          points={points}
          xax={xax}
          yax={yax}
        />
      )

      plotY += settings.es.axes.y.length + 1.5 * settings.plot.gap.y
    }

    const crossIndex =
      sortedRankedGenes.findLastIndex((gene) => gene.score > 0) + 1
    //console.log('crossIndex2', crossIndex2, sortedRankedGenes[crossIndex2!])
    // const crossIndex =
    //   end(where(sortedRankedGenes, (gene) => gene.score > 0)) + 1

    //const crossingX = xax.domainToRange(crossIndex)
    const crossing = { index: crossIndex, x: xax.domainToRange(crossIndex) }

    //end(where(sortedRankedGenes, (gene) => gene.score > 0)) + 1

    let genesSvg: ReactNode | null = null

    if (settings.genes.show) {
      genesSvg = (
        <GenesSvg
          points={points}
          es={es}
          sortedRankedGenes={sortedRankedGenes}

          crossing={crossing}
          xax={xax}
          pos={{ x: 0, y: plotY }}
        />
      )

      plotY += settings.genes.height + settings.plot.gap.y
    }

    // ranking
    let rankingSvg: ReactNode | null = settings.ranking.show ? (
      <RankingSvg
        sortedRankedGenes={sortedRankedGenes}
        x0={x0}
        x1={x1}
        crossing={crossing}
        xax={xax}
        pos={{ x: 0, y: plotY }}
      />
    ) : null

    ploti++

    let titleX = settings.plot.margin.left

    switch (settings.title.font.textAnchor) {
      case 'middle':
        titleX = settings.plot.margin.left + settings.axes.x.length / 2
        break
      case 'end':
        titleX = settings.plot.margin.left + settings.axes.x.length
        break
      default:
        titleX = settings.plot.margin.left
    }

    return (
      <g transform={`translate(${x}, ${y})`} key={ploti} id={`plot-${ploti}`}>
        {settings.title.show && (
          <SvgText
            id={`title-${ploti}`}
            font={settings.title}
            x={titleX}
            y={settings.plot.margin.top - settings.title.offset}
          >
            {pathway.name}
          </SvgText>
        )}

        <SvgMargin margin={settings.plot.margin}>
          {esSvg}

          {genesSvg && genesSvg}

          {rankingSvg && rankingSvg}
        </SvgMargin>
      </g>
    )
  })

  const svg = (
    <SvgBase
      ref={ref}
      scale={settings.page.scale}
      width={pageSize[0]!}
      height={pageSize[1]!}
      //shapeRendering={SVG_CRISP_EDGES}
      //className="absolute"
    >
      {plots}
    </SvgBase>
  )

  return (
    <>
      {svg}

      {/* {toolTipInfo && (
          <>
            <div
              ref={tooltipRef}
              className="pointer-events-none absolute z-50 rounded-theme bg-black/60 p-3 text-xs text-white opacity-100"
              style={{
                left: toolTipInfo.pos.x + TOOLTIP_OFFSET,
                top: toolTipInfo.pos.y + TOOLTIP_OFFSET,
              }}
            >
              <p className="font-semibold">
                {`${sampleMap.get(toolTipInfo.mutation.sample)!.name} (${sampleMap.get(toolTipInfo.mutation.sample)!.coo}, ${sampleMap.get(toolTipInfo.mutation.sample)!.lymphgen})`}
              </p>
              <p>Type: {toolTipInfo.mutation.type.split(":")[1]}</p>
              <p>
                {`Loc: ${toolTipInfo.mutation.chr}:${toolTipInfo.mutation.start.toLocaleString()}-${toolTipInfo.mutation.end.toLocaleString()}`}
              </p>
              <p>
                {`ref: ${toolTipInfo.mutation.ref}, tumor: ${toolTipInfo.mutation.tum.replace("^", "")}`}
              </p>
            </div>

            <span
              ref={highlightRef}
              className="pointer-events-none absolute z-40 border-black"
              style={{
                top: `${toolTipInfo.pos.y - 1}px`,
                left: `${toolTipInfo.pos.x - 1}px`,
                width: `${BASE_W + 1}px`,
                height: `${BASE_H + 1}px`,
                borderWidth: `1px`,
              }}
            />
          </>
        )} */}
    </>
  )
}

function EsSvg({
  pathway,
  es,
  sortedRankedGenes,
  maxRank,
  points,
  x0,
  x1,
  xax,
  yax,
}: {
  pathway: IGseaPathway
  es: IGseaGeneRankScore[]
  sortedRankedGenes: IGseaGeneRankScore[]
  maxRank: number
  points: IPos[]
  x0: number
  x1: number
  xax: Axis
  yax: YAxis
}) {
  const { settings } = useGseaSettings()
  const { phenotypes } = useGsea()
  const nes = settings.phenotypes.invert ? -pathway.nes : pathway.nes

  const sortedPhenotypes = settings.phenotypes.invert
    ? phenotypes.slice().reverse()
    : phenotypes

  const phenIndexMap = new Map<string, number>(
    sortedPhenotypes.map((phen, i) => [phen, i])
  )

  const phenotypei = phenIndexMap.get(pathway.phen)!
  const rankMid = maxRank / 2

  const y0 = yax.domainToRange(0)

  //
  // Fix starts and end of ES curve. GSEA does not necessarily
  // start at 0 or end at 0 because it only changes when it encounters a gene in the pathway.
  // So if the first gene in the ranked list is in the pathway, it will start with a
  // jump and never actually be at 0. Same for the end. We add points at the start and end to
  // ensure the curve starts and ends at 0.
  //
  let displayPoints = points

  // If the first point is not at (x0, y0), add a point at the start
  if (displayPoints[0]!.x !== x0 || displayPoints[0]!.y !== y0) {
    displayPoints = [{ x: x0, y: y0 }, ...displayPoints]
  }

  // If the last point is not at (x1, y0), add a point at the end
  if (
    displayPoints[displayPoints.length - 1]!.x !== x1 ||
    displayPoints[displayPoints.length - 1]!.y !== y0
  ) {
    displayPoints = [
      ...displayPoints,
      {
        x: x1,
        y: y0,
      },
    ]
  }

  return (
    <g>
      <EsLeadingEdgeSvg
        es={es}
        rankMid={rankMid}
        x0={x0}
        x1={x1}
        xax={xax}
        yax={yax}
      />

      <SvgPolyLine
        points={displayPoints.map((p) => `${p.x},${p.y}`).join(' ')}
        s={settings.es.line}
      />

      {settings.axes.show && (
        <AxisLeftSvg
          ax={yax}
          title="ES"
          font={settings.axes.ticks}
          labelFont={settings.axes.labels}
        />
      )}

      {settings.axes.show && (
        <g transform={`translate(0, ${yax.domainToRange(0)})`}>
          <AxisBottomSvg
            ax={xax}
            showTicks={settings.es.axes.x.showTicks}
            font={settings.axes.ticks}
            labelFont={settings.axes.labels}
          />
        </g>
      )}

      <g
        transform={`translate(${settings.axes.x.length + settings.plot.gap.x / 4}, ${yax.domainToRange(0)})`}
      >
        <SvgText dominantBaseline="central" font={settings.axes.ticks}>
          {sortedRankedGenes.length.toLocaleString()}
        </SvgText>
      </g>

      {settings.es.labels.show && (
        <g
          transform={`translate(${phenotypei === 0 ? settings.axes.x.length - 70 : 10}, ${phenotypei === 0 ? 10 : settings.es.axes.y.length - 20})`}
          fontSize="small"
        >
          <SvgText font={settings.es.labels}>NES: {nes.toFixed(2)}</SvgText>

          <g transform={`translate(0, 15)`}>
            <SvgText font={settings.es.labels}>
              FDR: {pathway.q.toFixed(3)}
            </SvgText>
          </g>
        </g>
      )}

      {settings.es.phenotypes.show && (
        <g
          transform={`translate(0, ${settings.es.axes.y.length + settings.plot.gap.y / 2})`}
        >
          <g>
            <SvgText
              fill={
                settings.genes.color.on
                  ? settings.genes.pos.value
                  : settings.es.phenotypes.font.fill.value
              }
              dominantBaseline="hanging"
              font={settings.es.phenotypes}
            >
              {sortedPhenotypes[0]!}
            </SvgText>
          </g>

          <g transform={`translate(${settings.axes.x.length}, 0)`}>
            <SvgText
              fill={
                settings.genes.color.on
                  ? settings.genes.neg.value
                  : settings.es.phenotypes.font.fill.value
              }
              dominantBaseline="hanging"
              font={settings.es.phenotypes}
              textAnchor="end"
              //fontWeight="bold"
            >
              {sortedPhenotypes[1]!}
            </SvgText>
          </g>
        </g>
      )}
    </g>
  )
}

function EsLeadingEdgeSvg({
  es,
  rankMid,
  x0,
  x1,
  xax,
  yax,
}: {
  es: IGseaGeneRankScore[]

  rankMid: number
  x0: number
  x1: number
  xax: Axis
  yax: YAxis
}) {
  const { settings } = useGseaSettings()

  const y0 = yax.domainToRange(0)

  const leadingEdge = es.filter((e) => e.leading)

  const isLeft = leadingEdge[leadingEdge.length - 1]!.rank < rankMid

  let leadingPoints = leadingEdge.map((e) => ({
    x: xax.domainToRange(e.rank),
    y: yax.domainToRange(e.score),
  }))

  // To make the filled area under the leading edge curve,
  // we need to add points at the start and end of the leading edge curve to ensure it is closed.
  // We check if the leading edge is on the left or right half of the plot to determine
  // where to add the points.

  let linePos: IPos = isLeft
    ? leadingPoints[leadingPoints.length - 1]!
    : leadingPoints[0]!

  // check if leading edge is on left or right half to decide how to fix start and end
  if (isLeft) {
    // left
    leadingPoints = [
      { x: x0, y: y0 },
      ...leadingPoints,
      {
        x: linePos!.x,
        y: y0,
      },
    ]
  } else {
    leadingPoints = [
      { x: leadingPoints[0]!.x, y: y0 },
      ...leadingPoints,
      {
        x: linePos!.x,
        y: y0,
      },
    ]
  }

  return (
    <g id="leading-edge">
      {settings.es.leadingEdge.fill.show && (
        <polygon
          id="leading-edge-area"
          points={leadingPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          fill={settings.es.leadingEdge.fill.value}
          stroke="none"
          fillOpacity={settings.es.leadingEdge.fill.opacity}
        />
      )}

      {settings.es.leadingEdge.line.show && (
        <SvgLine
          id="leading-edge-line"
          x1={linePos.x}
          y1={linePos.y}
          x2={linePos.x}
          y2={y0}
          s={settings.es.leadingEdge.line}
        />
      )}
    </g>
  )
}

function GenesSvg({
  points,
  es,
  sortedRankedGenes,

  crossing,
  xax,
  pos,
}: {
  points: { x: number; y: number }[]
  es: IGseaGeneRankScore[]
  sortedRankedGenes: IGseaGeneRankScore[]

  crossing: { index: number; x: number }
  xax: Axis
  pos: IPos
}) {
  const { settings } = useGseaSettings()

  const c1 = settings.genes.pos.value
  const c2 = addAlphaToHex(
    settings.genes.pos.value,
    settings.genes.gradient.alpha
  )
  const c3 = addAlphaToHex(
    settings.genes.neg.value,
    settings.genes.gradient.alpha
  )
  const c4 = settings.genes.neg.value
  const cmap1 = new ColorMap('pos', [c1, c2])
  const cmap2 = new ColorMap('neg', [c3, c4])

  //console.log(sortedRankedGenes)

  // for a given point, use its rank to find the corresponding gene in sortedRankedGenes,
  // then use its score to determine the color of the point. This is because we base
  // color on the ranking of all genes in the exp matrix so we are essentially using
  // the signal to noise ratio to color the points from red (positive) to blue (negative)
  const posPoints = points.filter((_, pi) => {
    return sortedRankedGenes[es[pi]!.rank]!.score >= 0
  })
  const negPoints = points.filter(
    (_, pi) => sortedRankedGenes[es[pi]!.rank]!.score < 0
  )

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {posPoints.map((p, pi) => {
        const pc = p.x / crossing.x

        const color = settings.genes.color.on
          ? settings.genes.gradient.on
            ? cmap1.getHexColor(pc)
            : settings.genes.pos.value
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
          ? settings.genes.gradient.on
            ? cmap2.getHexColor(pc)
            : settings.genes.neg.value
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
    </g>
  )
}

function RankingSvg({
  sortedRankedGenes,

  crossing,
  xax,
  x0,
  x1,
  pos,
}: {
  sortedRankedGenes: IGseaGeneRankScore[]

  crossing: { index: number; x: number }

  xax: Axis
  x0: number
  x1: number
  pos: IPos
}) {
  const { settings } = useGseaSettings()

  const yMin = Math.min(...sortedRankedGenes.map((e) => e.score))
  const yMax = Math.max(...sortedRankedGenes.map((e) => e.score))

  const yax = new YAxis()
    .autoDomain([yMin, yMax])
    //.setDomain([0, plot.dna.seq.length])
    .setLength(settings.ranking.axes.y.length)

  const y0 = yax.domainToRange(0)

  const points = sortedRankedGenes.map((e) => ({
    x: xax.domainToRange(e.rank),
    y: yax.domainToRange(e.score),
  }))

  // fix starts and end
  let displayPoints = points

  displayPoints = [{ x: x0, y: y0 }, ...displayPoints]

  displayPoints = [
    ...displayPoints,
    {
      x: x1,
      y: y0,
    },
  ]

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {settings.ranking.fill.show && (
        <SvgPolygon
          points={displayPoints.map((p) => `${p.x},${p.y}`).join(' ')}
          s={settings.ranking.fill}
        />
      )}

      {settings.ranking.zeroCross.line.show && (
        <g transform={`translate(${crossing.x}, 0)`}>
          <SvgLine
            y2={settings.ranking.axes.y.length}
            s={settings.ranking.zeroCross.line}
          />
          <g
            transform={`translate(0, ${settings.ranking.axes.y.length + settings.plot.gap.y})`}
          >
            <SvgText textAnchor="middle" font={settings.axes.ticks}>
              Zero cross at {crossing.index.toLocaleString()}
            </SvgText>
          </g>
        </g>
      )}
      {settings.axes.show && (
        <AxisLeftSvg
          ax={yax}
          title="SNR"
          labelFont={settings.axes.labels}
          font={settings.axes.ticks}
        />
      )}
    </g>
  )
}
