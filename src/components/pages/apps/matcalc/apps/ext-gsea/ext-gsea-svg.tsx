import { useMemo, type ReactNode } from 'react'

import { Axis, YAxis } from '@/components/plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '@/components/plot/svg-axis'
import type { IExtGseaResult, IGseaResult } from '@/lib/gsea/ext-gsea'
import { abs } from '@/lib/math/abs'

import { range } from '@/lib/math/range'
import { zip } from '@/lib/utils'

import { SvgBase } from '@/components/plot/svg-base'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgPolyLine } from '@/components/plot/svg-poly-line'
import { SvgText } from '@/components/plot/svg-text'
import type { ISVGProps } from '@/interfaces/svg-props'
import { COLOR_BLACK } from '@/lib/color/color'
import type { IGeneSet, IRankedGenes } from '@/lib/gsea/geneset'
import { end, type ILim } from '@/lib/math/math'
import { where } from '@/lib/math/where'
import { usePlot } from '../../history/history-provider/history-hooks'
import { ExtGseaPlot } from '../../history/history-provider/history-types'

interface IProps extends ISVGProps {
  plotAddr: string
}

export function ExtGseaSvg({ ref, plotAddr }: IProps) {
  const plot = usePlot(plotAddr)! as ExtGseaPlot

  const displayProps = plot!.props

  const rankedGenes: IRankedGenes = plot.rankedGenes
  const gs1: IGeneSet = plot.gs1
  const gs2: IGeneSet = plot.gs2

  const extGseaRes: IExtGseaResult = plot.extGseaRes
  const gseaRes1: IGseaResult = plot.gseaRes1
  const gseaRes2: IGseaResult = plot.gseaRes2

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

    let y = gseaRes1.esAll //self._ranked_scores
    const x = range(y.length)

    // subsample so we don't draw every point
    const ix = range(0, x.length, 100)

    const x1 = ix.map((i) => x[i]!)
    let y1 = ix.map((i) => y[i]!)
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

    let xlead = gseaRes1.leadingEdge.map((g) => x[g.rank]!)
    let ylead = gseaRes1.leadingEdge.map((g) => y[g.rank]!)

    // fix ends

    xlead = [xlead[0]!, ...xlead]
    ylead = [0, ...ylead]

    xlead = [...xlead, xlead[xlead.length - 1]!]
    ylead = [...ylead, 0]

    let leadingEdge1Svg: ReactNode | undefined = undefined

    if (displayProps.es.gs1.leadingEdge.fill.show) {
      const points = zip(xlead, ylead)
        .map(
          ([px, py]) => `${xax.domainToRange(px!)},${yax.domainToRange(py!)}`
        )
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
      const points = zip(x1, y1)
        .map(
          ([px, py]) => `${xax.domainToRange(px!)},${yax.domainToRange(py!)}`
        )
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
      const points = zip(xlead, ylead)
        .map(
          ([px, py]) => `${xax.domainToRange(px!)},${yax.domainToRange(py!)}`
        )
        .join(', ')

      leadingEdge2Svg = (
        <polygon
          points={points}
          fill={gs2.color}
          fillOpacity={displayProps.es.gs2.leadingEdge.fill.opacity}
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
        <SvgPolyLine
          points={points}
          stroke={gs2.color}
          s={displayProps.es.gs2.line}
        />
      )
    }

    let genesSvg: ReactNode | undefined = undefined

    if (displayProps.genes.line.show) {
      let points = where(gseaRes1.hits, (x) => x > 0)

      const gengseaRes1Svg = (
        <g>
          <g>
            {points.map((p, pointi) => {
              const x = xax.domainToRange(p)

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
          </g>

          {displayProps.genes.labels.font.show && (
            <g
              transform={`translate(${displayProps.axes.x.length + displayProps.plot!.gap.x / 2}, ${displayProps.genes.height * 0.5})`}
            >
              <SvgText
                fill={
                  displayProps.genes.labels.isColored ? gs1.color : COLOR_BLACK
                }
                font={displayProps.genes.labels.font}
              >
                {gs1.name}
              </SvgText>
            </g>
          )}
        </g>
      )

      points = where(gseaRes2.hits, (x) => x > 0)

      const gengseaRes2Svg = (
        <g
          transform={`translate(0, ${displayProps.genes.height + 0.25 * displayProps.plot!.gap.y})`}
        >
          <g>
            {points.map((p, pointi) => {
              const x = xax.domainToRange(p)

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
          </g>

          {displayProps.genes.labels.font.show && (
            <g
              transform={`translate(${xax.length + displayProps.plot!.gap.x / 2}, ${displayProps.genes.height / 2})`}
            >
              <SvgText
                fill={
                  displayProps.genes.labels.isColored ? gs2.color : COLOR_BLACK
                }
                font={displayProps.genes.labels.font}
              >
                {gs2.name}
              </SvgText>
            </g>
          )}
        </g>
      )

      genesSvg = (
        <g
          transform={`translate(0, ${displayProps.es.axes.y.length + 1.5 * displayProps.plot!.gap.y})`}
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
      const yMax = Math.max(...abs(rankedGenes.genes.map((e) => e.score)))

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
        end(where(rankedGenes.genes, (gene) => gene.score > 0)) + 1

      const crossingX = xax.domainToRange(crossIndex)

      const y =
        displayProps.es.axes.y.length +
        displayProps.plot!.gap.y +
        (displayProps.genes.line.show
          ? 2 * (displayProps.genes.height + displayProps.plot!.gap.y)
          : 0)

      rankingSvg = (
        <g transform={`translate(0, ${y})`}>
          <polygon
            points={displayPoints.map((p) => `${p[0]},${p[1]}`).join(' ')}
            fill={displayProps.ranking.fill.value}
            stroke="none"
            fillOpacity={displayProps.ranking.fill.opacity}
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
                <SvgText
                  font={displayProps.axes.x.font}
                  textAnchor="middle"
                  //fontWeight="bold"
                >
                  Zero cross at {crossIndex.toLocaleString()}
                </SvgText>
              </g>
            </g>
          )}
          <AxisLeftSvg
            ax={yax}
            font={displayProps.axes.x.font}
            labelFont={displayProps.axes.x.labels.font}
          />
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
      <SvgBase
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

            <AxisLeftSvg
              ax={yax}
              font={displayProps.axes.x.font}
              labelFont={displayProps.axes.x.labels.font}
            />
            <g transform={`translate(0, ${yax.domainToRange(0)})`}>
              <AxisBottomSvg
                ax={xax}
                showTicks={displayProps.es.axes.x.showTicks}
              />
              <g
                transform={`translate(${displayProps.axes.x.length + displayProps.plot!.gap.x / 2}, 0)`}
              >
                <SvgText fill={COLOR_BLACK} font={displayProps.axes.x.font}>
                  {rankedGenes.genes.length.toLocaleString()}
                </SvgText>
              </g>
            </g>

            <g
              transform={`translate(0, ${displayProps.es.axes.y.length + displayProps.plot!.gap.y / 2})`}
            >
              <g>
                <SvgText
                  fill={COLOR_BLACK}
                  font={displayProps.axes.x.font}
                  //fontSize="x-small"
                  //textAnchor="middle"
                  //fontWeight="bold"
                >
                  {rankedGenes.group1.name}
                </SvgText>
              </g>

              <g transform={`translate(${displayProps.axes.x.length}, 0)`}>
                <SvgText
                  fill={COLOR_BLACK}
                  font={displayProps.axes.x.font}
                  //fontSize="x-small"
                  textAnchor="end"
                  //fontWeight="bold"
                >
                  {rankedGenes.group2.name}
                </SvgText>
              </g>
            </g>

            <g transform={`translate(${displayProps.axes.x.length}, 0)`}>
              <SvgText fill={COLOR_BLACK} font={displayProps.axes.x.font}>
                NES: {extGseaRes.nes.toFixed(2)}
              </SvgText>

              <g transform={`translate(0, 20)`}>
                <SvgText fill={COLOR_BLACK} font={displayProps.axes.x.font}>
                  P-value: {extGseaRes.pvalue.toFixed(3)}
                </SvgText>
              </g>
            </g>
          </g>

          {genesSvg && genesSvg}

          {rankingSvg && rankingSvg}
        </g>
      </SvgBase>
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
