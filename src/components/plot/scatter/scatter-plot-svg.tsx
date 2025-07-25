import { useMemo } from 'react'

import { BWR_CMAP_V2, COLOR_MAPS, ColorMap } from '@lib/color/colormap'
import { BaseDataFrame, findCol } from '@lib/dataframe/base-dataframe'
import { getNumCol } from '@lib/dataframe/dataframe-utils'

import { BaseSvg } from '@/components/base-svg'
import type { ISVGProps } from '@/interfaces/svg-props'
import { COLOR_BLACK } from '@lib/color/color'
import type { SeriesData } from '@lib/dataframe/dataframe-types'
import type { ILim } from '@lib/math/math'
import { range } from '@lib/math/range'
import { Axis, YAxis } from '../axis'
import { AxisBottomSvg, AxisLeftSvg } from '../axis-svg'

const margin = { top: 100, right: 100, bottom: 100, left: 100 }

export interface IDisplayAxis {
  domain: ILim
  length: number
  ticks: number[]
  tickLabels: string[]
  tickSize: number
  strokeWidth: number
  color: string
}

export const DEFAULT_AXIS_PROPS: IDisplayAxis = {
  domain: [-20, 20],
  length: 600,
  ticks: [],
  tickLabels: [],
  tickSize: 4,
  strokeWidth: 2,
  color: COLOR_BLACK,
}

export interface IScatterDisplayOptions {
  axes: {
    xaxis: IDisplayAxis
    yaxis: IDisplayAxis
  }

  padding: number

  cmap: keyof typeof COLOR_MAPS
  scale: number

  dots: {
    color: string
    size: number
    opacity: number
  }

  labels: {
    color: string
    offset: number
    line: {
      color: string
      opacity: number
    }
    values: string[]
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
  cmap: 'BWR v2',
  scale: 1,
  labels: {
    color: COLOR_BLACK,
    offset: 15,
    line: {
      color: COLOR_BLACK,
      opacity: 0.25,
    },
    values: [''],
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

interface IProps extends ISVGProps {
  df: BaseDataFrame
  x: string
  y?: string
  hue?: string
  size?: string
  sizeFunc?: (x: number) => number
  displayProps?: IScatterDisplayOptions
  cmap?: ColorMap
}

export function ScatterPlotSvg({
  ref,
  df,
  x,
  y,
  hue,
  size,
  cmap = BWR_CMAP_V2,
  displayProps,
  sizeFunc = (x: number) => x,
}: IProps) {
  const _displayProps: IScatterDisplayOptions = {
    ...DEFAULT_SCATTER_PROPS,
    ...displayProps,
  }

  const svg = useMemo(() => {
    if (!df) {
      return null
    }

    console.log(df.colNames, x)

    const xdata = getNumCol(df, findCol(df, x))

    const ydata = y ? getNumCol(df, findCol(df, y)) : range(df.shape[0])

    // give y a default name
    if (!y) {
      y = df.colName(0)
    }

    const huedata = hue ? getNumCol(df, findCol(df, hue)) : []
    const sizedata = size ? getNumCol(df, findCol(df, size)) : []

    const xax = new Axis()
      //.autoDomain([Math.min(...xdata), Math.max(...xdata)])
      .setDomain(_displayProps.axes.xaxis.domain)
      .setLength(_displayProps.axes.xaxis.length)

    const yax = new YAxis()
      //.autoDomain([Math.min(...ydata), Math.max(...ydata)])
      .setDomain(_displayProps.axes.yaxis.domain)
      .setLength(_displayProps.axes.yaxis.length)

    const innerWidth = xax.length
    const innerHeight = yax.length
    const width = innerWidth + margin.left + margin.right
    const height = innerHeight + margin.top + margin.bottom

    // matching is case insensitive
    const labelSet = new Set<string>(
      _displayProps.labels.values.map(x => x.toLowerCase())
    )
    const labelIdx = df.index.values
      .map((v, vi) => [v, vi] as [SeriesData, number])
      .filter(v => labelSet.has(v[0].toString().toLowerCase()))
      .map(v => v[1])

    return (
      <BaseSvg
        ref={ref}
        width={width}
        height={height}
        scale={_displayProps.scale}
        //shapeRendering={SVG_CRISP_EDGES}
        className="absolute"
      >
        <AxisLeftSvg
          ax={yax}
          pos={{ x: margin.left, y: margin.top }}
          tickSize={_displayProps.axes.yaxis.tickSize}
          title={y}
        />
        <AxisBottomSvg
          ax={xax}
          pos={{ x: margin.left, y: margin.top + innerHeight }}
          tickSize={_displayProps.axes.xaxis.tickSize}
          title={x}
        />

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {xdata.map((x, xi) => {
            const x1 = xax!.domainToRange(x)
            const y1 = yax!.domainToRange(ydata[xi]!)
            const r =
              sizedata.length > 0
                ? sizeFunc(sizedata[xi]!)
                : _displayProps.dots.size
            const color =
              huedata.length > 0 ? cmap.getHexColor(huedata[xi]!) : COLOR_BLACK
            return <circle cx={x1} cy={y1} r={r} fill={color} key={xi} />
          })}
        </g>

        <g transform={`translate(${margin.left}, ${margin.top})`}>
          {labelIdx.map(i => {
            const x1 = xax!.domainToRange(xdata[i]!)
            const y1 = yax!.domainToRange(ydata[i]!)

            return (
              <text x={x1} y={y1} key={i}>
                {df.index.get(i).toString()}
              </text>
            )
          })}
        </g>
      </BaseSvg>
    )
  }, [df, y, displayProps, sizeFunc])

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

  return <>{svg}</>
}
