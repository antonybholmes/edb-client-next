import { type IFieldMap } from '@interfaces/field-map'
import { useMemo } from 'react'

import { BLUES_CMAP, ColorMap } from '@lib/color/colormap'
import { BaseDataFrame } from '@lib/dataframe/base-dataframe'

import { Axis, YAxis, type TickLabel } from './axis'
import { AxisBottomSvg, AxisLeftSvg } from './axis-svg'
import { VColorBarSvg } from './color-bar-svg'

import type { ISVGProps } from '@/interfaces/svg-props'
import { fill } from '@lib/fill'
import type { ILim } from '@lib/math/math'
import { ones } from '@lib/math/ones'
import { BaseSvg } from '../base-svg'

const margin = { top: 100, right: 100, bottom: 100, left: 200 }

export interface IDisplayAxis {
  domain: ILim
  range: ILim
  ticks: number[] | null
  tickLabels: string[] | null
}

export interface IDisplayProps {
  xdomain: ILim | undefined
  xlen: number
  xticks: number[] | undefined
  xtickLabels: TickLabel[] | undefined
  ydomain: ILim | undefined
  ylen: number
  yticks: number[] | undefined
  ytickLabels: TickLabel[] | undefined
  padding: number
  scale: number
  tickSize: number
  barWidth: number
}

export const DEFAULT_DISPLAY_PROPS: IDisplayProps = {
  xdomain: undefined,
  xlen: 500,
  xticks: undefined,
  xtickLabels: undefined,
  ydomain: undefined,
  ylen: 500,
  yticks: undefined,
  ytickLabels: undefined,
  padding: 10,
  scale: 5,
  tickSize: 5,
  barWidth: 2,
}

interface IProps extends ISVGProps {
  df: BaseDataFrame
  x: string
  y: string
  hue?: string
  barWidth?: number
  hue_norm?: (x: number) => number
  displayProps?: IFieldMap
  cmap?: ColorMap
}

export function VertBarPlotSvg({
  ref,
  df,
  x,
  y,
  hue,
  cmap = BLUES_CMAP,
  barWidth = 2,
  displayProps = {},
  hue_norm = x => x,
}: IProps) {
  const _displayProps: IDisplayProps = {
    ...DEFAULT_DISPLAY_PROPS,
    ...displayProps,
  }

  const ycol = df.col(y)

  const ydata = ycol.values as string[] //getNumCol(df, findCol(df, x))

  const xcol = df.col(x)

  const xdata = x ? (xcol.values as number[]) : ones(df.shape[0])

  // give y a default name
  if (!x) {
    x = 'Data' //df.getColName(0)
  }

  const yax = new YAxis()
    .setDomain([0, ydata.length])
    .setDomain(_displayProps.ydomain!)
    .setLength(_displayProps.ylen!)
    .setTicks(ydata.map((x, xi) => ({ v: xi + 0.5, label: x })))

  //.setTitle(y)

  // min and max must be different
  const xax = new Axis()
    .setDomain([Math.min(...xdata), Math.max(...xdata)])
    .setDomain(_displayProps.xdomain!)
    .setLength(_displayProps.xlen!)
  //.setTitle(x)

  const innerWidth = xax.length
  const innerHeight = yax.length
  const width = innerWidth + margin.left + margin.right
  const height = innerHeight + margin.top + margin.bottom

  const svg = useMemo(() => {
    let huedata: string[]

    if (hue) {
      const huecol = df.col(hue)!
      huedata = (huecol.values as number[]).map(x =>
        cmap.getHexColor(hue_norm(x))
      )
    } else {
      huedata = fill('cornflowerblue', xdata.length)
    }

    return (
      <>
        <AxisLeftSvg
          ax={yax}
          pos={{ x: margin.left, y: margin.top }}
          tickSize={_displayProps.tickSize}
          //title={y}
        />
        <AxisBottomSvg
          ax={xax}
          pos={{ x: margin.left, y: margin.top + innerHeight }}
          tickSize={_displayProps.tickSize}
          title={x}
        />

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {ydata.map((_, yi) => {
            const y1 = yax.domainToRange(yi + 0.5)
            const x1 = xax.domainToRange(xdata[yi]!)

            const color = huedata[yi]
            return (
              <rect
                x={0}
                y={y1 - 0.5 * barWidth}
                width={x1}
                height={barWidth}
                fill={color}
                key={yi}
              />
            )
          })}
        </g>

        <g
          transform={`translate(${
            margin.left + innerWidth + _displayProps.padding
          }, ${margin.top})`}
        >
          {VColorBarSvg({ domain: [0, 10], cmap })}
        </g>
      </>
    )
  }, [df, y, displayProps])

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
    <BaseSvg
      ref={ref}
      width={width}
      height={height}
      scale={_displayProps.scale}
      //shapeRendering={SVG_CRISP_EDGES}
      className="absolute"
    >
      {svg}
    </BaseSvg>
  )
}
