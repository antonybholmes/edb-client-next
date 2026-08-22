import { SVG_CRISP_EDGES } from '@/consts'
import type { IDim } from '@/interfaces/dim'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { BWR_CMAP_V2, ColorMap } from '@/lib/color/colormap'
import { range } from '@/lib/math/range'
import { Axis, YAxis } from './axis'
import { DEFAULT_COLORBAR_SIZE } from './heatmap/heatmap-svg-props'
import { SvgLine } from './svg-line'
import {
  DEFAULT_STROKE_PROPS,
  type IStrokeProps,
  type ITextProps,
} from './svg-props'
import { SvgRect } from './svg-rect'
import { SvgText } from './svg-text'

interface IColorBarSvgProps {
  axis: Axis

  cmap?: ColorMap
  stroke?: IStrokeProps
  steps?: number
  font?: ITextProps
  size?: IDim
  tickSize?: number
  pos?: IPos
  showMinorTicks?: boolean
}

export function HColorBarSvg({
  axis,

  cmap = BWR_CMAP_V2,
  steps,
  size = { ...DEFAULT_COLORBAR_SIZE },
  stroke = { ...DEFAULT_STROKE_PROPS },
  showMinorTicks = false,
  pos = { ...ZERO_POS },
  font,
}: IColorBarSvgProps) {
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
              height={size.h}
              width={step < steps - 1 ? xinc2 : xinc}
              fill={cmap.getHexColor(colorStart, false)}
            />
          )
        })}

        {stroke.show && (
          <SvgRect
            width={size.w}
            height={size.h}
            stroke={stroke.value}
            strokeWidth={stroke.width}
            fill="none"
          />
        )}
      </g>

      {showMinorTicks &&
        axis.minorTicks.map((tick, ti) => {
          const x = axis.domainToRange(tick.v)

          return (
            <g
              transform={`translate(${x}, ${size.h + axis.tickPadding})`}
              key={ti}
            >
              <SvgLine
                y2={axis.minorTickSize}
                stroke={stroke.value}
                strokeWidth={stroke.width}
              />

              {tick.label && (
                <g transform={`translate(0, ${axis.tickSize + 8})`}>
                  <SvgText
                    font={font}
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

      {axis.ticks.map((tick, ti) => {
        const x = axis.domainToRange(tick.v)

        return (
          <g
            transform={`translate(${x}, ${size.h + axis.tickPadding})`}
            key={ti}
          >
            <SvgLine
              y2={axis.tickSize}
              stroke={stroke.value}
              strokeWidth={stroke.width}
            />
            <g transform={`translate(0, ${axis.tickSize + 8})`}>
              <SvgText
                font={font}
                textAnchor="middle"
                dominantBaseline="hanging"
              >
                {tick.label}
              </SvgText>
            </g>
          </g>
        )
      })}
    </g>
  )
}

export function VColorBarSvg({
  axis,

  cmap = BWR_CMAP_V2,
  steps,
  size = { ...DEFAULT_COLORBAR_SIZE },
  showMinorTicks = false,
  stroke = { ...DEFAULT_STROKE_PROPS },
  pos = { ...ZERO_POS },
  font,
}: IColorBarSvgProps) {
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
              width={size.h}
              height={step < steps - 1 ? yinc2 : yinc}
              fill={cmap.getHexColor(colorStart, false)}
            />
          )
        })}

        {stroke.show && (
          <SvgRect
            width={size.h}
            height={size.w}
            stroke={stroke.value}
            strokeWidth={stroke.width}
            fill="none"
          />
        )}
      </g>

      {showMinorTicks &&
        axis.minorTicks.map((tick, ti) => {
          const y = axis.domainToRange(tick.v)

          return (
            <g
              transform={`translate(${size.h + axis.tickPadding}, ${y})`}
              key={ti}
            >
              <SvgLine
                x2={axis.minorTickSize}
                stroke={stroke.value}
                strokeWidth={stroke.width}
              />
              {tick.label && (
                <g transform={`translate(${axis.tickSize + 5}, 0)`}>
                  <SvgText font={font} dominantBaseline="central">
                    {tick.label}
                  </SvgText>
                </g>
              )}
            </g>
          )
        })}

      {axis.ticks.map((tick, ti) => {
        const y = axis.domainToRange(tick.v)

        return (
          <g
            transform={`translate(${size.h + axis.tickPadding}, ${y})`}
            key={ti}
          >
            <SvgLine
              x2={axis.tickSize}
              stroke={stroke.value}
              strokeWidth={stroke.width}
            />
            <g transform={`translate(${axis.tickSize + 5}, 0)`}>
              <SvgText font={font} dominantBaseline="central">
                {tick.label}
              </SvgText>
            </g>
          </g>
        )
      })}
    </g>
  )
}
