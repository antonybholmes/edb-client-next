import { useCallback, useMemo, useRef, useState } from 'react'
import { useGseaBubbleSettings } from './gsea-bubble-settings-store'

import { COLOR_BLACK } from '@/lib/color/color'

import { Axis } from '../../../../../plot/axis'
import { AxisBottomSvg } from '../../../../../plot/svg-axis'

import { SvgBase } from '@/components/plot/svg-base'
import type { ISVGProps } from '@/interfaces/svg-props'

import { VColorBarSvg } from '@/components/plot/color-bar-svg'
import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgText } from '@/components/plot/svg-text'
import { COLOR_MAPS, ColorMap, getColorMap } from '@/lib/color/colormap'
import { linspace } from '@/lib/math/linspace'

import type { ITooltip } from '../../../matcalc/apps/heatmap/heatmap-svg'
import { IDisplayAxis } from '../../../matcalc/apps/volcano/volcano-plot-svg'
import { useGseaBubbleContext } from './gsea-bubble-provider'

const TOOLTIP_OFFSET = 10

// export const COLOR_MAP = new ColorMap('Volcano', [
//   '#3366cc',
//   '#cccccc',
//   '#e62e00',
// ])

export interface IGseaBubbleDisplayOptions {
  axes: {
    xaxis: IDisplayAxis
  }

  scale: number
}

export const DEFAULT_GSEA_DOT_PROPS: IGseaBubbleDisplayOptions = {
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
  },

  scale: 1,
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

  //displayProps?: IVolcanodisplayProps
}

export function GseaBubblePlotSvg({
  ref,

  sizeFunc = (x: number) => x,
}: IProps) {
  const { plot, displayProps } = useGseaBubbleContext()

  const { settings } = useGseaBubbleSettings()

  const tooltipRef = useRef<HTMLDivElement>(null)

  const [toolTipInfo, setToolTipInfo] = useState<ITooltip | null>(null)

  const timeoutRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const points = useMemo(
    () =>
      plot.gseaDot.nes.values.map((x, i) => {
        const size = plot.gseaDot.sizes.values[i]!
        const sizeF = Math.min(size / settings.size.maxSize, 1)
        return {
          x,
          y: i + 1,
          p: plot.gseaDot.log10pvalues.values[i]!,
          color: getColor(
            plot.gseaDot.log10pvalues.values[i]!,
            settings.p.range[1],
            getColorMap(settings.p.cmap)
          ),
          size: sizeF,
          r: sizeF * settings.bubbles.size,
          label: plot.gseaDot.ids[i]!,
        }
      }),
    [
      plot.gseaDot.nes.values,
      plot.gseaDot.sizes.values,
      settings.size.maxSize,
      settings.bubbles.size,
      settings.p,
      settings.margin,
      settings.padding,
      settings.legend,
      settings.border,
      settings.axes,
      settings.bubbles,
    ]
  )

  const handleVariantEnter = useCallback(
    (row: number, x1: number, y1: number) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      setToolTipInfo({
        ...toolTipInfo,
        pos: {
          x: x1 + settings.margin.left + TOOLTIP_OFFSET,
          y: y1 + settings.margin.top + TOOLTIP_OFFSET,
        },
        cell: { row: row, col: 0 },
      })
    },
    []
  )

  const handleVariantLeave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // wait before removing. if we re-enter quickly, the tooltip won't flicker
    // as this timeout will be cancelled so the tooltip won't disappear
    // and will be moved to next location
    timeoutRef.current = setTimeout(() => setToolTipInfo(null), 300)
  }, [])

  const svg = useMemo(() => {
    //const huedata = hue ? getNumCol(df, findCol(df, hue)) : []

    const xax = new Axis()
      .autoDomain(displayProps.axes.xaxis.domain)
      //.setDomain(displayProps.xdomain)
      .setLength(settings.axes.x.length)

    const innerWidth = xax.length
    const innerHeight =
      settings.axes.y.rowHeight * (plot.gseaDot.nes.values.length + 1)
    const width = innerWidth + settings.margin.left + settings.margin.right
    const height = innerHeight + settings.margin.top + settings.margin.bottom
    const cmap = COLOR_MAPS[settings.p.cmap]!

    //console.log('innerWidth:', innerWidth, 'innerHeight:', innerHeight)

    let sizes = settings.legend.dots.sizes

    if (sizes.length === 0) {
      // skip 0
      sizes = linspace(0, settings.size.maxSize, 5).slice(1)
    }

    const dotLegendPos = []

    let y = 0

    for (const [si, s] of sizes.entries()) {
      const d = Math.min(s, settings.size.maxSize)

      const r1 = Math.min(d / settings.size.maxSize, 1) * settings.bubbles.size
      dotLegendPos.push({ label: d.toFixed(0), r: r1, y })

      if (si < sizes.length - 1) {
        const r2 =
          Math.min(sizes[si + 1]! / settings.size.maxSize, 1) *
          settings.bubbles.size
        y += r1 + r2 + settings.padding
      }
    }

    return (
      <SvgBase ref={ref} width={width} height={height} scale={settings.scale}>
        <SvgMargin margin={settings.margin}>
          {points.map((p, xi) => {
            const x1 = xax!.domainToRange(p.x)
            const y1 = p.y * settings.axes.y.rowHeight

            return (
              <SvgCircle
                cx={x1}
                cy={y1}
                r={p.r}
                fill={p.color}
                fp={settings.bubbles.fill}
                sp={settings.bubbles.stroke}
                key={xi}
                onMouseLeave={handleVariantLeave}
                onMouseEnter={() => {
                  handleVariantEnter(xi, x1, y1)
                }}
              />
            )
          })}
        </SvgMargin>

        <g
          transform={`translate(${settings.margin.left - settings.padding}, ${settings.margin.top})`}
        >
          {points.map((p, xi) => {
            const y1 = p.y * settings.axes.y.rowHeight

            return (
              <SvgText key={xi} y={y1} textAnchor="end">
                {p.label}
              </SvgText>
            )
          })}
        </g>

        {settings.border.show && (
          <SvgMargin margin={settings.margin}>
            <rect
              width={innerWidth}
              height={innerHeight}
              stroke={settings.border.value}
              strokeWidth={settings.border.width}
              fill="none"
            />
          </SvgMargin>
        )}

        <AxisBottomSvg
          ax={xax}
          pos={{
            x: settings.margin.left,
            y: settings.margin.top + innerHeight,
          }}
          tickSize={displayProps.axes.xaxis.tickSize}
          strokeWidth={displayProps.axes.xaxis.strokeWidth}
          title={plot.gseaDot.nes.label}
          color={displayProps.axes.xaxis.color}
        />

        {settings.colorbar.show &&
          settings.colorbar.position.includes('right') && (
            <g
              transform={`translate(${settings.margin.left + innerWidth + settings.padding * 5}, ${settings.margin.top})`}
            >
              <g id="p-legend">
                <SvgText
                  x={settings.colorbar.size.h / 2}
                  y={0}
                  textAnchor="middle"
                >
                  {`-log10(${plot.gseaDot.log10pvalues.label})`}
                </SvgText>
                <g transform={`translate(0, ${settings.padding * 2})`}>
                  <VColorBarSvg
                    domain={settings.p.range}
                    cmap={cmap}
                    size={settings.colorbar.size}
                    ticks={[
                      settings.p.range[0],
                      settings.p.range[1] / 2,
                      settings.p.range[1],
                    ]}
                    //stroke={displayProps.colorbar.stroke}
                    //font={displayProps.legend}
                  />
                </g>
              </g>
              <g
                id="dot-legend"
                transform={`translate(0, ${settings.colorbar.size.w + settings.padding * 5})`}
              >
                <SvgText
                  x={settings.colorbar.size.h / 2}
                  y={0}
                  textAnchor="middle"
                >
                  {plot.gseaDot.sizes.label}
                </SvgText>
                <g
                  transform={`translate(0, ${settings.padding + settings.bubbles.size})`}
                >
                  {dotLegendPos.map((d, di) => (
                    <g key={di}>
                      <SvgCircle
                        key={di}
                        cx={settings.colorbar.size.h / 2}
                        cy={d.y}
                        r={d.r}
                        stroke="black"
                      />
                      <SvgText
                        x={
                          settings.colorbar.size.h / 2 +
                          settings.bubbles.size +
                          settings.padding
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

        {/* {displayProps.colorbar.show &&
          displayProps.colorbar.position.includes('bottom') && (
            <g
              transform={`translate(${displayProps.margin.left}, ${displayProps.margin.top + innerHeight + 100})`}
            >
              <HColorBarSvg
                domain={displayProps.p.range}
                cmap={cmap}
                size={displayProps.colorbar.size}
                //stroke={displayProps.colorbar.stroke}
                //font={displayProps.legend}
              />
            </g>
          )} */}
      </SvgBase>
    )
  }, [plot, points, displayProps, settings])

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
          <p>{`${plot.gseaDot.nes.label}: ${plot.gseaDot.nes.values[toolTipInfo.cell.row]!.toFixed(2)}`}</p>
          <p>{`-log10(${plot.gseaDot.log10pvalues.label}): ${points[toolTipInfo.cell.row]!.p.toFixed(2)}`}</p>
          <p>{`${plot.gseaDot.sizes.label}: ${plot.gseaDot.sizes.values[toolTipInfo.cell.row]!}`}</p>
        </div>
      )}
    </>
  )
}
