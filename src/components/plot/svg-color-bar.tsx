import { SVG_CRISP_EDGES } from '@/consts'
import { IDim } from '@/interfaces/dim'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { BWR_CMAP_V2, ColorMap } from '@/lib/color/colormap'
import { range } from '@/lib/math/range'
import { useEdbSettings } from '../edb/edb-settings'
import { Axis, YAxis } from './axis'
import { DEFAULT_AXIS_DISPLAY_PROPS, IAxisDisplayProps } from './svg-axis'
import { SvgLine } from './svg-line'
import { DEFAULT_STROKE_PROPS, type IStrokeProps } from './svg-props'
import { SvgRect } from './svg-rect'
import { SvgText } from './svg-text'

export interface IColorBarProps {
  show: boolean
  stroke: IStrokeProps
  size: IDim
  axis: IAxisDisplayProps
}

export const DEFAULT_COLORBAR_PROPS: IColorBarProps = {
  show: true,
  stroke: { ...DEFAULT_STROKE_PROPS },
  size: { w: 150, h: 12 },
  axis: { ...DEFAULT_AXIS_DISPLAY_PROPS },
}

interface ISvgColorBarProps {
  axis: Axis

  cmap?: ColorMap

  steps?: number

  pos?: IPos
}

export function SvgHColorBar({
  axis,

  cmap = BWR_CMAP_V2,
  steps,

  pos = { ...ZERO_POS },
}: ISvgColorBarProps) {
  const { settings } = useEdbSettings()

  if (!steps) {
    steps = cmap.colors
  }

  if (!steps) {
    steps = 15
  }

  // const xscl = d3
  //   .scaleLinear()
  //   .domain(domain) // This is what is written on the Axis: from 0 to 100
  //   .range([0, size.w])

  const colorStep = 1 / (steps - 1)
  const inc = (axis.domain[1] - axis.domain[0]) / steps
  const inc2 = 2 * inc

  let colorStart = -colorStep

  let x2 = axis.domainToRange(axis.domain[0])
  const xinc = axis.domainToRange(axis.domain[0] + inc) - x2
  const xinc2 = axis.domainToRange(axis.domain[0] + inc2) - x2

  x2 -= xinc

  const minorTickOffset =
    settings.plots.colorbar.size.h +
    settings.plots.colorbar.axis.ticks.minor.line.offset
  const minorLabelOffset =
    settings.plots.colorbar.axis.ticks.minor.line.size +
    settings.plots.colorbar.axis.ticks.minor.labels.offset

  const tickOffset =
    settings.plots.colorbar.size.h +
    settings.plots.colorbar.axis.ticks.major.line.offset
  const tickLabelOffset =
    settings.plots.colorbar.axis.ticks.major.line.size +
    settings.plots.colorbar.axis.ticks.major.labels.offset

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
      fontSize="small"
    >
      <g>
        {range(steps).map((step) => {
          colorStart += colorStep

          x2 += step < steps - 1 ? xinc : 0

          return (
            <SvgRect
              key={step}
              x={x2}
              height={settings.plots.colorbar.size.h}
              width={step < steps - 1 ? xinc2 : xinc}
              fill={cmap.getHexColor(colorStart, false)}
            />
          )
        })}

        {settings.plots.colorbar.stroke.show && (
          <SvgRect
            width={axis.length}
            height={settings.plots.colorbar.size.h}
            sp={settings.plots.colorbar.stroke}
          />
        )}
      </g>

      {settings.plots.colorbar.axis.ticks.minor.line.show &&
        axis.minorTicks.map((tick, ti) => {
          const x = axis.domainToRange(tick.v)

          return (
            <g transform={`translate(${x}, ${minorTickOffset})`} key={ti}>
              <SvgLine
                y2={settings.plots.colorbar.axis.ticks.minor.line.size}
                s={settings.plots.colorbar.axis.ticks.minor.line}
              />
            </g>
          )
        })}

      {settings.plots.colorbar.axis.ticks.minor.labels.show &&
        axis.minorTicks.map((tick, ti) => {
          const x = axis.domainToRange(tick.v)

          return (
            <g transform={`translate(${x}, ${minorTickOffset})`} key={ti}>
              {tick.label && (
                <g transform={`translate(0, ${minorLabelOffset})`}>
                  <SvgText
                    font={settings.plots.colorbar.axis.ticks.minor.labels}
                    textAnchor="middle"
                    dominantBaseline="hanging"
                  >
                    {tick.label}
                  </SvgText>
                </g>
              )}
            </g>
          )
        })}

      {settings.plots.colorbar.axis.ticks.major.line.show &&
        axis.ticks.map((tick, ti) => {
          const x = axis.domainToRange(tick.v)

          return (
            <g transform={`translate(${x}, ${tickOffset})`} key={ti}>
              <SvgLine
                y2={settings.plots.colorbar.axis.ticks.major.line.size}
                s={settings.plots.colorbar.axis.ticks.major.line}
              />
            </g>
          )
        })}

      {settings.plots.colorbar.axis.ticks.major.labels.show &&
        axis.ticks.map((tick, ti) => {
          const x = axis.domainToRange(tick.v)

          return (
            <g transform={`translate(${x}, ${tickOffset})`} key={ti}>
              {tick.label && (
                <g transform={`translate(0, ${tickLabelOffset})`}>
                  <SvgText
                    font={settings.plots.colorbar.axis.ticks.major.labels}
                    textAnchor="middle"
                    dominantBaseline="hanging"
                  >
                    {tick.label}
                  </SvgText>
                </g>
              )}
            </g>
          )
        })}
    </g>
  )
}

export function SvgVColorBar({
  axis,

  cmap = BWR_CMAP_V2,
  steps,

  pos = { ...ZERO_POS },
}: ISvgColorBarProps) {
  const { settings } = useEdbSettings()
  if (!steps) {
    steps = cmap.colors
  }

  if (!steps) {
    steps = 15
  }

  axis = YAxis.fromAxis(axis) //.setTicks(ticks)

  // const xscl = d3
  //   .scaleLinear()
  //   .domain(domain) // This is what is written on the Axis: from 0 to 100
  //   .range([0, size.w])

  //  steps = 5

  const colorStep = 1 / (steps - 1)
  const inc = (axis.domain[1] - axis.domain[0]) / steps
  const inc2 = 2 * inc

  let colorStart = -colorStep

  const minorTickOffset =
    settings.plots.colorbar.size.h +
    settings.plots.colorbar.axis.ticks.minor.line.offset
  const minorLabelOffset =
    settings.plots.colorbar.axis.ticks.minor.line.size +
    settings.plots.colorbar.axis.ticks.minor.labels.offset

  const tickOffset =
    settings.plots.colorbar.size.h +
    settings.plots.colorbar.axis.ticks.major.line.offset
  const tickLabelOffset =
    settings.plots.colorbar.axis.ticks.major.line.size +
    settings.plots.colorbar.axis.ticks.major.labels.offset

  let y2 = axis.domainToRange(axis.domain[0])
  const yinc = y2 - axis.domainToRange(axis.domain[0] + inc)
  const yinc2 = y2 - axis.domainToRange(axis.domain[0] + inc2)

  y2 -= yinc

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
      fontSize="small"
    >
      <g>
        {range(steps).map((step) => {
          colorStart += colorStep

          y2 -= step < steps - 1 ? yinc : 0 //const y2 = axis.domainToRange(start)

          return (
            <SvgRect
              key={step}
              y={y2}
              width={settings.plots.colorbar.size.h}
              height={step < steps - 1 ? yinc2 : yinc}
              fill={cmap.getHexColor(colorStart, false)}
            />
          )
        })}

        {settings.plots.colorbar.stroke.show && (
          <SvgRect
            width={settings.plots.colorbar.size.h}
            height={axis.length}

            sp={settings.plots.colorbar.stroke}
          />
        )}
      </g>

      {settings.plots.colorbar.axis.ticks.minor.line.show &&
        axis.minorTicks.map((tick, ti) => {
          const y = axis.domainToRange(tick.v)

          return (
            <g transform={`translate(${minorTickOffset}, ${y})`} key={ti}>
              <SvgLine
                x2={settings.plots.colorbar.axis.ticks.minor.line.size}
                s={settings.plots.colorbar.axis.ticks.minor.line}
              />
            </g>
          )
        })}

      {settings.plots.colorbar.axis.ticks.minor.labels.show &&
        axis.minorTicks.map((tick, ti) => {
          const y = axis.domainToRange(tick.v)

          return (
            <g transform={`translate(${minorTickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${minorLabelOffset}, 0)`}>
                  <SvgText
                    font={settings.plots.colorbar.axis.ticks.minor.labels}
                    dominantBaseline="central"
                  >
                    {tick.label}
                  </SvgText>
                </g>
              )}
            </g>
          )
        })}

      {settings.plots.colorbar.axis.ticks.major.line.show &&
        axis.ticks.map((tick, ti) => {
          const y = axis.domainToRange(tick.v)

          return (
            <g transform={`translate(${minorTickOffset}, ${y})`} key={ti}>
              <SvgLine
                x2={settings.plots.colorbar.axis.ticks.major.line.size}
                s={settings.plots.colorbar.axis.ticks.major.line}
              />
            </g>
          )
        })}

      {settings.plots.colorbar.axis.ticks.major.labels.show &&
        axis.ticks.map((tick, ti) => {
          const y = axis.domainToRange(tick.v)

          return (
            <g transform={`translate(${tickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${tickLabelOffset}, 0)`}>
                  <SvgText
                    font={settings.plots.colorbar.axis.ticks.major.labels}
                    dominantBaseline="central"
                  >
                    {tick.label}
                  </SvgText>
                </g>
              )}
            </g>
          )
        })}
    </g>
  )
}
