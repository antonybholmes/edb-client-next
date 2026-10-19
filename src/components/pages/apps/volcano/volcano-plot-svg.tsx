import { useMemo, useRef } from 'react'

import { COLOR_BLACK } from '@/lib/color/color'
import { cellStr } from '@/lib/dataframe/cell'

import { AxisBottomSvg, AxisLeftSvg } from '../../../plot/axes/svg-axis'

import { SvgZoomCanvas } from '@/components/plot/svg-base'
import {
  DEFAULT_STROKE_PROPS,
  type IStrokeProps,
} from '@/components/plot/svg-props'

import { SvgLine } from '@/components/plot/svg-line'
import { SvgMargin } from '@/components/plot/svg-margin'

import { axisDomainToRangeFunc, axisLength } from '@/components/plot/axes/axis'
import { useAxis } from '@/components/plot/axes/plot-axes'
import { SvgRect } from '@/components/plot/svg-rect'
import { SvgText } from '@/components/plot/svg-text'
import { IPos } from '@/interfaces/pos'
import { svgPointToScreen } from '@/lib/graphics/svg'
import { makeUuid } from '@/lib/id'
import { ILim } from '@/lib/math/math'
import { CrosshairProvider, useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { IVolcanoPlot } from '../matcalc/history/history-provider/history-types'
import { useVolcanoContext } from './volcano-provider'
import { useVolcanoSettings } from './volcano-settings'

const MARGIN = { top: 100, right: 100, bottom: 100, left: 100 }

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
    //offset: number
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
    //offset: 15,
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
  labels: {
    color: COLOR_BLACK,

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
  size?: string
  sizeFunc?: (x: number) => number

  //displayOptions?: IVolcanoDisplayOptions
}

export function VolcanoPlotContent({ sizeFunc = (x: number) => x }: IProps) {
  const { plot, displayLabels, setLabels } = useVolcanoContext()

  const renderId = useRef(makeUuid())

  const { axis: xax } = useAxis({
    plotId: plot?.id ?? '',
    groupId: 'volcano',
    axisId: 'x',
  })

  const { axis: yax } = useAxis({
    plotId: plot?.id ?? '',
    groupId: 'volcano',
    axisId: 'y',
  })

  const { ref: svgRef } = useSVG()

  const { settings } = useVolcanoSettings()

  const displayOptions: IVolcanoDisplayOptions = plot
    ? (plot! as IVolcanoPlot).props
    : DEFAULT_VOLCANO_PROPS

  const { showCrosshair, hideCrosshair } = useCrosshair()

  const thresholdLogP = settings.preprocess.applyMinusLog10P
    ? -Math.log10(settings.pvalue.threshold)
    : settings.pvalue.threshold

  function getColor(
    logFc: number,
    logP: number,
    isLabel: boolean,
    props: IVolcanoDisplayOptions
  ) {
    let color = props.dots.color

    if (settings.labels.color.on) {
      if (isLabel) {
        color =
          logFc < 0
            ? settings.logFc.neg.fill.value
            : settings.logFc.pos.fill.value
      }
    } else {
      if (settings.pvalue.show && settings.logFc.show) {
        if (
          logP > thresholdLogP &&
          Math.abs(logFc) > settings.logFc.threshold
        ) {
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
    }

    return color
  }

  function handleVariantEnter(row: number, p: IPos) {
    const { relativeP, screenP } = svgPointToScreen(svgRef.current, p)

    showCrosshair({
      pos: relativeP,
      screenPos: screenP,
      content: (
        <>
          <span className="font-semibold">{`${plot.volcano.entries[row]!.id}`}</span>
          <span>{`${xax.title}: ${cellStr(points[row]!.x)}`}</span>
          <span>{`${yax.title}: ${cellStr(points[row]!.y)}`}</span>
        </>
      ),
    })
  }

  const points = useMemo(
    () =>
      (plot?.volcano.entries ?? []).map((e, i) => ({
        x: e.log2foldChange,
        y: e.logpvalue,
      })),
    [plot?.volcano.entries]
  )

  const { svg, width, height } = useMemo(() => {
    if (!plot || !xax || !yax) {
      return { svg: null, width: 0, height: 0 }
    }

    const innerWidth = axisLength(xax)
    const innerHeight = axisLength(yax)
    const width = innerWidth + MARGIN.left + MARGIN.right
    const height = innerHeight + MARGIN.top + MARGIN.bottom

    // matching is case insensitive
    const labelSet = new Set<string>(displayLabels.map((x) => x.toLowerCase()))

    const labelIdx = (plot?.volcano.entries ?? [])
      .map((v, vi) => ({ index: vi, value: v.id.toLowerCase() }))
      .filter((v) => labelSet.has(v.value))
      .map((v) => v.index)

    const xaf = axisDomainToRangeFunc(xax!)
    const yaf = axisDomainToRangeFunc(yax!)

    const yThreshold = yaf(thresholdLogP)

    renderId.current = makeUuid()

    const svg = (
      <>
        <SvgMargin margin={MARGIN}>
          {points.map((p, xi) => {
            const x1 = xaf(p.x)
            const y1 = yaf(p.y)
            const r = plot.volcano.entries[xi]!.size
              ? sizeFunc(plot.volcano.entries[xi]!.size)
              : displayOptions.dots.size

            const color = getColor(
              p.x,
              p.y,
              labelSet.has(plot.volcano.entries[xi]!.id.toLowerCase()),
              displayOptions
            )

            return (
              <circle
                cx={x1}
                cy={y1}
                r={r}
                fill={color}
                opacity={displayOptions.dots.opacity}
                key={xi}

                onPointerEnter={() =>
                  handleVariantEnter(xi, {
                    x: x1 + MARGIN.left,
                    y: y1 + MARGIN.top,
                  })
                }
                onPointerLeave={hideCrosshair}
                onDoubleClick={() => {
                  const label = plot.volcano.entries[xi]!.id
                  if (
                    displayLabels
                      .map((x) => x.toLowerCase())
                      .includes(label.toLowerCase())
                  ) {
                    setLabels(
                      displayLabels.filter(
                        (x) => x.toLowerCase() !== label.toLowerCase()
                      )
                    )
                  } else {
                    setLabels([...displayLabels, label].sort())
                  }
                }}
              />
            )
          })}
        </SvgMargin>

        <SvgMargin margin={MARGIN}>
          {labelIdx.map((i) => {
            const p = points[i]!
            const x1 = xaf(p.x)
            const y1 = yaf(p.y)
            const r = plot.volcano.entries[i]!.size
              ? sizeFunc(plot.volcano.entries[i]!.size)
              : displayOptions.dots.size

            return (
              <g key={`label-group-${i}-${renderId.current}`}>
                <SvgLine
                  id={`label-line-${i}`}
                  x1={x1 + (p.x >= 0 ? r + 1 : -(r + 1))}
                  y1={y1 - r - 1}
                  x2={
                    x1 +
                    (p.x >= 0
                      ? r + settings.labels.offset.x - 1
                      : -(r + settings.labels.offset.x - 1))
                  }
                  y2={y1 - r - settings.labels.offset.y + 1}
                  s={displayOptions.labels.line}
                />
                <SvgText
                  id={`label-text-${i}`}
                  x={
                    x1 +
                    (p.x >= 0
                      ? r + settings.labels.offset.x
                      : -(r + settings.labels.offset.x))
                  }
                  y={y1 - r - settings.labels.offset.y}
                  fill={displayOptions.labels.color}
                  textAnchor={p.x >= 0 ? 'start' : 'end'}
                >
                  {plot.volcano.entries[i]!.id}
                </SvgText>
              </g>
            )
          })}
        </SvgMargin>

        {settings.pvalue.line.show && (
          <SvgMargin margin={MARGIN}>
            <SvgLine
              x1={xaf(xax!.domain[0])}
              y1={yThreshold}
              x2={xaf(xax!.domain[1])}
              y2={yThreshold}
              s={settings.pvalue.line}
            />
          </SvgMargin>
        )}

        {displayOptions.border.show && (
          <SvgMargin margin={MARGIN}>
            <SvgRect
              width={innerWidth}
              height={innerHeight}

              sp={displayOptions.border}
            />
          </SvgMargin>
        )}

        <AxisLeftSvg
          ax={yax}
          pos={{ x: MARGIN.left, y: MARGIN.top }}
          tickSize={displayOptions.axes.yaxis.tickSize}
          strokeWidth={displayOptions.axes.yaxis.stroke.width}

          color={displayOptions.axes.yaxis.stroke.value}
        />
        <AxisBottomSvg
          ax={xax}
          pos={{ x: MARGIN.left, y: MARGIN.top + innerHeight }}
          tickSize={displayOptions.axes.xaxis.tickSize}
          strokeWidth={displayOptions.axes.xaxis.stroke.width}

          color={displayOptions.axes.xaxis.stroke.value}
        />
      </>
    )
    return { svg, width, height }
  }, [
    plot,
    xax,
    yax,
    thresholdLogP,
    displayOptions,
    displayLabels,
    sizeFunc,
    settings,
  ])

  return (
    <SvgZoomCanvas
      size={{ w: width, h: height }}

      //shapeRendering={SVG_CRISP_EDGES}
    >
      {svg}
    </SvgZoomCanvas>
  )
}

export function VolcanoPlotSvg({ sizeFunc = (x: number) => x }: IProps) {
  return (
    <CrosshairProvider>
      <VolcanoPlotContent sizeFunc={sizeFunc} />
    </CrosshairProvider>
  )
}
