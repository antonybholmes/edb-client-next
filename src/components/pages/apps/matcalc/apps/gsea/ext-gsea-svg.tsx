import { useMemo, type ReactNode } from 'react'

import { Axis, YAxis } from '@/components/plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@components/plot/axis-svg'
import type { IExtGseaResult, IGseaResult } from '@lib/gsea/ext-gsea'
import { abs } from '@lib/math/abs'

import { range } from '@lib/math/range'
import { zip } from '@lib/utils'

import { BaseSvg } from '@/components/base-svg'
import type { ISVGProps } from '@interfaces/svg-props'
import { COLOR_BLACK } from '@lib/color/color'
import type { IGeneset, IRankedGenes } from '@lib/gsea/geneset'
import { end, type ILim } from '@lib/math/math'
import { where } from '@lib/math/where'
import type { IExtGseaDisplayOptions } from '../../../genes/gsea/ext-gsea-store'
import { usePlot } from '../../history/history-store'

interface IProps extends ISVGProps {
  plotAddr: string
}

export function ExtGseaSvg({ ref, plotAddr }: IProps) {
  //const { displayProps } = useExtGseaStore()

  const plot = usePlot(plotAddr)!

  const displayProps = plot!.customProps
    .displayOptions as IExtGseaDisplayOptions

  const rankedGenes: IRankedGenes = plot!.customProps[
    'rankedGenes'
  ] as IRankedGenes
  const gs1: IGeneset = plot!.customProps['gs1'] as IGeneset
  const gs2: IGeneset = plot!.customProps['gs2'] as IGeneset

  const extGseaRes: IExtGseaResult = plot!.customProps[
    'extGseaRes'
  ] as IExtGseaResult
  const gseaRes1: IGseaResult = plot!.customProps['gseaRes1'] as IGseaResult
  const gseaRes2: IGseaResult = plot!.customProps['gseaRes2'] as IGseaResult

  //const extGsea: ExtGSEA = plot!.customProps.extGsea as ExtGSEA

  const svg = useMemo(() => {
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

    //const gseaRes1 = extGsea.runGSEA(gs1)
    //const is_leading_edge1 = gseaRes1.leadingEdgeIndices

    //const gseaRes2 = extGsea.runGSEA(gs2)
    //const is_leading_edge2 = gseaRes2.leadingEdgeIndices

    let y = gseaRes1.esAll //self._ranked_scores
    const x = range(y.length)

    // subsample so we don't draw every point
    const ix = range(0, x.length, 100)

    const x1 = ix.map(i => x[i]!)
    let y1 = ix.map(i => y[i]!)
    y1[0] = 0
    y1[y1.length - 1] = 0

    const xmax = Math.max(...x)
    const ymax = Math.max(...abs([...y, ...gseaRes2.esAll]))
    //ymax = round((ymax * 10) / 10, 1)

    let xax = new Axis()
      .setDomain([0, xmax])
      .setLength(displayProps.axes.x.length)

    xax = xax.setTicks(xax.ticks.slice(1))

    const yax = new YAxis()
      .autoDomain([-ymax, ymax])
      .setLength(displayProps.es.axes.y.length)
      .setTitle(displayProps.es.axes.y.title)

    let xlead = gseaRes1.leadingEdge.map(g => x[g.rank]!)
    let ylead = gseaRes1.leadingEdge.map(g => y[g.rank]!)

    // fix ends

    xlead = [xlead[0]!, ...xlead]
    ylead = [0, ...ylead]

    xlead = [...xlead, xlead[xlead.length - 1]!]
    ylead = [...ylead, 0]

    let leadingEdge1Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs1.leadingEdge.show) {
      const points = zip(xlead, ylead)
        .map(
          ([px, py]) => `${xax.domainToRange(px!)},${yax.domainToRange(py!)}`
        )
        .join(', ')

      leadingEdge1Svg = (
        <polygon
          points={points}
          fill={gs1.color}
          fillOpacity={displayProps.es.gs1.leadingEdge.fill.alpha}
          stroke="none"
        />
      )
    }

    let line1Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs1.line.show) {
      const points = zip(x1, y1)
        .map(
          ([px, py]) => `${xax.domainToRange(px!)},${yax.domainToRange(py!)}`
        )
        .join(', ')

      line1Svg = (
        <polyline
          points={points}
          stroke={gs1.color}
          strokeWidth={displayProps.es.gs1.line.width}
          fill="none"
        />
      )
    }

    //
    // line 2
    //

    y = gseaRes2.esAll //self._ranked_scores
    //x = range(y.length)

    y1 = ix.map(i => y[i]!)
    y1[0] = 0
    y1[y1.length - 1] = 0

    xlead = gseaRes2.leadingEdge.map(g => x[g.rank]!)
    ylead = gseaRes2.leadingEdge.map(g => y[g.rank]!)

    // fix ends

    xlead = [xlead[0]!, ...xlead]
    ylead = [0, ...ylead]

    xlead = [...xlead, xlead[xlead.length - 1]!]
    ylead = [...ylead, 0]

    let leadingEdge2Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs2.leadingEdge.show) {
      const points = zip(xlead, ylead)
        .map(
          ([px, py]) => `${xax.domainToRange(px!)},${yax.domainToRange(py!)}`
        )
        .join(', ')

      leadingEdge2Svg = (
        <polygon
          points={points}
          fill={gs2.color}
          fillOpacity={displayProps.es.gs2.leadingEdge.fill.alpha}
          stroke="none"
        />
      )
    }

    let line2Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs2.line.show) {
      const points = zip(x1, y1)
        .map(
          ([px, py]) => `${xax.domainToRange(px!)},${yax.domainToRange(py!)}`
        )
        .join(', ')

      line2Svg = (
        <polyline
          points={points}
          stroke={gs2.color}
          strokeWidth={displayProps.es.gs2.line.width}
          fill="none"
        />
      )
    }

    let genesSvg: ReactNode | undefined = undefined

    if (displayProps.genes.line.show) {
      let points = where(gseaRes1.hits, x => x > 0)

      const gengseaRes1Svg = (
        <g>
          <g>
            {points.map((p, pointi) => {
              const x = xax.domainToRange(p)

              return (
                <line
                  key={pointi}
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={displayProps.genes.height}
                  strokeWidth={displayProps.genes.line.width}
                  stroke={gs1.color}
                />
              )
            })}
          </g>

          {displayProps.genes.labels.show && (
            <g
              transform={`translate(${displayProps.axes.x.length + displayProps.plot!.gap.x}, ${displayProps.genes.height * 0.5})`}
            >
              <text
                fill={
                  displayProps.genes.labels.isColored ? gs1.color : COLOR_BLACK
                }
                dominantBaseline="central"
                //fontSize="x-small"
                //textAnchor="middle"
                fontWeight="bold"
              >
                {gs1.name}
              </text>
            </g>
          )}
        </g>
      )

      points = where(gseaRes2.hits, x => x > 0)

      const gengseaRes2Svg = (
        <g
          transform={`translate(0, ${displayProps.genes.height + 0.5 * displayProps.plot!.gap.y})`}
        >
          <g>
            {points.map((p, pointi) => {
              const x = xax.domainToRange(p)

              return (
                <line
                  key={pointi}
                  x1={x}
                  x2={x}
                  y1={0}
                  y2={displayProps.genes.height}
                  strokeWidth={displayProps.genes.line.width}
                  stroke={gs2.color}
                />
              )
            })}
          </g>

          {displayProps.genes.labels.show && (
            <g
              transform={`translate(${xax.range + displayProps.plot!.gap.x}, ${displayProps.genes.height / 2})`}
            >
              <text
                fill={
                  displayProps.genes.labels.isColored ? gs2.color : COLOR_BLACK
                }
                dominantBaseline="central"
                //fontSize="x-small"
                //textAnchor="middle"
                fontWeight="bold"
              >
                {gs2.name}
              </text>
            </g>
          )}
        </g>
      )

      genesSvg = (
        <g
          transform={`translate(0, ${displayProps.es.axes.y.length + 2 * displayProps.plot!.gap.y})`}
        >
          {gengseaRes1Svg}
          {gengseaRes2Svg}
        </g>
      )
    }

    // ranking
    let rankingSvg: ReactNode | null = null

    if (displayProps.ranking.show) {
      //const yMin = Math.min(...rankedGenes.map(e => e.score))
      const yMax = Math.max(...abs(rankedGenes.genes.map(e => e.score)))

      const yax = new YAxis()
        .autoDomain([-yMax, yMax])
        //.setDomain([0, plot!.dna.seq.length])
        .setLength(displayProps.ranking.axes.y.length)
        .setTitle('SNR')

      let displayPoints = rankedGenes.genes.map((e, ei) => [
        xax.domainToRange(ei),
        yax.domainToRange(e.score),
      ])

      displayPoints = [
        [xax.domainToRange(0), yax.domainToRange(0)],
        ...displayPoints,
      ]

      displayPoints = [
        ...displayPoints,
        [xax.domainToRange(rankedGenes.genes.length - 1), yax.domainToRange(0)],
      ]

      // crossing point
      const crossIndex =
        end(where(rankedGenes.genes, gene => gene.score > 0)) + 1
      const crossingX = xax.domainToRange(crossIndex)

      const y =
        displayProps.es.axes.y.length +
        2 * displayProps.plot!.gap.y +
        (displayProps.genes.line.show
          ? 2 * (displayProps.genes.height + displayProps.plot!.gap.y)
          : 0)

      rankingSvg = (
        <g transform={`translate(0, ${y})`}>
          <polygon
            points={displayPoints.map(p => `${p[0]},${p[1]}`).join(' ')}
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
                transform={`translate(0, ${displayProps.ranking.axes.y.length + displayProps.plot!.gap.y})`}
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
          <AxisLeftSvg ax={yax} />
        </g>
      )
    }

    //   return (
    //     <g
    //       transform={`translate(${x}, ${y})`}
    //       className="border"
    //       key={pathwayi}
    //     >
    //       <text y="20">{pathway.name}</text>
    //       <rect
    //         fill="none"
    //         stroke="blue"
    //         width={plotSize[0]!}
    //         height={plotSize[1]!}
    //       />
    //       <g
    //         transform={`translate(${displayProps.plot!.padding.left}, ${displayProps.plot!.padding.top})`}
    //       >
    //         {esSvg}

    //         {genesSvg && genesSvg}

    //         {rankingSvg && rankingSvg}
    //       </g>
    //     </g>
    //   )
    // })

    return (
      <BaseSvg
        ref={ref}
        width={pageSize[0]!}
        height={pageSize[1]!}
        scale={displayProps.page.scale}
        //shapeRendering={SVG_CRISP_EDGES}
        className="absolute"
      >
        <g
          transform={`translate(${displayProps.plot!.margin.left}, ${displayProps.plot!.margin.top})`}
        >
          <g>
            {leadingEdge1Svg && leadingEdge1Svg}
            {line1Svg && line1Svg}

            {leadingEdge2Svg && leadingEdge2Svg}
            {line2Svg && line2Svg}

            <AxisLeftSvg ax={yax} />
            <g transform={`translate(0, ${yax.domainToRange(0)})`}>
              <AxisBottomSvg
                ax={xax}
                showTicks={displayProps.es.axes.x.showTicks}
              />
              <g
                transform={`translate(${displayProps.axes.x.length + displayProps.plot!.gap.x / 2}, 0)`}
              >
                <text
                  fill={COLOR_BLACK}
                  dominantBaseline="central"
                  //fontSize="x-small"
                  //textAnchor="middle"
                  //fontWeight="bold"
                >
                  {rankedGenes.genes.length.toLocaleString()}
                </text>
              </g>
            </g>

            <g
              transform={`translate(0, ${displayProps.es.axes.y.length + displayProps.plot!.gap.y / 2})`}
            >
              <g>
                <text
                  fill={COLOR_BLACK}
                  dominantBaseline="hanging"
                  //fontSize="x-small"
                  //textAnchor="middle"
                  //fontWeight="bold"
                >
                  {rankedGenes.group1.name}
                </text>
              </g>

              <g transform={`translate(${displayProps.axes.x.length}, 0)`}>
                <text
                  fill={COLOR_BLACK}
                  dominantBaseline="hanging"
                  //fontSize="x-small"
                  textAnchor="end"
                  //fontWeight="bold"
                >
                  {rankedGenes.group2.name}
                </text>
              </g>
            </g>

            <g transform={`translate(${displayProps.axes.x.length}, 0)`}>
              <text
                fill={COLOR_BLACK}
                //dominantBaseline="central"
                //fontSize="x-small"
                //textAnchor="end"
                //fontWeight="bold"
              >
                NES: {extGseaRes.nes.toFixed(2)}
              </text>

              <g transform={`translate(0, 20)`}>
                <text
                  fill={COLOR_BLACK}
                  //dominantBaseline="central"
                  //fontSize="x-small"
                  //textAnchor="end"
                  //fontWeight="bold"
                >
                  P-value: {extGseaRes.pvalue.toFixed(3)}
                </text>
              </g>
            </g>
          </g>

          {genesSvg && genesSvg}

          {rankingSvg && rankingSvg}
        </g>
      </BaseSvg>
    )
  }, [displayProps])

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
