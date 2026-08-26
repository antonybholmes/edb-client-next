import { useCallback, useMemo, useRef, useState } from 'react'

import { COLOR_BLACK } from '@/lib/color/color'
import { cellStr } from '@/lib/dataframe/cell'

import { Axis, YAxis } from '../../../../../plot/axes/axis'
import { AxisBottomSvg, AxisLeftSvg } from '../../../../../plot/axes/svg-axis'

import { SvgBase } from '@/components/plot/svg-base'
import {
  DEFAULT_STROKE_PROPS,
  type IStrokeProps,
} from '@/components/plot/svg-props'

import { SvgLine } from '@/components/plot/svg-line'
import { SvgMargin } from '@/components/plot/svg-margin'
import type { SeriesData } from '@/lib/dataframe/series-data'

import { IPos } from '@/interfaces/pos'
import { svgPointToScreen } from '@/lib/graphics/svg'
import { ILim } from '@/lib/math/math'
import { useSVG } from '@/providers/svg-provider'
import { IVolcanoPlot } from '../../history/history-provider/history-types'
import { TOOLTIP_CLEAR_MS, type ITooltip } from '../heatmap/heatmap-svg'
import { useVolcanoContext } from './volcano-provider'
import { useVolcanoSettings } from './volcano-settings-store'

const MARGIN = { top: 100, right: 100, bottom: 100, left: 100 }

const TOOLTIP_OFFSET = 10

export interface IDisplayAxis {
  name: string
  domain: ILim
  length: number
  ticks: number[]
  tickLabels: string[]
  tickSize: number
  stroke: IStrokeProps
}

export const DEFAULT_AXIS_PROPS: IDisplayAxis = {
  name: '',
  domain: [-20, 20],
  length: 600,
  ticks: [],
  tickLabels: [],
  tickSize: 4,
  stroke: { ...DEFAULT_STROKE_PROPS, width: 2 },
}

export interface IScatterDisplayOptions {
  axes: {
    xaxis: IDisplayAxis
    yaxis: IDisplayAxis
  }

  padding: number

  //cmap: ColorMapName
  //scale: number

  dots: {
    color: string
    size: number
    opacity: number
  }

  labels: {
    color: string
    offset: number
    line: IStrokeProps
    values: string[]
    //auto: boolean
  }
}

export const DEFAULT_SCATTER_PROPS: IScatterDisplayOptions = {
  axes: {
    xaxis: { ...DEFAULT_AXIS_PROPS },
    yaxis: { ...DEFAULT_AXIS_PROPS },
  },
  padding: 10,
  dots: {
    size: 2,
    color: COLOR_BLACK,
    opacity: 0.75,
  },
  //cmap: 'bwr-v2',
  //scale: 1,
  labels: {
    color: COLOR_BLACK,
    offset: 15,
    line: { ...DEFAULT_STROKE_PROPS, opacity: 0.25 },
    values: [''],
    //auto: false,
  },
}

export function makeDefaultScatterProps(
  xlim: ILim,
  ylim: ILim
): IScatterDisplayOptions {
  let props: IScatterDisplayOptions = { ...DEFAULT_SCATTER_PROPS }

  props = {
    ...props,
    axes: {
      ...props.axes,
      xaxis: {
        ...props.axes.xaxis,
        domain: xlim,
      },
      yaxis: {
        ...props.axes.yaxis,
        domain: ylim,
      },
    },
  }

  return props
}

export interface IVolcanoDisplayOptions extends IScatterDisplayOptions {
  border: IStrokeProps
  // pvalue: {
  //   show: boolean
  //   threshold: number
  //   line: IStrokeProps
  //   // neg: {
  //   //   color: string
  //   // }
  //   // pos: {
  //   //   color: string
  //   // }
  // }
  // logFc: {
  //   show: boolean
  //   threshold: number

  //   neg: {
  //     color: string
  //   }
  //   pos: {
  //     color: string
  //   }
  // }
}

export const DEFAULT_VOLCANO_PROPS: IVolcanoDisplayOptions = {
  ...DEFAULT_SCATTER_PROPS,
  padding: 10,
  axes: {
    xaxis: {
      name: 'Log2 fold change',

      domain: [-20, 20],
      length: 500,
      ticks: [],
      tickLabels: [],
      tickSize: 4,

      stroke: { ...DEFAULT_STROKE_PROPS },
    },
    yaxis: {
      name: '-log10 p-value',
      domain: [0, 10],
      length: 400,
      ticks: [],
      tickLabels: [],
      tickSize: 4,
      stroke: { ...DEFAULT_STROKE_PROPS },
    },
  },

  //scale: 1,
  dots: {
    size: 3,
    color: '#d9d9d9',
    opacity: 0.75,
  },
  // pvalue: {
  //   threshold: 0.05, // p-0.05
  //   show: true,
  //   line: {
  //     ...DEFAULT_STROKE_PROPS,
  //     show: true,

  //     dasharray: '4',
  //   },
  // neg: {
  //   color: '#3366cc',
  // },
  // pos: {
  //   color: '#e62e00',
  // },
  //},

  // logFc: {
  //   threshold: 1,
  //   show: true,
  //   neg: {
  //     color: '#3366cc',
  //   },
  //   pos: {
  //     color: '#e62e00',
  //   },
  // },
  labels: {
    color: COLOR_BLACK,
    offset: 15,
    line: {
      ...DEFAULT_STROKE_PROPS,
      opacity: 0.25,
    },
    values: [],
    //auto: true,
  },
  border: { ...DEFAULT_STROKE_PROPS, width: 2, show: false },
}

interface IProps {
  x: string
  y: string
  size?: string
  sizeFunc?: (x: number) => number

  //displayOptions?: IVolcanoDisplayOptions
}

export function VolcanoPlotSvg({
  x,
  y,

  sizeFunc = (x: number) => x,
}: IProps) {
  const { plot, displayLabels } = useVolcanoContext()

  const { ref: svgRef } = useSVG()
  const containerRef = useRef<HTMLDivElement>(null)

  const { settings } = useVolcanoSettings()

  const displayOptions: IVolcanoDisplayOptions = (plot! as IVolcanoPlot).props

  const tooltipRef = useRef<HTMLDivElement>(null)

  const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

  const thresholdLogP = settings.preprocess.applyMinusLog10P
    ? -Math.log10(settings.pvalue.threshold)
    : settings.pvalue.threshold

  function getColor(
    logFc: number,
    logP: number,
    props: IVolcanoDisplayOptions
  ) {
    let color = props.dots.color

    if (settings.pvalue.show && settings.logFc.show) {
      if (logP > thresholdLogP && Math.abs(logFc) > settings.logFc.threshold) {
        color =
          logFc < 0
            ? settings.logFc.neg.fill.value
            : settings.logFc.pos.fill.value
      }
    } else {
      if (
        (settings.pvalue.show && logP > thresholdLogP) ||
        (settings.logFc.show && Math.abs(logFc) > settings.logFc.threshold)
      ) {
        color =
          logFc < 0
            ? settings.logFc.neg.fill.value
            : settings.logFc.pos.fill.value
      }
    }

    return color
  }

  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const handleVariantEnter = useCallback((row: number, p: IPos) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    const screenP = svgPointToScreen(svgRef.current, p)

    const rect = containerRef.current!.getBoundingClientRect()

    const newP = {
      x: screenP.x - rect.left,
      y: screenP.y - rect.top,
    }

    setToolTipInfo({
      ...toolTipInfo,
      pos: newP,
      cell: { row: row, col: 0 },
    })
  }, [])

  const handleVariantLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // wait before removing. if we re-enter quickly, the tooltip won't flicker
    // as this timeout will be cancelled so the tooltip won't disappear
    // and will be moved to next location
    timeoutRef.current = setTimeout(
      () => setToolTipInfo(null),
      TOOLTIP_CLEAR_MS
    )
  }, [])

  const points = useMemo(
    () =>
      plot.volcano.log2foldChanges.map((x, i) => ({
        x,
        y: plot.volcano.logpvalues[i]!,
      })),
    [plot.volcano.log2foldChanges, plot.volcano.logpvalues]
  )

  const { svg, width, height } = useMemo(() => {
    //const huedata = hue ? getNumCol(df, findCol(df, hue)) : []
    //const sizedata = size ? getNumCol(sheet, findCol(sheet, size)) : []

    const xax = new Axis()
      .autoDomain(displayOptions.axes.xaxis.domain)
      //.setDomain(displayOptions.xdomain)
      .setLength(displayOptions.axes.xaxis.length)

    const yax = new YAxis()
      .autoDomain(displayOptions.axes.yaxis.domain)
      //.setDomain(displayOptions.ydomain)
      .setLength(displayOptions.axes.yaxis.length)

    const innerWidth = xax.length
    const innerHeight = yax.length
    const width = innerWidth + MARGIN.left + MARGIN.right
    const height = innerHeight + MARGIN.top + MARGIN.bottom

    // matching is case insensitive
    const labelSet = new Set<string>(displayLabels.map((x) => x.toLowerCase()))
    const labelIdx = plot.volcano.ids
      .map((v, vi) => [v, vi] as [SeriesData, number])
      .filter((v) => labelSet.has((v[0] as string).toLowerCase()))
      .map((v) => v[1])

    const yThreshold = yax!.domainToRange(thresholdLogP)

    const svg = (
      <>
        <SvgMargin margin={MARGIN}>
          {points.map((p, xi) => {
            const x1 = xax!.domainToRange(p.x)
            const y1 = yax!.domainToRange(p.y)
            const r = plot.volcano.sizes
              ? sizeFunc(plot.volcano.sizes[xi]!)
              : displayOptions.dots.size

            const color = getColor(p.x, p.y, displayOptions)

            return (
              <circle
                cx={x1}
                cy={y1}
                r={r}
                fill={color}
                opacity={displayOptions.dots.opacity}
                key={xi}

                onMouseEnter={() =>
                  handleVariantEnter(xi, {
                    x: x1 + MARGIN.left + TOOLTIP_OFFSET,
                    y: y1 + MARGIN.top + TOOLTIP_OFFSET,
                  })
                }
                onMouseLeave={handleVariantLeave}
              />
            )
          })}
        </SvgMargin>

        <SvgMargin margin={MARGIN}>
          {labelIdx.map((i) => {
            const p = points[i]!
            const x1 = xax!.domainToRange(p.x)
            const y1 = yax!.domainToRange(p.y)
            const r = plot.volcano.sizes
              ? sizeFunc(plot.volcano.sizes[i]!)
              : displayOptions.dots.size

            return (
              <g key={i}>
                <SvgLine
                  x1={x1 + (p.x >= 0 ? r + 1 : -(r + 1))}
                  y1={y1 - r - 1}
                  x2={
                    x1 +
                    (p.x >= 0
                      ? r + displayOptions.labels.offset - 1
                      : -(r + displayOptions.labels.offset - 1))
                  }
                  y2={y1 - r - displayOptions.labels.offset + 1}
                  s={displayOptions.labels.line}
                />
                <text
                  x={
                    x1 +
                    (p.x >= 0
                      ? r + displayOptions.labels.offset
                      : -(r + displayOptions.labels.offset))
                  }
                  y={y1 - r - displayOptions.labels.offset}
                  fill={displayOptions.labels.color}
                  textAnchor={p.x >= 0 ? 'start' : 'end'}
                >
                  {plot.volcano.ids[i]!}
                </text>
              </g>
            )
          })}
        </SvgMargin>

        {settings.pvalue.line.show && (
          <SvgMargin margin={MARGIN}>
            <SvgLine
              x1={xax!.domainToRange(xax!.domain[0])}
              y1={yThreshold}
              x2={xax!.domainToRange(xax!.domain[1])}
              y2={yThreshold}
              s={settings.pvalue.line}
            />
          </SvgMargin>
        )}

        {displayOptions.border.show && (
          <SvgMargin margin={MARGIN}>
            <rect
              width={innerWidth}
              height={innerHeight}
              stroke={displayOptions.border.value}
              strokeWidth={displayOptions.border.width}
              fill="none"
            />
          </SvgMargin>
        )}

        <AxisLeftSvg
          ax={yax}
          pos={{ x: MARGIN.left, y: MARGIN.top }}
          tickSize={displayOptions.axes.yaxis.tickSize}
          strokeWidth={displayOptions.axes.yaxis.stroke.width}
          title={y}
          color={displayOptions.axes.yaxis.stroke.value}
        />
        <AxisBottomSvg
          ax={xax}
          pos={{ x: MARGIN.left, y: MARGIN.top + innerHeight }}
          tickSize={displayOptions.axes.xaxis.tickSize}
          strokeWidth={displayOptions.axes.xaxis.stroke.width}
          title={x}
          color={displayOptions.axes.xaxis.stroke.value}
        />
      </>
    )
    return { svg, width, height }
  }, [
    plot,
    y,
    thresholdLogP,
    displayOptions,
    displayLabels,
    sizeFunc,
    settings,
  ])

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
    <div className="relative" ref={containerRef}>
      <SvgBase
        width={width}
        height={height}
        scale={settings.scale}
        //shapeRendering={SVG_CRISP_EDGES}
        className="absolute"
      >
        {svg}
      </SvgBase>

      {toolTipInfo && (
        <div
          ref={tooltipRef}
          className="absolute z-50 rounded-theme bg-black/60 p-3 text-xs text-white opacity-100"
          style={{
            left: toolTipInfo.pos.x,
            top: toolTipInfo.pos.y,
          }}
        >
          <p className="font-semibold">{`${plot.volcano.ids[toolTipInfo.cell.row]!}`}</p>
          <p>{`x: ${cellStr(points[toolTipInfo.cell.row]!.x)}, y: ${cellStr(
            points[toolTipInfo.cell.row]!.y
          )}`}</p>
        </div>
      )}
    </div>
  )
}
