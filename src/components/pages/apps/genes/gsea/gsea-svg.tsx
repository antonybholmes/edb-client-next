import { useMemo, type ReactNode } from 'react'

import { BaseSvg } from '@/components/base-svg'
import { Axis, YAxis } from '@/components/plot/axis'
import type { ISVGProps } from '@/interfaces/svg-props'
import { AxisBottomSvg, AxisLeftSvg } from '@components/plot/axis-svg'
import { COLOR_BLACK } from '@lib/color/color'
import { end } from '@lib/math/math'
import { where } from '@lib/math/where'
import { useGsea } from './gsea-store'
import type { IGeneRankScore, IGseaResult, IPathway } from './gsea-utils'

interface IProps extends ISVGProps {
  phenotypes: string[]
  rankedGenes: IGeneRankScore[]
  reports: Map<string, IPathway[]>
  resultsMap: Map<string, IGseaResult>
}

export function GseaSvg({
  ref,
  phenotypes,
  rankedGenes,
  reports,
  resultsMap,
}: IProps) {
  const { settings } = useGsea()

  const svg = useMemo(() => {
    // size of plot with padding
    const plotSize = [
      settings.axes.x.length +
        settings.plot.margin.left +
        settings.plot.margin.right,
      settings.es.axes.y.length +
        (settings.genes.show
          ? settings.plot.gap.y + settings.genes.height
          : 0) +
        (settings.ranking.show
          ? settings.plot.gap.y + settings.ranking.axes.y.length
          : 0) +
        settings.plot.margin.top +
        settings.plot.margin.bottom,
    ]

    // keep only pathways for which we have results, i.e. with
    //suitable q values. If q == 1, unlikely GSEA generated it
    // so we cannot plot it
    const pathways = phenotypes.map((report) =>
      reports.get(report)!.filter((pathway) => resultsMap.has(pathway.name))
    )

    const rows = Math.ceil(pathways.flat().length / settings.page.columns)

    const pageSize = [plotSize[0]! * settings.page.columns, plotSize[1]! * rows]

    let ploti = 0

    const plots = phenotypes
      .map((_, phenotypei) => {
        return pathways[phenotypei]!.map((pathway) => {
          const col = ploti % settings.page.columns
          const row = Math.floor(ploti / settings.page.columns)
          const x = col * plotSize[0]!
          const y = row * plotSize[1]!

          //console.log(pi, row, col, x, y)

          const results = resultsMap.get(pathway.name)!

          let xax = new Axis()
            .setDomain([0, rankedGenes.length - 1])
            //.setDomain([0, plot.dna.seq.length])
            .setLength(settings.axes.x.length)

          xax = xax.setTicks(xax.ticks.slice(1))

          let yMin = Math.min(...results.es.map((e) => e.score))
          let yMax = Math.max(...results.es.map((e) => e.score))

          let yax = new YAxis()
            .autoDomain([yMin, yMax])
            //.setDomain([0, plot.dna.seq.length])
            .setLength(settings.es.axes.y.length)

          const points = results.es.map((e) => [
            xax.domainToRange(e.rank),
            yax.domainToRange(e.score),
          ])

          // fix starts and end
          let displayPoints = points

          if (results.es[0]!.rank > 0) {
            displayPoints = [
              [xax.domainToRange(0), yax.domainToRange(0)],
              ...displayPoints,
            ]
          }

          if (
            results.es[results.es.length - 1]!.rank <
            rankedGenes.length - 1
          ) {
            displayPoints = [
              ...displayPoints,
              [xax.domainToRange(rankedGenes.length - 1), yax.domainToRange(0)],
            ]
          }

          const leadingEdge = results.es.filter((e) => e.leading)

          let leadingPoints = leadingEdge.map((e) => [
            xax.domainToRange(e.rank),
            yax.domainToRange(e.score),
          ]) as [number, number][]

          // fix starts and end

          if (leadingEdge[0]!.score >= 0) {
            // left
            leadingPoints = [
              [xax.domainToRange(0), yax.domainToRange(0)],
              ...leadingPoints,
              [
                leadingPoints[leadingPoints.length - 1]![0]!,
                yax.domainToRange(0),
              ],
            ]
          } else {
            leadingPoints = [
              [leadingPoints[0]![0]!, yax.domainToRange(0)],
              ...leadingPoints,
              [xax.domainToRange(rankedGenes.length - 1), yax.domainToRange(0)],
            ]
          }

          const esSvg = (
            <g>
              {settings.es.leadingEdge.show && (
                <polygon
                  points={leadingPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
                  fill={settings.es.leadingEdge.fill.color}
                  stroke="none"
                  fillOpacity={settings.es.leadingEdge.fill.alpha}
                />
              )}

              <polyline
                points={displayPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
                fill="none"
                stroke={settings.es.line.color}
                strokeWidth={settings.es.line.width}
              />
              <AxisLeftSvg ax={yax} title="ES" />
              <g transform={`translate(0, ${yax.domainToRange(0)})`}>
                <AxisBottomSvg
                  ax={xax}
                  showTicks={settings.es.axes.x.showTicks}
                />
              </g>

              <g
                transform={`translate(${settings.axes.x.length + settings.plot.gap.x / 2}, ${yax.domainToRange(0)})`}
              >
                <text
                  fill={COLOR_BLACK}
                  dominantBaseline="central"
                  //fontSize="x-small"
                  //textAnchor="middle"
                  //fontWeight="bold"
                >
                  {rankedGenes.length.toLocaleString()}
                </text>
              </g>

              <g
                transform={`translate(${phenotypei === 0 ? settings.axes.x.length - 70 : 10}, ${phenotypei === 0 ? 10 : settings.es.axes.y.length - 20})`}
                fontSize="small"
              >
                <text
                  fill={COLOR_BLACK}
                  //dominantBaseline="central"
                  //fontSize="x-small"
                  //textAnchor="end"
                  //fontWeight="bold"
                >
                  NES: {pathway.nes.toFixed(2)}
                </text>

                <g transform={`translate(0, 15)`}>
                  <text
                    fill={COLOR_BLACK}
                    //dominantBaseline="central"
                    //fontSize="x-small"
                    //textAnchor="end"
                    //fontWeight="bold"
                  >
                    FDR: {pathway.q.toFixed(3)}
                  </text>
                </g>
              </g>

              {settings.es.labels.show && (
                <g
                  transform={`translate(0, ${settings.es.axes.y.length + settings.plot.gap.y / 2})`}
                >
                  <g>
                    <text
                      fill={
                        settings.es.labels.isColored
                          ? settings.genes.pos.color
                          : COLOR_BLACK
                      }
                      dominantBaseline="hanging"
                      //fontSize="x-small"
                      //textAnchor="middle"
                      //fontWeight="bold"
                    >
                      {phenotypes[0]!}
                    </text>
                  </g>

                  <g transform={`translate(${settings.axes.x.length}, 0)`}>
                    <text
                      fill={
                        settings.es.labels.isColored
                          ? settings.genes.neg.color
                          : COLOR_BLACK
                      }
                      dominantBaseline="hanging"
                      //fontSize="x-small"
                      textAnchor="end"
                      //fontWeight="bold"
                    >
                      {phenotypes[1]!}
                    </text>
                  </g>
                </g>
              )}
            </g>
          )

          let genesSvg: ReactNode | null = null

          if (settings.genes.show) {
            genesSvg = (
              <g
                transform={`translate(0, ${settings.es.axes.y.length + 2 * settings.plot.gap.y})`}
              >
                {points.map((p, pointi) => {
                  //console.log(pi, results.es[pi], rankedGenes.length)
                  return (
                    <line
                      key={pointi}
                      x1={p[0]}
                      x2={p[0]}
                      y1={0}
                      y2={settings.genes.height}
                      strokeWidth={settings.genes.line.width}
                      stroke={
                        rankedGenes[results.es[pointi]!.rank]!.score > 0
                          ? settings.genes.pos.color
                          : settings.genes.neg.color
                      }
                    />
                  )
                })}
              </g>
            )
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

            const points = rankedGenes.map((e) => [
              xax.domainToRange(e.rank),
              yax.domainToRange(e.score),
            ])

            // fix starts and end
            let displayPoints = points

            displayPoints = [
              [xax.domainToRange(0), yax.domainToRange(0)],
              ...displayPoints,
            ]

            displayPoints = [
              ...displayPoints,
              [xax.domainToRange(rankedGenes.length - 1), yax.domainToRange(0)],
            ]

            const y =
              settings.es.axes.y.length +
              settings.plot.gap.y +
              (settings.genes.show
                ? settings.genes.height + 2 * settings.plot.gap.y
                : 0)

            const crossIndex =
              end(where(rankedGenes, (gene) => gene.score > 0)) + 1
            const crossingX = xax.domainToRange(crossIndex)

            rankingSvg = (
              <g transform={`translate(0, ${y})`}>
                <polygon
                  points={displayPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
                  fill={settings.ranking.fill.color}
                  stroke="none"
                  fillOpacity={settings.ranking.fill.alpha}
                />
                {settings.ranking.zeroCross.show && (
                  <g transform={`translate(${crossingX}, 0)`}>
                    <line
                      y2={settings.ranking.axes.y.length}
                      stroke={COLOR_BLACK}
                      strokeWidth="2"
                      strokeDasharray="8"
                    />
                    <g
                      transform={`translate(0, ${settings.ranking.axes.y.length + settings.plot.gap.y})`}
                    >
                      <text
                        fill={COLOR_BLACK}
                        //dominantBaseline="central"
                        //fontSize="x-small"
                        textAnchor="middle"
                        //fontWeight="bold"
                      >
                        Zero cross at {crossIndex.toLocaleString()}
                      </text>
                    </g>
                  </g>
                )}
                <AxisLeftSvg ax={yax} title="SNR" />
              </g>
            )
          }

          ploti++

          return (
            <g transform={`translate(${x}, ${y})`} key={ploti}>
              <text
                x={settings.plot.margin.left + settings.axes.x.length / 2}
                y="20"
                textAnchor="middle"
              >
                {pathway.name}
              </text>
              {/* <rect
            fill="none"
            stroke="blue"
            width={plotSize[0]!}
            height={plotSize[1]!}
          /> */}
              <g
                transform={`translate(${settings.plot.margin.left}, ${settings.plot.margin.top})`}
              >
                {esSvg}

                {genesSvg && genesSvg}

                {rankingSvg && rankingSvg}
              </g>
            </g>
          )
        })
      })
      .flat()

    return (
      <BaseSvg
        ref={ref}
        scale={settings.page.scale}
        width={pageSize[0]!}
        height={pageSize[1]!}
        //shapeRendering={SVG_CRISP_EDGES}
        className="absolute"
      >
        {plots}
      </BaseSvg>
    )
  }, [rankedGenes, reports, resultsMap, settings])

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
