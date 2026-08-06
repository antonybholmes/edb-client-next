import { useMemo, useRef, useState } from 'react'

import { COLOR_BLACK } from '@/lib/color/color'

import { Axis } from '../../../../../plot/axis'
import { AxisBottomSvg } from '../../../../../plot/svg-axis'

import { SvgBase } from '@/components/plot/svg-base'
import type { ISVGProps } from '@/interfaces/svg-props'

import { HColorBarSvg, VColorBarSvg } from '@/components/plot/color-bar-svg'
import { DEFAULT_COLORBAR_SIZE } from '@/components/plot/heatmap/heatmap-svg-props'
import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgMargin } from '@/components/plot/svg-margin'
import {
  ColorBarPos,
  DEFAULT_STROKE_PROPS,
  IMarginProps,
  IStrokeProps,
} from '@/components/plot/svg-props'
import { SvgText } from '@/components/plot/svg-text'
import { IDim } from '@/interfaces/dim'
import {
  COLOR_MAPS,
  ColorMap,
  ColorMapName,
  getColorMap,
} from '@/lib/color/colormap'
import { linspace } from '@/lib/math/linspace'
import { ILim } from '@/lib/math/math'

import { IGseaDotPlot } from '../../history/history-provider/history-types'
import type { ITooltip } from '../heatmap/heatmap-svg'
import { IDisplayAxis } from '../volcano/volcano-plot-svg'
import { useGseaDotContext } from './gsea-dot-provider'

const MARGIN = { top: 10, right: 200, bottom: 100, left: 200 }

const TOOLTIP_OFFSET = 10

// export const COLOR_MAP = new ColorMap('Volcano', [
//   '#3366cc',
//   '#cccccc',
//   '#e62e00',
// ])

export interface IGseaDotDisplayOptions {
  axes: {
    xaxis: IDisplayAxis
    yaxis: { length: number; rowHeight: number }
  }
  dots: {
    size: number
    color: string
    opacity: number
  }
  p: {
    range: ILim
    label: string
    cmap: ColorMapName
  }
  size: {
    label: string
    maxSize: number
  }
  scale: number

  border: IStrokeProps
  padding: number
  colorbar: {
    show: boolean
    position: ColorBarPos
    size: IDim
  }
  legend: {
    dots: {
      n: number
      sizes: number[]
    }
  }
  margin: IMarginProps
}

export const DEFAULT_GSEA_DOT_PROPS: IGseaDotDisplayOptions = {
  axes: {
    xaxis: {
      name: 'Log2 fold change',

      domain: [-2, 2],
      length: 300,
      ticks: [],
      tickLabels: [],
      tickSize: 4,
      strokeWidth: 1,
      color: COLOR_BLACK,
    },
    yaxis: {
      length: 500,
      rowHeight: 50,
    },
  },

  scale: 1,
  p: {
    range: [0, 10],
    label: '-log10(p)',
    cmap: 'BWRv2',
  },
  size: {
    label: 'Size',
    maxSize: 100,
  },
  dots: {
    size: 16,
    color: '#000000',
    opacity: 0.75,
  },

  border: { ...DEFAULT_STROKE_PROPS },
  padding: 10,
  colorbar: {
    show: true,
    position: 'right',
    size: { ...DEFAULT_COLORBAR_SIZE },
  },
  legend: {
    dots: {
      n: 3,
      sizes: [25, 50, 75, 100],
    },
  },
  margin: { ...MARGIN },
}

function getColor(
  log10pvalue: number,
  maxlog10pvalue: number,
  colorMap: ColorMap
) {
  const f = Math.min(log10pvalue / maxlog10pvalue, 1)

  const color = colorMap.getHexColor(f)

  return color
}

interface IProps extends ISVGProps {
  size?: string
  sizeFunc?: (x: number) => number

  //displayOptions?: IVolcanoDisplayOptions
}

export function GseaDotPlotSvg({
  ref,

  sizeFunc = (x: number) => x,
}: IProps) {
  const { plot } = useGseaDotContext()

  const displayOptions: IGseaDotDisplayOptions = (plot! as IGseaDotPlot).props

  const tooltipRef = useRef<HTMLDivElement>(null)

  const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

  const points = useMemo(
    () =>
      plot.gseaDot.nes.map((x, i) => {
        const size = plot.gseaDot.sizes[i]!
        const sizeF = Math.min(size / displayOptions.size.maxSize, 1)
        return {
          x,
          y: i + 1,
          p: plot.gseaDot.log10pvalues[i]!,
          color: getColor(
            plot.gseaDot.log10pvalues[i]!,
            displayOptions.p.range[1],
            getColorMap(displayOptions.p.cmap)
          ),
          size: sizeF,
          r: sizeF * displayOptions.dots.size,
          label: plot.gseaDot.ids[i]!,
        }
      }),
    [
      plot.gseaDot.nes,
      plot.gseaDot.sizes,
      displayOptions.size.maxSize,
      displayOptions.dots.size,
      displayOptions.p.cmap,
    ]
  )

  const svg = useMemo(() => {
    //const huedata = hue ? getNumCol(df, findCol(df, hue)) : []

    const xax = new Axis()
      .autoDomain(displayOptions.axes.xaxis.domain)
      //.setDomain(displayOptions.xdomain)
      .setLength(displayOptions.axes.xaxis.length)

    const innerWidth = xax.length
    const innerHeight =
      displayOptions.axes.yaxis.rowHeight * (plot.gseaDot.nes.length + 1)
    const width =
      innerWidth + displayOptions.margin.left + displayOptions.margin.right
    const height =
      innerHeight + displayOptions.margin.top + displayOptions.margin.bottom
    const cmap = COLOR_MAPS[displayOptions.p.cmap]!

    //console.log('innerWidth:', innerWidth, 'innerHeight:', innerHeight)

    let sizes = displayOptions.legend.dots.sizes

    if (sizes.length === 0) {
      // skip 0
      sizes = linspace(0, displayOptions.size.maxSize, 5).slice(1)
    }

    const dotLegendPos = []

    let y = 0

    for (const [si, s] of sizes.entries()) {
      const d = Math.min(s, displayOptions.size.maxSize)
      const r1 =
        Math.min(d / displayOptions.size.maxSize, 1) * displayOptions.dots.size

      dotLegendPos.push({ label: d.toFixed(0), r: r1, y })

      if (si < sizes.length - 1) {
        const r2 =
          Math.min(sizes[si + 1]! / displayOptions.size.maxSize, 1) *
          displayOptions.dots.size
        y += r1 + r2 + displayOptions.padding
      }
    }

    return (
      <SvgBase
        ref={ref}
        width={width}
        height={height}
        scale={displayOptions.scale}
      >
        <SvgMargin margin={displayOptions.margin}>
          {points.map((p, xi) => {
            const x1 = xax!.domainToRange(p.x)
            const y1 = p.y * displayOptions.axes.yaxis.rowHeight

            return (
              <circle
                cx={x1}
                cy={y1}
                r={p.r}
                fill={p.color}
                opacity={displayOptions.dots.opacity}
                key={xi}
                onMouseLeave={() => setToolTipInfo(null)}
                onMouseEnter={() => {
                  setToolTipInfo({
                    ...toolTipInfo,
                    pos: {
                      x: x1 + displayOptions.margin.left + TOOLTIP_OFFSET,
                      y: y1 + displayOptions.margin.top + TOOLTIP_OFFSET,
                    },
                    cell: { row: xi, col: 0 },
                  })
                }}
              />
            )
          })}
        </SvgMargin>

        <g
          transform={`translate(${displayOptions.margin.left - displayOptions.padding}, ${displayOptions.margin.top})`}
        >
          {points.map((p, xi) => {
            const y1 = p.y * displayOptions.axes.yaxis.rowHeight

            return (
              <SvgText key={xi} y={y1} textAnchor="end">
                {p.label}
              </SvgText>
            )
          })}
        </g>

        {displayOptions.border.show && (
          <SvgMargin margin={displayOptions.margin}>
            <rect
              width={innerWidth}
              height={innerHeight}
              stroke={displayOptions.border.value}
              strokeWidth={displayOptions.border.width}
              fill="none"
            />
          </SvgMargin>
        )}

        <AxisBottomSvg
          ax={xax}
          pos={{
            x: displayOptions.margin.left,
            y: displayOptions.margin.top + innerHeight,
          }}
          tickSize={displayOptions.axes.xaxis.tickSize}
          strokeWidth={displayOptions.axes.xaxis.strokeWidth}
          title={'NES'}
          color={displayOptions.axes.xaxis.color}
        />

        {displayOptions.colorbar.show &&
          displayOptions.colorbar.position.includes('right') && (
            <g
              transform={`translate(${displayOptions.margin.left + innerWidth + displayOptions.padding * 4}, ${displayOptions.margin.top})`}
            >
              <g id="p-legend">
                <SvgText
                  x={displayOptions.colorbar.size.h / 2}
                  y={0}
                  textAnchor="middle"
                >
                  {displayOptions.p.label}
                </SvgText>
                <g transform={`translate(0, ${displayOptions.padding * 2})`}>
                  <VColorBarSvg
                    domain={displayOptions.p.range}
                    cmap={cmap}
                    size={displayOptions.colorbar.size}
                    //stroke={displayOptions.colorbar.stroke}
                    //font={displayOptions.legend}
                  />
                </g>
              </g>
              <g
                id="dot-legend"
                transform={`translate(0, ${displayOptions.colorbar.size.w + displayOptions.padding * 5})`}
              >
                <SvgText
                  x={displayOptions.colorbar.size.h / 2}
                  y={0}
                  textAnchor="middle"
                >
                  {displayOptions.size.label}
                </SvgText>
                <g
                  transform={`translate(0, ${displayOptions.padding + displayOptions.dots.size})`}
                >
                  {dotLegendPos.map((d, di) => (
                    <g key={di}>
                      <SvgCircle
                        key={di}
                        cx={displayOptions.colorbar.size.h / 2}
                        cy={d.y}
                        r={d.r}
                        stroke="black"
                      />
                      <SvgText
                        x={
                          displayOptions.colorbar.size.h / 2 +
                          displayOptions.dots.size +
                          displayOptions.padding
                        }
                        y={d.y}
                        //textAnchor="start"
                        //dominantBaseline="central"
                      >
                        {d.label}
                      </SvgText>
                    </g>
                  ))}
                </g>
              </g>
            </g>
          )}

        {displayOptions.colorbar.show &&
          displayOptions.colorbar.position.includes('bottom') && (
            <g
              transform={`translate(${displayOptions.margin.left}, ${displayOptions.margin.top + innerHeight + 100})`}
            >
              <HColorBarSvg
                domain={displayOptions.p.range}
                cmap={cmap}
                size={displayOptions.colorbar.size}
                //stroke={displayOptions.colorbar.stroke}
                //font={displayOptions.legend}
              />
            </g>
          )}
      </SvgBase>
    )
  }, [plot, points, displayOptions])

  // useEffect(() => {
  //   //if (dataFiles.length > 0) {

  //   async function fetch() {
  //     const svg = d3.select(svgRef.current) //.attr("width", 700).attr("height", 300);

  //     svg.selectAll("*").remove()

  //     const g = svg.append("g")

  //     // set the dimensions and margins of the graph
  //     var margin = { top: 10, right: 200, bottom: 30, left: 100 }

  //     g.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  //     //   .attr("height", height + margin.top + margin.bottom)

  //     const innerWidth = 1000 - margin.left - marginRight
  //     const innerHeight = 1000 - margin.top - margin.bottom

  //     // append the svg object to the body of the page
  //     // svg
  //     //   .attr("width", width + margin.left + marginRight)
  //     //   .attr("height", height + margin.top + margin.bottom)
  //     //   .append("g")
  //     //   .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  //     //Read the data
  //     //const data = await d3.csv(
  //     //  "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/heatmap_data.csv"
  //     //)

  //     let df: IDataFrame = dataFile

  //     if (search.length > 0) {
  //       const idxMap = rowIdxMap(df, true)

  //       const idx = search
  //         .map(term => idxMap[term])
  //         .filter(x => x !== undefined)

  //       df = filterRows(df, idx)
  //     }

  //     df = sliceCols(sliceRows(df))

  //     // Labels of row and columns -> unique identifier of the column called 'group' and 'variable'
  //     // var myGroups = d3.map(data, (d, i) => {

  //     //   return d.group
  //     // })

  //     const myGroups: string[] = range(df.data[0].length).map(i => `col${i}`) //data.colIndex //Array.from(
  //     // new Set(data.colIndex)) //.map((d, i) => d.group || "").filter(x => x !== ""))

  //     const myVars = df.rowIndex[0].ids.map(rowId => rowId)
  //     myVars.toReversed()
  //     //Array.from(
  //     //new Set(data.rowIndex)) //data.map((d, i) => d.variable || "").filter(x => x !== ""))
  //     //d3.map(data, (d, i) => d.variable)

  //     const plotData: {
  //       group: string
  //       colId: string
  //       variable: string
  //       value: number
  //     }[] = []

  //     df.data.forEach((row, ri) => {
  //       row.forEach((cell, ci) => {
  //         plotData.push({
  //           group: df.colIndex[0].ids[ci],
  //           colId: `col${ci}`,
  //           variable: df.rowIndex[0].ids[ri],
  //           value: getCellValue(cell),
  //         })
  //       })
  //     })

  //     // Build X scales and axis:
  //     var x = d3
  //       .scaleBand()
  //       .range([0, innerWidth])
  //       .domain(myGroups)
  //       .padding(0.05)

  //     g.append("g")
  //       .style("font-size", 15)
  //       .attr("font-family", "Arial, Helvetica, sans-serif")
  //       .attr("transform", "translate(0," + innerHeight + ")")
  //       .call(
  //         d3
  //           .axisBottom(x)
  //           .tickSize(0)
  //           .tickFormat((x, xi) => df.colIndex[0].ids[xi])
  //       )
  //       .select(".domain")
  //       .remove()

  //     // Build Y scales and axis:
  //     var y = d3
  //       .scaleBand()
  //       .range([innerHeight, 0])
  //       .domain(myVars)
  //       .padding(0.05)

  //     g.append("g")
  //       .style("font-size", 15)

  //       .attr("font-family", "Arial, Helvetica, sans-serif")
  //       .call(d3.axisLeft(y).tickSize(0))
  //       .select(".domain")
  //       .remove()

  //     // Build color scale
  //     // var myColor = d3
  //     //   .scaleSequential()
  //     //   .interpolator(["blue", "white", "red"]) //d3.interpolateRdBu)
  //     //   .domain([1, 100])

  //     var myColor = d3
  //       .scaleLinear()
  //       .domain([-3, 0, 3])
  //
  //       .range(["blue", "white", "red"])

  //     // Three function that change the tooltip when user hover / move / leave a cell
  //     function mouseover(e:unknown, d:unknown) {
  //       d3.select(tooltipRef.current).style("opacity", 1)
  //       d3.select(e.target).style("stroke", "black").style("opacity", 1)
  //     }

  //     function mousemove(e:unknown, d:unknown) {
  //       d3.select(tooltipRef.current)
  //         .html(`${d.group}<br/>${d.variable}<br/>${d.value.toFixed(4)}`)
  //         .style("Left", e.offsetX + 5 + "px")
  //         .style("top", e.offsetY + 5 + "px")
  //     }

  //     function mouseleave(e:unknown, d:unknown) {
  //       d3.select(tooltipRef.current).style("opacity", 0)
  //       //d3.select(this).style("stroke", "none").style("opacity", 0.8)
  //       d3.select(e.target).style("stroke", "none").style("opacity", 0.8)
  //     }

  //     // add the squares
  //     const g2 = g.append("g")
  //     g2.selectAll()
  //       .data(plotData)
  //       .enter()
  //       .append("rect")
  //       .attr("x", (d, i) => x(d.colId || "") || "")
  //       .attr("y", (d, i) => y(d.variable || "") || "")
  //       .attr("width", x.bandwidth())
  //       .attr("height", y.bandwidth())
  //       .style("fill", (d, i) => (d.value ? myColor(d.value) : "white"))
  //       .style("stroke-width", 1)
  //       .style("stroke", "none")
  //       .style("opacity", 1)
  //       .on("mouseover", mouseover)
  //       .on("mousemove", mousemove)
  //       .on("mouseleave", mouseleave)

  //     addVColorBar(g, [-3, 3], myColor).attr(
  //       "transform",
  //       `translate(${innerWidth + 20}, 0)`
  //     )
  //   }

  //   if (dataFile) {
  //     fetch()
  //   }
  // }, [dataFile, search])

  return (
    <>
      {svg}

      {toolTipInfo && (
        <div
          ref={tooltipRef}
          className="absolute z-50 rounded-theme bg-black/60 p-3 text-xs text-white opacity-100"
          style={{
            left: toolTipInfo.pos.x,
            top: toolTipInfo.pos.y,
          }}
        >
          <p className="font-semibold">{`${points[toolTipInfo.cell.row]!.label}`}</p>
          <p>{`-log10(p): ${points[toolTipInfo.cell.row]!.p.toFixed(2)}`}</p>
          <p>{`Size: ${plot.gseaDot.sizes[toolTipInfo.cell.row]!}`}</p>
        </div>
      )}
    </>
  )
}
