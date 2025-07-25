import { useMemo } from 'react'

import { YAxis } from '@/components/plot/axis'
import { AxisLeftSvg } from '@components/plot/axis-svg'
import type { IPos } from '@interfaces/pos'
import { linspace } from '@lib/math/linspace'
import { median } from '@lib/math/median'

import { BaseSvg } from '@/components/base-svg'
import { KDE } from '@/lib/math/kde'
import { SwarmPlotSvg } from '@components/plot/box-whisker/swarm-plot-svg'
import { ViolinPlotSvg } from '@components/plot/box-whisker/violin-plot-svg'
import type { IDim } from '@interfaces/dim'
import type { ISVGProps } from '@interfaces/svg-props'
import { COLOR_BLACK } from '@lib/color/color'
import type { BaseDataFrame } from '@lib/dataframe/base-dataframe'
import { cellNum } from '@lib/dataframe/cell'
import { fill } from '@lib/fill'
import { q25, q75 } from '@lib/math/quartile'
import { range } from '@lib/math/range'
import { BoxWhiskerPlotSvg } from '../../../../../plot/box-whisker/box-whisker-plot-svg'
import {
  DEFAULT_FILL_PROPS,
  DEFAULT_MARGIN,
  DEFAULT_STROKE_PROPS,
  OPAQUE_FILL_PROPS,
  type IColorProps,
  type IMarginProps,
  type IStrokeProps,
  type LegendPos,
} from '../../../../../plot/svg-props'
import { usePlot } from '../../history/history-store'

/**
 * If strings are '0' and '1' for example, replace with 'No' and 'Yes' for
 * a more user friendly naming system. A hue called '0' seems unlikely
 * and poorly named so we assume it really represents a boolean.
 *
 *
 * @param hue
 * @returns
 */
export function cleanHue(hue: string): string {
  if (hue === '0') {
    return 'No'
  } else if (hue === '1') {
    return 'Yes'
  } else {
    return hue
  }
}

interface IBoxProps {
  show: boolean
  stroke: IStrokeProps
  fill: IColorProps
}

export interface IBoxPlotDisplayOptions {
  globalYAxis: boolean
  page: { scale: number }
  padding: {
    hue: number
    plot: number
  }
  box: IBoxProps & { width: number; median: { stroke: IStrokeProps } }
  violin: IBoxProps
  swarm: IBoxProps & { r: number }
  split: boolean
  plot: IDim
  margin: IMarginProps
  title: {
    offset: number
  }
  legend: {
    width: number
    show: boolean
    offset: number
    position: LegendPos
  }
}

export const DEFAULT_BOX_PLOT_DISPLAY_PROPS: IBoxPlotDisplayOptions = {
  box: {
    stroke: { ...DEFAULT_STROKE_PROPS },
    fill: { ...OPAQUE_FILL_PROPS },
    show: true,
    median: { stroke: { ...DEFAULT_STROKE_PROPS } },
    width: 25,
  },
  violin: {
    stroke: { ...DEFAULT_STROKE_PROPS },
    fill: { ...DEFAULT_FILL_PROPS },
    show: true,
  },
  swarm: {
    stroke: { ...DEFAULT_STROKE_PROPS },
    fill: { ...DEFAULT_FILL_PROPS },
    r: 3,
    show: false,
  },
  split: true,
  padding: {
    hue: 10,
    plot: 20,
  },
  plot: { w: 50, h: 200 },
  margin: { ...DEFAULT_MARGIN, right: 200 },
  page: {
    scale: 1,
  },
  globalYAxis: true,
  title: {
    offset: 20,
  },
  legend: {
    show: true,
    offset: 0,
    position: 'upper-right',
    width: 200,
  },
}

export interface ITooltip {
  pos: IPos
  //mutation: IMutation
}

interface IProps extends ISVGProps {
  plotAddr: string
}

export function BoxPlotSvg({ ref, plotAddr }: IProps) {
  //const { plotsState } = useContext(PlotsContext)

  const plot = usePlot(plotAddr)!

  //const)

  const displayOptions: IBoxPlotDisplayOptions = plot!.customProps
    .displayOptions as IBoxPlotDisplayOptions

  const singlePlotDisplayOptions = plot!.customProps
    .singlePlotDisplayOptions as {
    [key: string]: { [key: string]: IBoxPlotDisplayOptions }
  }

  const svg = useMemo(() => {
    const df: BaseDataFrame = plot!.dataframes['main']! as BaseDataFrame
    const x: string = plot!.customProps.x as string
    const y: string = plot!.customProps.y as string
    const hue: string = plot!.customProps.hue as string
    const xOrder: string[] = plot!.customProps.xOrder as string[]
    const hueOrder: string[] = plot!.customProps.hueOrder as string[]

    const xCol = df.col(x).strs
    const yCol = df.col(y).values
    const emptyHueColName = x //df.colName(x)
    const hueCol =
      hueOrder.length > 1
        ? df.col(hue).strs.map(v => cleanHue(v))
        : fill(emptyHueColName, df.shape[0])

    //console.log('hue', hueOrder)

    let split = displayOptions.split

    // if (!xOrder) {
    //   xOrder = [...new Set(xCol)].sort()
    // }

    // if (!hueOrder) {
    //   hueOrder = [...new Set(hueCol)].sort()
    // }

    // cannot draw split violin with more than 2 hues
    if (hueOrder.length !== 2) {
      split = false
    }

    const dataMap = new Map<string, Map<string, number[]>>()

    for (const i of range(df.shape[0])) {
      const x = xCol[i]!
      const y = cellNum(yCol[i]!)

      if (isNaN(y)) {
        continue
      }

      const hue = hueCol[i]!

      if (!dataMap.has(x)) {
        dataMap.set(x, new Map<string, []>())
      }

      if (!dataMap.get(x)!.has(hue)) {
        dataMap.get(x)!.set(hue, [])
      }

      dataMap.get(x)?.get(hue)?.push(y)
    }

    //console.log(dataMap)

    // for all results calculate the max number of significant
    // comparisons. This can be used to work out how much space
    // to allocate to stats whilst keeping the plots aligned
    const values: number[] = [...dataMap.entries()]
      .map(x =>
        [...x[1].entries()].map((hue: [string, number[]]) => hue[1]).flat()
      )
      .flat()

    const globalYAxis = new YAxis()
      .autoDomain([Math.min(...values), Math.max(...values)])
      .setLength(displayOptions.plot!.h)

    //
    // how big is the canvas
    //
    const margin = displayOptions.margin

    const innerWidth =
      xOrder!.length *
      ((!split && hueOrder!.length < 3 ? hueOrder!.length : 1) *
        (displayOptions.plot!.w + displayOptions.padding.hue) +
        displayOptions.padding.plot)

    //const innerWidth =
    // result.datasets.length * displayProps.plot!.bar.width + (result.datasets.length-1)*displayProps.plot!.gap
    //const innerHeight = displayProps.plot!.height
    const width =
      innerWidth + displayOptions.margin.left + displayOptions.margin.right
    const height = displayOptions.plot!.h + margin.top + margin.bottom

    const yax = globalYAxis

    const ysmoothed = linspace(yax.domain[0], yax.domain[1])

    let globalXsmoothedMax = 0

    for (const x of xOrder) {
      // get the min/max height

      for (const hue of hueOrder) {
        //console.log(x, hue)
        const values: number[] = dataMap.get(x)!.get(hue)!

        const kde = new KDE(values)

        const xsmoothed = kde.f(ysmoothed)

        //const kde = kernelDensityEstimation(values)

        //const xsmoothed = ysmoothed.map(v => kde(v))

        globalXsmoothedMax = Math.max(globalXsmoothedMax, ...xsmoothed)

        // zero the ends
        //xsmooth = [xsmooth[0]].concat(xsmooth).concat([xsmooth[xsmooth.length-1]])
      }
    }

    return (
      <BaseSvg
        ref={ref}
        scale={displayOptions.page.scale}
        width={width}
        height={height}
        //shapeRendering={SVG_CRISP_EDGES}
        className="absolute"
      >
        <g
          transform={`translate(${displayOptions.margin.left}, ${displayOptions.margin.top})`}
        >
          {xOrder.map((x, xi) => {
            // get the min/max height
            const blockWidth =
              (split && hueOrder!.length < 3 ? 1 : hueOrder!.length) *
              (displayOptions.plot!.w + displayOptions.padding.hue)

            const xX = xi * (blockWidth + displayOptions.padding.plot)

            return (
              <g transform={`translate(${xX}, 0)`} key={x}>
                <g
                  transform={`translate(${blockWidth / 2}, -${displayOptions.title.offset})`}
                >
                  <text textAnchor="middle">{x}</text>
                </g>

                {hueOrder!.map((hue, huei) => {
                  let hueX = 0

                  if (split && hueOrder!.length < 3) {
                    hueX = 0
                  } else {
                    hueX =
                      huei *
                      (displayOptions.plot!.w + displayOptions.padding.hue)
                  }

                  const values: number[] = dataMap.get(x)!.get(hue)!

                  const m: number = median(values)[0]

                  const q1: number = q25(values)[0]

                  const q3: number = q75(values)[0]

                  //console.log("medians", medians, q1s, q3s)

                  const plotOptions = singlePlotDisplayOptions[x]![hue]!

                  const violinStroke = {
                    ...displayOptions.violin.stroke,
                    color: plotOptions.violin.stroke.color,
                  }
                  const violinFill = {
                    ...displayOptions.violin.fill,
                    color: plotOptions.violin.fill.color,
                  }

                  const boxStroke = {
                    ...displayOptions.box.stroke,
                    color: plotOptions.box.stroke.color,
                  }
                  const boxFill = {
                    ...displayOptions.box.fill,
                    color: plotOptions.box.fill.color,
                  }
                  const boxMedianStroke = {
                    ...displayOptions.box.median.stroke,
                    color: plotOptions.box.median.stroke.color,
                  }

                  const swarmStroke = {
                    ...displayOptions.swarm.stroke,
                    color: plotOptions.swarm.stroke.color,
                  }
                  const swarmFill = {
                    ...displayOptions.swarm.fill,
                    color: plotOptions.swarm.fill.color,
                  }

                  return (
                    <g
                      transform={`translate(${hueX + 0.5 * displayOptions.plot!.w}, 0)`}
                      key={`${x}:${hue}`}
                    >
                      {displayOptions.violin.show && (
                        <ViolinPlotSvg
                          data={values}
                          //xsmooth={xsmoothed}
                          ysmooth={ysmoothed}
                          globalXMax={globalXsmoothedMax}
                          yax={yax}
                          width={displayOptions.plot!.w}
                          height={displayOptions.plot!.h}
                          stroke={violinStroke}
                          fill={violinFill}
                          mode={
                            split ? (huei === 0 ? 'left' : 'right') : 'full'
                          }
                        />
                      )}

                      {displayOptions.box.show && (
                        <BoxWhiskerPlotSvg
                          data={values}
                          q1={q1}
                          median={m}
                          q3={q3}
                          yax={yax}
                          width={displayOptions.box.width}
                          height={displayOptions.plot!.h}
                          fill={boxFill}
                          stroke={boxStroke}
                          medianStroke={boxMedianStroke}
                          mode={
                            split ? (huei === 0 ? 'left' : 'right') : 'full'
                          }
                        />
                      )}

                      {displayOptions.swarm.show && (
                        <SwarmPlotSvg
                          data={values}
                          yax={yax}
                          width={displayOptions.plot!.w}
                          height={displayOptions.plot!.h}
                          r={displayOptions.swarm.r}
                          fill={swarmFill}
                          stroke={swarmStroke}
                          mode={
                            split ? (huei === 0 ? 'left' : 'right') : 'full'
                          }
                        />
                      )}
                    </g>
                  )
                })}
              </g>
            )
          })}

          <g transform={`translate(-${displayOptions.padding.hue}, 0)`}>
            <AxisLeftSvg ax={yax} title={y} strokeWidth={2} />
            <g transform={`translate(0, ${displayOptions.plot!.h})`}>
              <line x2={innerWidth} stroke={COLOR_BLACK} strokeWidth={2} />
            </g>
          </g>

          <g
            transform={`translate(${innerWidth + displayOptions.padding.plot}, 0)`}
          >
            {hueOrder.map((hue, huei) => (
              <g transform={`translate(0, ${huei * 25})`} key={huei}>
                <rect
                  width={30}
                  height={10}
                  stroke={
                    singlePlotDisplayOptions[xOrder[0]!]![hue]!.violin.stroke
                      .color
                  }
                  fill={
                    singlePlotDisplayOptions[xOrder[0]!]![hue]!.violin.fill
                      .color
                  }
                  fillOpacity={
                    singlePlotDisplayOptions[xOrder[0]!]![hue]!.violin.fill
                      .alpha
                  }
                />
                <g transform={`translate(40, 5)`}>
                  <text
                    dominantBaseline="central"
                    //fontSize="smaller"
                    //textAnchor="middle"
                    //fontWeight="sembold"
                  >
                    {hue}
                  </text>
                </g>
              </g>
            ))}
          </g>
        </g>
      </BaseSvg>
    )
  }, [displayOptions, plot!.customProps])

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
