import { type ReactNode } from 'react'

import { Axis, YAxis } from '@/components/plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/svg-axis'
import { SvgBase } from '@/components/plot/svg-base'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgMargin } from '@/components/plot/svg-margin'
import type { ISVGProps } from '@/interfaces/svg-props'
import { addAlphaToHex, COLOR_BLACK } from '@/lib/color/color'
import { ColorMap } from '@/lib/color/colormap'
import { end } from '@/lib/math/math'
import { where } from '@/lib/math/where'
import { SvgText } from '../../../../plot/svg-text'
import { useGsea } from './gsea-plot-store'
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

  let { phenotypes, rankedGenes, reports, resultsMap, datasetsForUse } =
    useGsea()

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

  if (settings.phenotypes.invert) {
    phenotypes = phenotypes.slice().reverse()
  }

  const rows = Math.ceil(pathways.flat().length / settings.page.columns)

  const pageSize = [
    (plotSize[0]! + settings.plot.margin.left + settings.plot.margin.right) *
      settings.page.columns,
    (plotSize[1]! + settings.plot.margin.top + settings.plot.margin.bottom) *
      rows,
  ]

  let ploti = 0

  const phenIndexMap = new Map<string, number>(
    phenotypes.map((phen, i) => [phen, i])
  )

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

    const phenotypei = phenIndexMap.get(pathway.phen)!

    const results = resultsMap[pathway.name]!

    const maxRank = rankedGenes.length - 1

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

    if (settings.phenotypes.invert) {
      rankedGenes = rankedGenes
        .map((e) => ({
          ...e,
          rank: maxRank - e.rank,
          score: -e.score,
        }))
        .sort((a, b) => a.rank - b.rank)
    }

    const rankMid = maxRank / 2

    let yMin = Math.min(...es.map((e) => e.score))
    let yMax = Math.max(...es.map((e) => e.score))

    let yax = new YAxis()
      .autoDomain([yMin, yMax])
      //.setDomain([0, plot.dna.seq.length])
      .setLength(settings.es.axes.y.length)

    const points = es.map((e) => ({
      x: xax.domainToRange(e.rank),
      y: yax.domainToRange(e.score),
    }))

    const y0 = yax.domainToRange(0)
    const x1 = xax.domainToRange(maxRank)

    // fix starts and end by zeroing them
    let displayPoints = points

    //if (es[0]!.rank > 0) {
    if (displayPoints[0]!.y !== y0) {
      displayPoints = [{ x: xax.domainToRange(0), y: y0 }, ...displayPoints]
    }

    if (displayPoints[displayPoints.length - 1]!.y !== y0) {
      displayPoints = [
        ...displayPoints,
        {
          x: x1,
          y: y0,
        },
      ]
    }

    const leadingEdge = es.filter((e) => e.leading)

    let leadingPoints = leadingEdge.map((e) => ({
      x: xax.domainToRange(e.rank),
      y: yax.domainToRange(e.score),
    }))

    // fix starts and end

    // check if leading edge is on left or right half to decide how to fix start and end
    if (leadingEdge[leadingEdge.length - 1].rank < rankMid) {
      // left
      leadingPoints = [
        { x: xax.domainToRange(0), y: y0 },
        ...leadingPoints,
        {
          x: leadingPoints[leadingPoints.length - 1]!.x,
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

    let esSvg: ReactNode | null = null

    let plotY: number = 0

    const nes = settings.phenotypes.invert ? -pathway.nes : pathway.nes

    if (settings.es.show) {
      esSvg = (
        <g>
          {settings.es.leadingEdge.show && (
            <polygon
              points={leadingPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              fill={settings.es.leadingEdge.fill.value}
              stroke="none"
              fillOpacity={settings.es.leadingEdge.fill.opacity}
            />
          )}

          <polyline
            points={displayPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            fill="none"
            stroke={settings.es.line.value}
            opacity={settings.es.line.opacity}
            strokeWidth={settings.es.line.width}
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
              {rankedGenes.length.toLocaleString()}
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
                  {phenotypes[0]!}
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
                  {phenotypes[1]!}
                </SvgText>
              </g>
            </g>
          )}
        </g>
      )

      plotY += settings.es.axes.y.length + 2 * settings.plot.gap.y
    }

    const crossIndex = end(where(rankedGenes, (gene) => gene.score > 0)) + 1
    const crossingX = xax.domainToRange(crossIndex)

    let genesSvg: ReactNode | null = null

    if (settings.genes.show) {
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

      //console.log(rankedGenes)

      const posPoints = points.filter((_, pi) => {
        return rankedGenes[es[pi]!.rank]!.score >= 0
      })
      const negPoints = points.filter(
        (_, pi) => rankedGenes[es[pi]!.rank]!.score < 0
      )

      genesSvg = (
        <g transform={`translate(0, ${plotY})`}>
          {posPoints.map((p, pi) => {
            const pc = p.x / crossingX

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
            const pc = (p.x - crossingX) / (xax.range[1] - crossingX)

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

      plotY += settings.genes.height + settings.plot.gap.y
    }

    // ranking
    let rankingSvg: ReactNode | null = null

    if (settings.ranking.show) {
      yMin = Math.min(...rankedGenes.map((e) => e.score))
      yMax = Math.max(...rankedGenes.map((e) => e.score))
      yax = new YAxis()
        .autoDomain([yMin, yMax])
        //.setDomain([0, plot.dna.seq.length])
        .setLength(settings.ranking.axes.y.length)

      const y0 = yax.domainToRange(0)

      const points = rankedGenes.map((e) => ({
        x: xax.domainToRange(e.rank),
        y: yax.domainToRange(e.score),
      }))

      // fix starts and end
      let displayPoints = points

      displayPoints = [{ x: xax.domainToRange(0), y: y0 }, ...displayPoints]

      displayPoints = [
        ...displayPoints,
        {
          x: x1,
          y: y0,
        },
      ]

      rankingSvg = (
        <g transform={`translate(0, ${plotY})`}>
          <polygon
            points={displayPoints.map((p) => `${p.x},${p.y}`).join(' ')}
            fill={settings.ranking.fill.value}
            stroke="none"
            fillOpacity={settings.ranking.fill.opacity}
          />
          {settings.ranking.zeroCross.show && (
            <g transform={`translate(${crossingX}, 0)`}>
              <SvgLine
                y2={settings.ranking.axes.y.length}
                s={settings.ranking.zeroCross.line}
              />
              <g
                transform={`translate(0, ${settings.ranking.axes.y.length + settings.plot.gap.y})`}
              >
                <SvgText
                  //dominantBaseline="central"
                  //fontSize="x-small"
                  textAnchor="middle"
                  font={settings.axes.ticks}
                >
                  Zero cross at {crossIndex.toLocaleString()}
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
