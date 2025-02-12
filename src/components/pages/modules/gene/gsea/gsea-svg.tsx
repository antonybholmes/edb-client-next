import { forwardRef, useMemo, type ReactNode } from 'react'

import { COLOR_BLACK } from '@/consts'
import { end, where } from '@/lib/math/math'
import { Axis, YAxis } from '@components/plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@components/plot/axis-svg'
import { useGseaStore } from './gsea-store'
import type { IGeneRankScore, IGseaResult, IPathway } from './gsea-utils'

interface IProps {
  phenotypes: string[]
  rankedGenes: IGeneRankScore[]
  reports: Map<string, IPathway[]>
  resultsMap: Map<string, IGseaResult>
}

export const GseaSvg = forwardRef<SVGElement, IProps>(function GseaSvg(
  { phenotypes, rankedGenes, reports, resultsMap }: IProps,
  ref
) {
  const { displayProps } = useGseaStore()

  const svg = useMemo(() => {
    // size of plot with padding
    const plotSize = [
      displayProps.axes.x.length +
        displayProps.plot.margin.left +
        displayProps.plot.margin.right,
      displayProps.es.axes.y.length +
        (displayProps.genes.show
          ? displayProps.plot.gap.y + displayProps.genes.height
          : 0) +
        (displayProps.ranking.show
          ? displayProps.plot.gap.y + displayProps.ranking.axes.y.length
          : 0) +
        displayProps.plot.margin.top +
        displayProps.plot.margin.bottom,
    ]

    // keep only pathways for which we have results, i.e. with
    //suitable q values. If q == 1, unlikely GSEA generated it
    // so we cannot plot it
    const pathways = phenotypes.map((report) =>
      reports.get(report)!.filter((pathway) => resultsMap.has(pathway.name))
    )

    const rows = Math.ceil(pathways.flat().length / displayProps.page.columns)

    const pageSize = [
      plotSize[0]! * displayProps.page.columns,
      plotSize[1]! * rows,
    ]

    let ploti = 0

    const plots = phenotypes
      .map((_, phenotypei) => {
        return pathways[phenotypei]!.map((pathway) => {
          const col = ploti % displayProps.page.columns
          const row = Math.floor(ploti / displayProps.page.columns)
          const x = col * plotSize[0]!
          const y = row * plotSize[1]!

          //console.log(pi, row, col, x, y)

          const results = resultsMap.get(pathway.name)!

          let xax = new Axis()
            .setDomain([0, rankedGenes.length - 1])
            //.setDomain([0, plot.dna.seq.length])
            .setLength(displayProps.axes.x.length)

          xax = xax.setTicks(xax.ticks.slice(1))

          let yMin = Math.min(...results.es.map((e) => e.score))
          let yMax = Math.max(...results.es.map((e) => e.score))

          let yax = new YAxis()
            .autoDomain([yMin, yMax])
            //.setDomain([0, plot.dna.seq.length])
            .setLength(displayProps.es.axes.y.length)

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
              {displayProps.es.leadingEdge.show && (
                <polygon
                  points={leadingPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
                  fill={displayProps.es.leadingEdge.fill.color}
                  stroke="none"
                  fillOpacity={displayProps.es.leadingEdge.fill.alpha}
                />
              )}

              <polyline
                points={displayPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
                fill="none"
                stroke={displayProps.es.line.color}
                strokeWidth={displayProps.es.line.width}
              />
              <AxisLeftSvg ax={yax} title="ES" />
              <g transform={`translate(0, ${yax.domainToRange(0)})`}>
                <AxisBottomSvg
                  ax={xax}
                  showTicks={displayProps.es.axes.x.showTicks}
                />
              </g>

              <g
                transform={`translate(${displayProps.axes.x.length + displayProps.plot.gap.x / 2}, ${yax.domainToRange(0)})`}
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
                transform={`translate(${phenotypei === 0 ? displayProps.axes.x.length - 70 : 10}, ${phenotypei === 0 ? 10 : displayProps.es.axes.y.length - 20})`}
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

              {displayProps.es.labels.show && (
                <g
                  transform={`translate(0, ${displayProps.es.axes.y.length + displayProps.plot.gap.y / 2})`}
                >
                  <g>
                    <text
                      fill={
                        displayProps.es.labels.isColored
                          ? displayProps.genes.pos.color
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

                  <g transform={`translate(${displayProps.axes.x.length}, 0)`}>
                    <text
                      fill={
                        displayProps.es.labels.isColored
                          ? displayProps.genes.neg.color
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

          if (displayProps.genes.show) {
            genesSvg = (
              <g
                transform={`translate(0, ${displayProps.es.axes.y.length + 2 * displayProps.plot.gap.y})`}
              >
                {points.map((p, pointi) => {
                  //console.log(pi, results.es[pi], rankedGenes.length)
                  return (
                    <line
                      key={pointi}
                      x1={p[0]}
                      x2={p[0]}
                      y1={0}
                      y2={displayProps.genes.height}
                      strokeWidth={displayProps.genes.line.width}
                      stroke={
                        rankedGenes[results.es[pointi]!.rank]!.score > 0
                          ? displayProps.genes.pos.color
                          : displayProps.genes.neg.color
                      }
                    />
                  )
                })}
              </g>
            )
          }

          // ranking
          let rankingSvg: ReactNode | null = null

          if (displayProps.ranking.show) {
            yMin = Math.min(...rankedGenes.map((e) => e.score))
            yMax = Math.max(...rankedGenes.map((e) => e.score))
            yax = new YAxis()
              .autoDomain([yMin, yMax])
              //.setDomain([0, plot.dna.seq.length])
              .setLength(displayProps.ranking.axes.y.length)

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
              displayProps.es.axes.y.length +
              displayProps.plot.gap.y +
              (displayProps.genes.show
                ? displayProps.genes.height + 2 * displayProps.plot.gap.y
                : 0)

            const crossIndex =
              end(where(rankedGenes, (gene) => gene.score > 0)) + 1
            const crossingX = xax.domainToRange(crossIndex)

            rankingSvg = (
              <g transform={`translate(0, ${y})`}>
                <polygon
                  points={displayPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
                  fill={displayProps.ranking.fill.color}
                  stroke="none"
                  fillOpacity={displayProps.ranking.fill.alpha}
                />
                {displayProps.ranking.zeroCross.show && (
                  <g transform={`translate(${crossingX}, 0)`}>
                    <line
                      y2={displayProps.ranking.axes.y.length}
                      stroke={COLOR_BLACK}
                      strokeWidth="2"
                      strokeDasharray="8"
                    />
                    <g
                      transform={`translate(0, ${displayProps.ranking.axes.y.length + displayProps.plot.gap.y})`}
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
                x={
                  displayProps.plot.margin.left + displayProps.axes.x.length / 2
                }
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
                transform={`translate(${displayProps.plot.margin.left}, ${displayProps.plot.margin.top})`}
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
      <svg
        style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}
        fontFamily="Arial, Helvetica, sans-serif"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        ref={ref}
        width={pageSize[0]! * displayProps.page.scale}
        height={pageSize[1]! * displayProps.page.scale}
        viewBox={`0 0 ${pageSize[0]!} ${pageSize[1]!}`}
        //shapeRendering={SVG_CRISP_EDGES}
        className="absolute"
      >
        {plots}
      </svg>
    )
  }, [rankedGenes, reports, resultsMap, displayProps])

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
})
