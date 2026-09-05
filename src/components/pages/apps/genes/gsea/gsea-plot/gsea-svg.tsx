import { type ReactNode } from 'react'

import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/axes/svg-axis'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgPolyLine } from '@/components/plot/svg-poly-line'
import { SvgPolygon } from '@/components/plot/svg-polygon'
import { IPos } from '@/interfaces/pos'
import { addAlphaToHex, COLOR_BLACK } from '@/lib/color/color'
import { ColorMap } from '@/lib/color/colormap'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { useAxes } from '@/components/plot/axes/axes-provider'
import {
  axisDomainToRange,
  axisDomainToRangeFunc,
  createAxis,
  IAxis,
} from '@/components/plot/axes/axis'
import { SvgText } from '@/components/plot/svg-text'
import { useGseaPlot } from './gsea-plot-provider'
import { IGseaGeneRankScore, IGseaGeneSet, useGsea } from './gsea-plot-store'
import { useGseaSettings } from './gsea-settings-store'

/**
 * Create SVG for GSEA plot. We create separate SVG for each plot and then combine them in the main SVG.
 * This allows us to have different y axes for ES and ranked genes, and to have different settings for each plot.
 *
 * Notes: Rank is 0-based in the results files.
 * @param param0
 * @returns
 */
export function GseaSvg() {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()

  const { rankedGenes, resultsMap } = useGsea()
  const { pathways } = useGseaPlot()
  const { plots } = useAxes()

  if (!plots || Object.keys(plots).length === 0) {
    return null
  }

  // size of plot with padding
  const plotSize = [
    settings.axes.x.length,
    settings.es.axes.y.length +
      (settings.genes.show ? settings.plot.gap.y + settings.genes.height : 0) +
      (settings.ranking.show
        ? settings.plot.gap.y + settings.ranking.axes.y.length
        : 0),
  ]

  const rows = Math.ceil(pathways.flat().length / settings.page.columns)

  const pageSize = [
    (plotSize[0]! + settings.plot.margin.left + settings.plot.margin.right) *
      settings.page.columns,
    (plotSize[1]! + settings.plot.margin.top + settings.plot.margin.bottom) *
      rows,
  ]

  let ploti = 0

  const svgPlots = pathways.map((pathway, pi) => {
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

    let xax = plots[pathway.id].groups['es'].axes['es-x']

    //xax = xax.setTicks(xax.ticks.slice(1))

    const es = settings.phenotypes.invert
      ? results.es
          .map((e) => ({
            ...e,
            rank: maxRank - e.rank,
            score: -e.score,
          }))
          .sort((a, b) => a.rank - b.rank)
      : results.es

    // const ylim: [number, number] = [
    //   Math.min(...es.map((e) => e.score)),
    //   Math.max(...es.map((e) => e.score)),
    // ]

    // let yax = setAxisTickParams(
    //   setAxisLength(
    //     autoAxisDomain(setAxisDirection(createAxis(), 'y'), ylim),
    //     settings.es.axes.y.length
    //   ),
    //   { which: 'minor', show: false }
    // )

    let yax = plots[pathway.id].groups['es'].axes['es-y']

    const xaf = axisDomainToRangeFunc(xax)
    const yaf = axisDomainToRangeFunc(yax)
    const points: IPos[] = es.map((e) => ({
      x: xaf(e.rank),
      y: yaf(e.score),
    }))

    // Some commonly used points on the graph. We calculate them here to
    // avoid repeating the calculations in each plot component
    // and to ensure consistency across plots.

    const [x0, x1] = axisDomainToRange(xax, [0, maxRank])

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

    //const crossingX = xax.domainToRange(crossIndex)
    const crossing = {
      index: crossIndex,
      x: axisDomainToRange(xax, [crossIndex])[0],
    }

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

    // let titleX = settings.plot.margin.left

    // switch (edbSettings.plots.axes.x.title.textAnchor) {
    //   case 'middle':
    //     titleX = settings.plot.margin.left + settings.axes.x.length / 2
    //     break
    //   case 'end':
    //     titleX = settings.plot.margin.left + settings.axes.x.length
    //     break
    //   default:
    //     titleX = settings.plot.margin.left
    // }

    const titleX = settings.plot.margin.left + settings.axes.x.length / 2

    return (
      <g transform={`translate(${x}, ${y})`} key={ploti} id={`plot-${ploti}`}>
        {edbSettings.plots.axes.x.style.title.show && (
          <SvgText
            id={`title-${ploti}`}
            font={edbSettings.plots.axes.x.style.title}
            textAnchor="middle"
            x={titleX}
            y={
              settings.plot.margin.top -
              edbSettings.plots.axes.x.style.title.offset * 0.5
            }
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

  return (
    <SvgBase
      scale={settings.page.scale}
      width={pageSize[0]!}
      height={pageSize[1]!}
      //shapeRendering={SVG_CRISP_EDGES}
      //className="absolute"
    >
      {svgPlots}
    </SvgBase>
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
  pathway: IGseaGeneSet
  es: IGseaGeneRankScore[]
  sortedRankedGenes: IGseaGeneRankScore[]
  maxRank: number
  points: IPos[]
  x0: number
  x1: number
  xax: IAxis
  yax: IAxis
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()
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

  const y0 = axisDomainToRange(yax, [0])[0]

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
        y0={y0}
        xax={xax}
        yax={yax}
      />

      <SvgPolyLine
        points={displayPoints.map((p) => `${p.x},${p.y}`).join(' ')}
        s={settings.es.line}
      />

      {edbSettings.plots.axes.y.style.show && (
        <AxisLeftSvg ax={yax} title="ES" />
      )}

      {edbSettings.plots.axes.x.style.show && (
        <g transform={`translate(0, ${y0})`}>
          <AxisBottomSvg ax={xax} showTicks={settings.es.axes.x.showTicks} />
        </g>
      )}

      <g
        transform={`translate(${settings.axes.x.length + settings.plot.gap.x / 4}, ${y0})`}
      >
        <SvgText
          dominantBaseline="central"
          font={edbSettings.plots.axes.x.ticks.major.style.labels}
        >
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
  y0,
  xax,
  yax,
}: {
  es: IGseaGeneRankScore[]

  rankMid: number
  x0: number
  x1: number
  y0: number
  xax: IAxis
  yax: IAxis
}) {
  const { settings } = useGseaSettings()

  const leadingEdge = es.filter((e) => e.leading)

  const isLeft = leadingEdge[leadingEdge.length - 1]!.rank < rankMid

  let leadingPoints = leadingEdge.map((e) => ({
    x: axisDomainToRange(xax, [e.rank])[0],
    y: axisDomainToRange(yax, [e.score])[0],
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
        x: x1,
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
  xax: IAxis
  pos: IPos
}) {
  const { settings } = useGseaSettings()

  const c1 = settings.genes.pos.value
  const c2 = addAlphaToHex(
    settings.genes.pos.value,
    settings.genes.gradient.opacity
  )
  const c3 = addAlphaToHex(
    settings.genes.neg.value,
    settings.genes.gradient.opacity
  )
  const c4 = settings.genes.neg.value
  const cmap1 = new ColorMap('pos', 'pos', [c1, c2])
  const cmap2 = new ColorMap('neg', 'neg', [c3, c4])

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
          ? cmap1.getHexColor(pc)
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
          ? cmap2.getHexColor(pc)
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

  xax: IAxis
  x0: number
  x1: number
  pos: IPos
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()

  const yMin = Math.min(...sortedRankedGenes.map((e) => e.score))
  const yMax = Math.max(...sortedRankedGenes.map((e) => e.score))

  // const yax = new YAxis()
  //   .autoDomain([yMin, yMax])
  //   //.setDomain([0, plot.dna.seq.length])
  //   .setLength(settings.ranking.axes.y.length)
  //   .setTickParams({ which: 'minor', show: false })

  let yax = createAxis({
    direction: 'y',
    title: 'SNR',
    autoDomain: [yMin, yMax],
    length: settings.ranking.axes.y.length,
    tickParams: { which: 'minor', show: false },
  })

  const y0 = axisDomainToRange(yax, [0])[0]
  const xaf = axisDomainToRangeFunc(xax)
  const yaf = axisDomainToRangeFunc(yax)
  const points = sortedRankedGenes.map((e) => ({
    x: xaf(e.rank),
    y: yaf(e.score),
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
          fp={settings.ranking.fill}
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
            <SvgText
              textAnchor="middle"
              font={edbSettings.plots.axes.x.ticks.major.style.labels}
            >
              Zero cross at {crossing.index.toLocaleString()}
            </SvgText>
          </g>
        </g>
      )}
      <AxisLeftSvg ax={yax} />
    </g>
  )
}
