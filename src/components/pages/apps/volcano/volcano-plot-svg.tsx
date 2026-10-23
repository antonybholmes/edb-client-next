import { useMemo, useRef } from 'react'

import { COLOR_BLACK } from '@/lib/color/color'
import { cellStr } from '@/lib/dataframe/cell'

import { AxisBottomSvg, AxisLeftSvg } from '../../../plot/axes/svg-axis'

import { SvgZoomCanvas } from '@/components/plot/svg-base'
import {
  DEFAULT_FILL_PROPS,
  DEFAULT_STROKE_PROPS,
  IPaintProps,
  type IStrokeProps,
} from '@/components/plot/svg-props'

import { SvgLine } from '@/components/plot/svg-line'
import { SvgMargin } from '@/components/plot/svg-margin'

import { axisDomainToRangeFunc, axisLength } from '@/components/plot/axes/axis'
import { useAxis } from '@/components/plot/axes/plot-axes'
import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgPath } from '@/components/plot/svg-path'
import { SvgRect } from '@/components/plot/svg-rect'
import { SvgText } from '@/components/plot/svg-text'
import { IPos } from '@/interfaces/pos'
import { svgPointToScreen } from '@/lib/graphics/svg'
import { newUuid } from '@/lib/id'
import { clamp } from '@/lib/math/clamp'
import { ILim } from '@/lib/math/math'
import { CrosshairProvider, useCrosshair } from '@/providers/crosshair-provider'
import { useSVG } from '@/providers/svg-provider'
import { IVolcanoPlot } from '../matcalc/history/history-provider/history-types'
import { useVolcanoContext } from './volcano-provider'
import { IVolcanoSettings, useVolcanoSettings } from './volcano-settings'

export interface IDisplayAxis {
  name: string
  domain: ILim
  length: number
  //ticks: number[]
  //tickLabels: string[]
  //tickSize: number
  //stroke: IStrokeProps
}

export const DEFAULT_AXIS_PROPS: IDisplayAxis = {
  name: '',
  domain: [-20, 20],
  length: 600,
  //ticks: [],
  //tickLabels: [],
  //tickSize: 4,
  //stroke: { ...DEFAULT_STROKE_PROPS, width: 2 },
}

export interface IScatterDisplayOptions {
  axes: {
    xaxis: IDisplayAxis
    yaxis: IDisplayAxis
  }

  padding: number

  //cmap: ColorMapName
  //scale: number

  dots: IPaintProps & {
    size: number
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
    ...DEFAULT_FILL_PROPS,
    size: 2,

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

// export function makeDefaultScatterProps(
//   xlim: ILim,
//   ylim: ILim
// ): IScatterDisplayOptions {
//   let props: IScatterDisplayOptions = { ...DEFAULT_SCATTER_PROPS }

//   props = {
//     ...props,
//     axes: {
//       ...props.axes,
//       xaxis: {
//         ...props.axes.xaxis,
//         domain: xlim,
//       },
//       yaxis: {
//         ...props.axes.yaxis,
//         domain: ylim,
//       },
//     },
//   }

//   return props
// }

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
  // axes: {
  //   xaxis: {
  //     name: 'Log2 fold change',

  //     domain: [-20, 20],
  //     length: 500,
  //     ticks: [],
  //     tickLabels: [],
  //     tickSize: 4,

  //     stroke: { ...DEFAULT_STROKE_PROPS },
  //   },
  //   yaxis: {
  //     name: '-log10 p-value',
  //     domain: [0, 10],
  //     length: 400,
  //     ticks: [],
  //     tickLabels: [],
  //     tickSize: 4,
  //     stroke: { ...DEFAULT_STROKE_PROPS },
  //   },
  // },

  //scale: 1,
  dots: {
    ...DEFAULT_FILL_PROPS,
    size: 3,

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
}

export function VolcanoPlotContent({ sizeFunc = (x: number) => x }: IProps) {
  const { plot, displayLabels, setLabels } = useVolcanoContext()

  const renderId = useRef(newUuid())

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

  const { settings, cmap } = useVolcanoSettings()

  const displayOptions: IVolcanoDisplayOptions = plot
    ? (plot! as IVolcanoPlot).props
    : DEFAULT_VOLCANO_PROPS

  const { showCrosshair, hideCrosshair } = useCrosshair()

  const thresholdLogP = settings.preprocess.applyMinusLog10P
    ? -Math.log10(settings.thresholds.pvalue.threshold)
    : settings.thresholds.pvalue.threshold

  const labelSet = useMemo(
    () => new Set<string>(displayLabels.map((x) => x.toLowerCase())),
    [displayLabels]
  )

  const points = useMemo(
    () =>
      (plot?.volcano.entries ?? []).map((e, i) => ({
        index: i,
        x: e.log2foldChange,
        y: e.logpvalue,
      })),

    [plot?.volcano.entries]
  )

  const { minX, maxX } = useMemo(() => {
    const xs = points.map((p) => p.x)
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
    }
  }, [points])

  function dotIsColored(
    logFc: number,
    logP: number,
    isLabeled: boolean
  ): boolean {
    // if we are only showing colored dots for labeled points
    // and this point is not labeled, it should not be colored
    if (settings.colors.onlyLabeled && !isLabeled) {
      return false
    }

    if (!settings.thresholds.pvalue.show && !settings.thresholds.logFc.show) {
      return true
    }

    if (settings.thresholds.pvalue.show && settings.thresholds.logFc.show) {
      return (
        logP > thresholdLogP &&
        Math.abs(logFc) > settings.thresholds.logFc.threshold
      )
    }

    return (
      (settings.thresholds.pvalue.show && logP > thresholdLogP) ||
      (settings.thresholds.logFc.show &&
        Math.abs(logFc) > settings.thresholds.logFc.threshold)
    )
  }

  function getDotColor(
    logFc: number,
    logP: number,
    isLabeled: boolean
  ): { color: string; isColored: boolean } {
    let color = settings.dots.fill.value
    const isColored = dotIsColored(logFc, logP, isLabeled)

    if (settings.colors.mode === 'colormap') {
      // goes from -x to x so only care about the positive side for color scaling
      const max = logFc > 0 ? maxX : Math.abs(minX)

      // each side of the x-axis is normalized separately for color scaling
      const normX = settings.colors.gradient.on
        ? clamp(Math.abs(logFc) / max, { min: 0, max: 0.5 })
        : 0.5

      const highlightColor = cmap.getHexColor(
        logFc > 0 ? 0.5 + normX : 0.5 - normX
      )

      if (isColored) {
        color = highlightColor
      }
    } else {
      if (isColored) {
        if (logFc > 0) {
          color = settings.colors.pos.fill.value
        } else {
          color = settings.colors.neg.fill.value
        }
      }
    }

    return { color, isColored }
  }

  function handleVariantEnter(row: number, p: IPos) {
    const { relativeP, screenP } = svgPointToScreen(svgRef.current, p)

    showCrosshair({
      pos: relativeP,
      screenPos: screenP,
      content: (
        <>
          <span className="font-semibold">{`${plot.volcano.entries[row]!.label}`}</span>
          <span>{`${xax.title}: ${cellStr(points[row]!.x)}`}</span>
          <span>{`${yax.title}: ${cellStr(points[row]!.y)}`}</span>
        </>
      ),
    })
  }

  const { svg, width, height } = useMemo(() => {
    if (!plot || !xax || !yax) {
      console.warn('Plot or axes not defined')
      return { svg: null, width: 0, height: 0 }
    }

    console.log('Rendering volcano plot')

    const innerWidth = axisLength(xax)
    const innerHeight = axisLength(yax)
    const width =
      innerWidth + settings.plot.margin.left + settings.plot.margin.right
    const height =
      innerHeight + settings.plot.margin.top + settings.plot.margin.bottom

    const renderSortedPoints = (plot?.volcano.entries ?? [])
      .map((entry, i) => {
        const p = points[i]!
        const entryIsLabel = labelSet.has(entry.label.toLowerCase())

        const { isColored: isColoredEntry, color } = getDotColor(
          p.x,
          p.y,
          entryIsLabel
        )

        return {
          ...p,
          color,
          isColored: isColoredEntry,
          isLabel: entryIsLabel,
        }
      })
      .sort((a, b) => {
        // if a is a label and b is not, it should come last
        // so that labels are rendered on top of non-label points
        if (a.isLabel && !b.isLabel) {
          return 1
        }

        // if b is a label and a is not, it should come first
        if (!a.isLabel && b.isLabel) {
          return -1
        }

        // if neither are labels push colored points last
        // so they are rendered on top of non-colored points
        if (a.isColored && !b.isColored) {
          return 1
        }
        if (!a.isColored && b.isColored) {
          return -1
        }
        return 0
      })

    const xaf = axisDomainToRangeFunc(xax!)
    const yaf = axisDomainToRangeFunc(yax!)

    const yThreshold = yaf(thresholdLogP)

    renderId.current = newUuid()

    const svg = (
      <>
        <SvgMargin margin={settings.plot.margin}>
          {renderSortedPoints.map((p) => {
            const x1 = xaf(p.x)
            const y1 = yaf(p.y)
            const entry = plot.volcano.entries[p.index]!
            const r = entry.size ? sizeFunc(entry.size) : settings.dots.size

            return (
              <SvgCircle
                cx={x1}
                cy={y1}
                r={r}
                fill={p.color}
                sp={settings.dots.stroke}
                key={p.index}
                onPointerEnter={() =>
                  handleVariantEnter(p.index, {
                    x: x1 + settings.plot.margin.left,
                    y: y1 + settings.plot.margin.top,
                  })
                }
                onPointerLeave={hideCrosshair}
                onDoubleClick={() => {
                  const label = entry.label

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
                    console.log('Adding label:', label)
                    setLabels([...displayLabels, label].sort())
                  }
                }}
              />
            )
          })}
        </SvgMargin>

        <SvgMargin margin={settings.plot.margin} id="labels">
          {renderSortedPoints
            .filter((idx) => idx.isLabel)
            .map(({ index }) => {
              const p = points[index]!
              const x1 = xaf(p.x)
              const y1 = yaf(p.y)
              const entry = plot.volcano.entries[index]!

              const r = entry.size ? sizeFunc(entry.size) : settings.dots.size

              return (
                <g key={`label-group-${index}-${renderId.current}`}>
                  {settings.labels.connector.type === 'elbow'
                    ? elbowConnector(index, p, r, xaf, yaf, settings)
                    : straightConnector(index, p, r, xaf, yaf, settings)}

                  <SvgText
                    id={`label-text-${index}`}
                    x={
                      x1 +
                      (p.x >= 0
                        ? settings.labels.offset.x + 2
                        : -settings.labels.offset.x - 2)
                    }
                    y={y1 - settings.labels.offset.y}
                    fill={displayOptions.labels.color}
                    textAnchor={p.x >= 0 ? 'start' : 'end'}
                  >
                    {entry.label}
                  </SvgText>
                </g>
              )
            })}
        </SvgMargin>

        {settings.thresholds.pvalue.line.show && (
          <SvgMargin margin={settings.plot.margin}>
            <SvgLine
              x1={xaf(xax!.domain[0])}
              y1={yThreshold}
              x2={xaf(xax!.domain[1])}
              y2={yThreshold}
              s={settings.thresholds.pvalue.line}
            />
          </SvgMargin>
        )}

        {displayOptions.border.show && (
          <SvgMargin margin={settings.plot.margin}>
            <SvgRect
              width={innerWidth}
              height={innerHeight}
              sp={displayOptions.border}
            />
          </SvgMargin>
        )}

        <AxisLeftSvg
          ax={yax}
          pos={{ x: settings.plot.margin.left, y: settings.plot.margin.top }}
          //tickSize={settings.axes.yaxis.tickSize}
          // strokeWidth={settings.axes.yaxis.stroke.width}
          //color={settings.axes.yaxis.stroke.value}
        />
        <AxisBottomSvg
          ax={xax}
          pos={{
            x: settings.plot.margin.left,
            y: settings.plot.margin.top + innerHeight,
          }}
          //tickSize={settings.axes.xaxis.tickSize}
          //strokeWidth={settings.axes.xaxis.stroke.width}
          //color={settings.axes.xaxis.stroke.value}
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
    labelSet,
  ])

  return <SvgZoomCanvas size={{ w: width, h: height }}>{svg}</SvgZoomCanvas>
}

export function VolcanoPlotSvg({ sizeFunc = (x: number) => x }: IProps) {
  return (
    <CrosshairProvider>
      <VolcanoPlotContent sizeFunc={sizeFunc} />
    </CrosshairProvider>
  )
}

function straightConnector(
  index: number,
  p: IPos,
  r: number,
  xaf: (x: number) => number,
  yaf: (y: number) => number,
  settings: IVolcanoSettings
) {
  const x1 = xaf(p.x)
  const y1 = yaf(p.y)

  const angle = Math.atan2(settings.labels.offset.y, settings.labels.offset.x)

  const cx = Math.cos(angle) * (r + 2)
  const cy = Math.sin(angle) * (r + 2)

  return (
    <SvgLine
      id={`label-line-${index}`}
      x1={x1 + (p.x >= 0 ? cx : -cx)}
      y1={y1 - cy}
      x2={
        x1 + (p.x >= 0 ? settings.labels.offset.x : -settings.labels.offset.x)
      }
      y2={y1 - settings.labels.offset.y}
      s={settings.labels.connector.stroke}
    />
  )
}

function elbowConnector(
  index: number,
  p: IPos,
  r: number,
  xaf: (x: number) => number,
  yaf: (y: number) => number,
  settings: IVolcanoSettings
) {
  const x1 = xaf(p.x)
  const y1 = yaf(p.y)

  const xs = x1 + (p.x >= 0 ? r + 2 : -(r + 2))
  const ys = y1

  const x2 =
    x1 + (p.x >= 0 ? settings.labels.offset.x : -settings.labels.offset.x)

  const y2 = y1 - settings.labels.offset.y

  const midX = (xs + x2) / 2

  const pathStr = `M ${xs} ${ys} L ${midX} ${ys} L ${midX} ${y2} L ${x2} ${y2}`

  return (
    <SvgPath
      id={`label-line-${index}`}
      d={pathStr}
      sp={settings.labels.connector.stroke}
    />
  )
}
