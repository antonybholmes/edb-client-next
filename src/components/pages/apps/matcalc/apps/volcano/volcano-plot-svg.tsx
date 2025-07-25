import { useMemo, useRef, useState } from 'react'

import { BaseDataFrame, findCol } from '@lib/dataframe/base-dataframe'
import { getNumCol } from '@lib/dataframe/dataframe-utils'

import { COLOR_BLACK } from '@lib/color/color'
import { cellStr } from '@lib/dataframe/cell'
import type { SeriesData } from '@lib/dataframe/dataframe-types'
import { Axis, YAxis } from '../../../../../plot/axis'
import { AxisBottomSvg, AxisLeftSvg } from '../../../../../plot/axis-svg'
import { usePlot } from '../../history/history-store'

import { BaseSvg } from '@/components/base-svg'
import type { ISVGProps } from '@interfaces/svg-props'
import {
  DEFAULT_SCATTER_PROPS,
  type IScatterDisplayOptions,
} from '../../../../../plot/scatter/scatter-plot-svg'
import type { ITooltip } from '../heatmap/heatmap-svg'

const MARGIN = { top: 100, right: 100, bottom: 100, left: 100 }

const TOOLTIP_OFFSET = 10

// export const COLOR_MAP = new ColorMap('Volcano', [
//   '#3366cc',
//   '#cccccc',
//   '#e62e00',
// ])

export interface IVolcanoDisplayOptions extends IScatterDisplayOptions {
  border: {
    show: boolean
    color: string
    strokeWidth: number
  }
  logP: {
    show: boolean
    threshold: number
    line: {
      show: boolean
      color: string
      dash: number
    }
    neg: {
      color: string
    }
    pos: {
      color: string
    }
  }
  logFc: {
    show: boolean
    threshold: number

    neg: {
      color: string
    }
    pos: {
      color: string
    }
  }
}

export const DEFAULT_VOLCANO_PROPS: IVolcanoDisplayOptions = {
  ...DEFAULT_SCATTER_PROPS,
  padding: 10,
  axes: {
    xaxis: {
      domain: [-20, 20],
      length: 500,
      ticks: [],
      tickLabels: [],
      tickSize: 4,
      strokeWidth: 1,
      color: COLOR_BLACK,
    },
    yaxis: {
      domain: [0, 10],
      length: 400,
      ticks: [],
      tickLabels: [],
      tickSize: 4,
      strokeWidth: 1,
      color: COLOR_BLACK,
    },
  },

  scale: 1,
  dots: {
    size: 3,
    color: '#d9d9d9',
    opacity: 0.75,
  },
  logP: {
    threshold: 1.30102999566398,
    show: true,
    line: {
      show: true,
      color: COLOR_BLACK,
      dash: 4,
    },
    neg: {
      color: '#3366cc',
    },
    pos: {
      color: '#e62e00',
    },
  },

  logFc: {
    threshold: 1,
    show: true,
    neg: {
      color: '#3366cc',
    },
    pos: {
      color: '#e62e00',
    },
  },
  labels: {
    color: COLOR_BLACK,
    offset: 15,
    line: {
      color: COLOR_BLACK,
      opacity: 0.25,
    },
    values: [],
  },
  border: {
    show: false,
    color: COLOR_BLACK,
    strokeWidth: 2,
  },
}

function getColor(logFc: number, logP: number, props: IVolcanoDisplayOptions) {
  let color = props.dots.color

  if (props.logP.show && props.logFc.show) {
    if (
      logP > props.logP.threshold &&
      Math.abs(logFc) > props.logFc.threshold
    ) {
      color = logFc < 0 ? props.logFc.neg.color : props.logFc.pos.color
    }
  } else {
    if (
      (props.logP.show && logP > props.logP.threshold) ||
      (props.logFc.show && Math.abs(logFc) > props.logFc.threshold)
    ) {
      color = logFc < 0 ? props.logFc.neg.color : props.logFc.pos.color
    }
  }

  return color
}

interface IProps extends ISVGProps {
  plotAddr: string
  x: string
  y: string
  size?: string
  sizeFunc?: (x: number) => number

  //displayOptions?: IVolcanoDisplayOptions
}

export function VolcanoPlotSvg({
  ref,
  x,
  y,
  size,
  //displayOptions = { ...DEFAULT_VOLCANO_PROPS },
  sizeFunc = (x: number) => x,
  plotAddr,
}: IProps) {
  const plot = usePlot(plotAddr)!

  const displayOptions: IVolcanoDisplayOptions = plot!.customProps
    .displayOptions as IVolcanoDisplayOptions

  const sheet = plot!.dataframes['main']! as BaseDataFrame

  const tooltipRef = useRef<HTMLDivElement>(null)

  const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

  const _xdata = getNumCol(sheet, findCol(sheet, x))

  const _ydata = getNumCol(sheet, findCol(sheet, y))

  const points = _xdata.map((x, i) => ({
    x,
    y: _ydata[i]!,
  }))

  const svg = useMemo(() => {
    //const huedata = hue ? getNumCol(df, findCol(df, hue)) : []
    const sizedata = size ? getNumCol(sheet, findCol(sheet, size)) : []

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
    const labelSet = new Set<string>(
      displayOptions.labels.values.map(x => x.toLowerCase())
    )
    const labelIdx = sheet.index.values
      .map((v, vi) => [v, vi] as [SeriesData, number])
      .filter(v => labelSet.has((v[0] as string).toLowerCase()))
      .map(v => v[1])

    return (
      <BaseSvg
        ref={ref}
        width={width}
        height={height}
        scale={displayOptions.scale}
        //shapeRendering={SVG_CRISP_EDGES}
        className="absolute"
      >
        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {points.map((p, xi) => {
            const x1 = xax!.domainToRange(p.x)
            const y1 = yax!.domainToRange(p.y)
            const r =
              sizedata.length > 0
                ? sizeFunc(sizedata[xi]!)
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
                onMouseLeave={() => setToolTipInfo(null)}
                onMouseEnter={() => {
                  setToolTipInfo({
                    ...toolTipInfo,
                    pos: {
                      x: x1 + MARGIN.left + TOOLTIP_OFFSET,
                      y: y1 + MARGIN.top + TOOLTIP_OFFSET,
                    },
                    cell: { row: xi, col: 0 },
                  })
                }}
              />
            )
          })}
        </g>

        <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
          {labelIdx.map(i => {
            const p = points[i]!
            const x1 = xax!.domainToRange(p.x)
            const y1 = yax!.domainToRange(p.y)
            const r =
              sizedata.length > 0
                ? sizeFunc(sizedata[i]!)
                : displayOptions.dots.size

            return (
              <g key={i}>
                <line
                  x1={x1 + (p.x >= 0 ? r + 1 : -(r + 1))}
                  y1={y1 - r - 1}
                  x2={
                    x1 +
                    (p.x >= 0
                      ? r + displayOptions.labels.offset - 1
                      : -(r + displayOptions.labels.offset - 1))
                  }
                  y2={y1 - r - displayOptions.labels.offset + 1}
                  stroke={displayOptions.labels.line.color}
                  opacity={displayOptions.labels.line.opacity}
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
                  {sheet.index.get(i).toString()}
                </text>
              </g>
            )
          })}
        </g>

        {displayOptions.logP.line.show && (
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            <line
              x1={xax!.domainToRange(xax!.domain[0])}
              y1={yax!.domainToRange(displayOptions.logP.threshold)}
              x2={xax!.domainToRange(xax!.domain[1])}
              y2={yax!.domainToRange(displayOptions.logP.threshold)}
              stroke={displayOptions.logP.line.color}
              strokeDasharray={displayOptions.logP.line.dash}
            />
          </g>
        )}

        {displayOptions.border.show && (
          <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
            <rect
              width={innerWidth}
              height={innerHeight}
              stroke={displayOptions.border.color}
              strokeWidth={displayOptions.border.strokeWidth}
              fill="none"
            />
          </g>
        )}

        <AxisLeftSvg
          ax={yax}
          pos={{ x: MARGIN.left, y: MARGIN.top }}
          tickSize={displayOptions.axes.yaxis.tickSize}
          strokeWidth={displayOptions.axes.yaxis.strokeWidth}
          title={y}
          color={displayOptions.axes.yaxis.color}
        />
        <AxisBottomSvg
          ax={xax}
          pos={{ x: MARGIN.left, y: MARGIN.top + innerHeight }}
          tickSize={displayOptions.axes.xaxis.tickSize}
          strokeWidth={displayOptions.axes.xaxis.strokeWidth}
          title={x}
          color={displayOptions.axes.xaxis.color}
        />
      </BaseSvg>
    )
  }, [sheet, y, displayOptions, sizeFunc])

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
  //     //   console.log("dd", d.group)
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
          <p className="font-semibold">{`${sheet.rowName(
            toolTipInfo.cell.row
          )}`}</p>
          <p>{`x: ${cellStr(points[toolTipInfo.cell.row]!.x)}, y: ${cellStr(
            points[toolTipInfo.cell.row]!.y
          )}`}</p>
        </div>
      )}
    </>
  )
}
