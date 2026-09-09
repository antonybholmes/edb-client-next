import { memo } from 'react'

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
import { useAxis } from '@/components/plot/axes/axes-store'
import {
  axisDomainToRange,
  axisDomainToRangeFunc,
  IAxis,
} from '@/components/plot/axes/axis'
import { SvgText } from '@/components/plot/svg-text'
import { useSVG } from '@/providers/svg-provider'
import { useGseaPlot } from './gsea-plot-provider'
import { useGseaSettings } from './gsea-settings-store'
import { IGseaGeneRankScore, IGseaGeneSet, useGseaData } from './gsea-store'

const GseaPlot = memo(function GseaPlot({
  pathway,
  index,
}: {
  pathway: IGseaGeneSet
  index: number
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()
  const { phenotypes, rankedGenes, result } = useGseaData(pathway.name)

  const { axis: xax } = useAxis({
    plotId: pathway.id,
    groupId: 'es',
    axisId: 'x',
  })
  const { axis: yax } = useAxis({
    plotId: pathway.id,
    groupId: 'es',
    axisId: 'y',
  })

  if (!xax || !yax || !result) {
    return null
  }

  const plotSize = [
    settings.axes.x.length,
    settings.es.axes.y.length +
      (settings.genes.show ? settings.plot.gap.y + settings.genes.height : 0) +
      (settings.ranking.show
        ? settings.plot.gap.y + settings.ranking.axes.y.length
        : 0),
  ]

  const maxRank = rankedGenes.length - 1
  const sortedRankedGenes: IGseaGeneRankScore[] = settings.phenotypes.invert
    ? rankedGenes
        .map((e) => ({ ...e, rank: maxRank - e.rank, score: -e.score }))
        .sort((a, b) => a.rank - b.rank)
    : rankedGenes
  const es = settings.phenotypes.invert
    ? result.es
        .map((e) => ({ ...e, rank: maxRank - e.rank, score: -e.score }))
        .sort((a, b) => a.rank - b.rank)
    : result.es
  const xaf = axisDomainToRangeFunc(xax)
  const yaf = axisDomainToRangeFunc(yax)
  const points: IPos[] = es.map((e) => ({
    x: xaf(e.rank),
    y: yaf(e.score),
  }))
  const [x0, x1] = axisDomainToRange(xax, [0, maxRank])
  let plotY = 0
  const esSvg = settings.es.show ? (
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
      phenotypes={phenotypes}
    />
  ) : null

  if (settings.es.show) {
    plotY += settings.es.axes.y.length + 1.5 * settings.plot.gap.y
  }

  const crossIndex =
    sortedRankedGenes.findLastIndex((gene) => gene.score > 0) + 1
  const crossing = {
    index: crossIndex,
    x: axisDomainToRange(xax, [crossIndex])[0],
  }
  const genesSvg = settings.genes.show ? (
    <GenesSvg
      xax={xax}
      points={points}
      es={es}
      sortedRankedGenes={sortedRankedGenes}
      crossing={crossing}
      pos={{ x: 0, y: plotY }}
    />
  ) : null

  if (settings.genes.show) {
    plotY += settings.genes.height + settings.plot.gap.y
  }

  const rankingSvg = settings.ranking.show ? (
    <RankingSvg
      xax={xax}
      pathway={pathway}
      sortedRankedGenes={sortedRankedGenes}
      x0={x0}
      x1={x1}
      crossing={crossing}
      pos={{ x: 0, y: plotY }}
    />
  ) : null
  const col = index % settings.page.columns
  const row = Math.floor(index / settings.page.columns)
  const x =
    col *
    (plotSize[0]! + settings.plot.margin.left + settings.plot.margin.right)
  const y =
    row *
    (plotSize[1]! + settings.plot.margin.top + settings.plot.margin.bottom)
  const titleX = settings.plot.margin.left + settings.axes.x.length / 2

  return (
    <g transform={`translate(${x}, ${y})`} id={`plot-${index + 1}`}>
      {edbSettings.plots.axes.x.style.title.show && (
        <SvgText
          id={`title-${index + 1}`}
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
        {genesSvg}
        {rankingSvg}
      </SvgMargin>
    </g>
  )
})

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
  const { ref } = useSVG()

  const { pathways } = useGseaPlot()

  if (pathways.length === 0) {
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

  const svgPlots = pathways.map((pathway, index) => (
    <GseaPlot key={pathway.id} pathway={pathway} index={index} />
  ))

  return (
    <SvgBase
      scale={edbSettings.plots.scale}
      width={pageSize[0]!}
      height={pageSize[1]!}
      //shapeRendering={SVG_CRISP_EDGES}
      //className="absolute"

      onMouseMove={(e) => {
        const margin = settings.plot.margin
        const ml = margin.left * edbSettings.plots.scale
        const mt = margin.top * edbSettings.plots.scale
        const pw = settings.axes.x.length * edbSettings.plots.scale
        let ph = settings.es.axes.y.length

        if (settings.genes.show) {
          ph += settings.genes.height + settings.plot.gap.y
        }

        if (settings.ranking.show) {
          ph += settings.ranking.axes.y.length
        }

        ph *= edbSettings.plots.scale

        console.log(edbSettings.plots.scale)

        const p = {
          x: e.clientX - ml - ref.current!.getBoundingClientRect().left,
          y: e.clientY - mt - ref.current!.getBoundingClientRect().top,
        }

        const col = Math.floor(p.x / pw)
        const row = Math.floor(p.y / ph)

        const index = row * settings.page.columns + col

        console.log(e.clientX, p, row, col)
      }}
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
  phenotypes,
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
  phenotypes: string[]
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()
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

      {edbSettings.plots.axes.y.style.show && <AxisLeftSvg ax={yax} />}

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
  xax,
  points,
  es,
  sortedRankedGenes,

  crossing,

  pos,
}: {
  xax: IAxis
  points: { x: number; y: number }[]
  es: IGseaGeneRankScore[]
  sortedRankedGenes: IGseaGeneRankScore[]

  crossing: { index: number; x: number }

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
  pathway,
  xax,
  sortedRankedGenes,
  crossing,
  x0,
  x1,
  pos,
}: {
  pathway: IGseaGeneSet
  xax: IAxis
  sortedRankedGenes: IGseaGeneRankScore[]

  crossing: { index: number; x: number }

  x0: number
  x1: number
  pos: IPos
}) {
  const { settings } = useGseaSettings()
  const { settings: edbSettings } = useEdbSettings()

  const { axis: yax } = useAxis({
    plotId: pathway.id,
    groupId: 'snr',
    axisId: 'y',
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
