import { SVG_CRISP_EDGES } from '@/consts'
import type { IDim } from '@interfaces/dim'
import { ZERO_POS, type IPos } from '@interfaces/pos'
import { BWR_CMAP_V2, ColorMap } from '@lib/color/colormap'
import type { ILim } from '@lib/math/math'
import { range } from '@lib/math/range'
import * as d3 from 'd3'
import { Axis, YAxis } from './axis'
import { DEFAULT_COLORBAR_SIZE } from './heatmap/heatmap-svg-props'
import { DEFAULT_STROKE_PROPS, type IStrokeProps } from './svg-props'

interface IColorBarSvgProps {
  domain?: ILim
  ticks?: number[]
  cmap?: ColorMap
  stroke?: IStrokeProps
  steps?: number
  size?: IDim
  tickSize?: number
  pos?: IPos
}

export function HColorBarSvg({
  domain = [0, 100],
  ticks,
  cmap = BWR_CMAP_V2,
  steps,
  size = { ...DEFAULT_COLORBAR_SIZE },
  stroke = { ...DEFAULT_STROKE_PROPS },
  tickSize = 5,
  pos = { ...ZERO_POS },
}: IColorBarSvgProps) {
  if (!steps) {
    steps = cmap.colors
  }

  if (!steps) {
    steps = 15
  }

  const xscl = d3
    .scaleLinear()
    .domain(domain) // This is what is written on the Axis: from 0 to 100
    .range([0, size.w])

  const inc = (domain[1] - domain[0]) / steps
  const inc2 = 2 * inc
  let start = domain[0] - inc

  const colorStep = 1 / (steps - 1)
  let colorStart = -colorStep

  let axis = new Axis().setDomain(domain).setLength(size.w) //.setTicks(ticks)

  if (ticks) {
    //axis = axis.setTicks([domain[0], 0.5 * (domain[0] + domain[1]), domain[1]])
    //axis = axis.autoDomain(domain)
    axis.setTicks(ticks)
  } else {
    const dx = (domain[1] - domain[0]) / 4
    axis = axis.setTicks(range(0, 5).map((x) => domain[0] + x * dx))
  }

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
      fontSize="small"
    >
      <g>
        {range(steps).map((step) => {
          start += inc
          colorStart += colorStep
          const x1 = xscl(start)
          const x2 = xscl(start + (step < steps - 1 ? inc2 : inc))

          return (
            <rect
              key={step}
              x={x1}
              height={size.h}
              width={x2 - x1}
              fill={cmap.getHexColor(colorStart, false)}
            />
          )
        })}

        {stroke.show && (
          <rect
            width={size.w}
            height={size.h}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            fill="none"
          />
        )}
      </g>

      {axis.ticks.map((tick, ti) => {
        const x = axis.domainToRange(tick.v)

        return (
          <g transform={`translate(${x}, ${size.h + 2})`} key={ti}>
            <line
              y2={tickSize}
              stroke={stroke.color}
              strokeWidth={stroke.width}
            />
            <g transform={`translate(0, ${tickSize + 15})`}>
              <text textAnchor="middle">{tick.label}</text>
            </g>
          </g>
        )
      })}

      {/* <g transform={`translate(0, ${size.h + 2})`}>
        <line y2={5} stroke={COLOR_BLACK} shapeRendering={SVG_CRISP_EDGES} />
        <line
          y2={5}
          transform={`translate(${0.5 * size.w}, 0)`}
          stroke={stroke.color}
            strokeWidth={stroke.width}
          shapeRendering={SVG_CRISP_EDGES}
        />
        <line
          y2={5}
          transform={`translate(${size.w}, 0)`}
          stroke={stroke.color}
            strokeWidth={stroke.width}
          shapeRendering={SVG_CRISP_EDGES}
        />
      </g>
      <g transform={`translate(0, ${size.h + 25})`}>
        <text textAnchor="middle">{domain[0]}</text>
        <text textAnchor="middle" transform={`translate(${0.5 * size.w}, 0)`}>
          0
        </text>
        <text textAnchor="middle" transform={`translate(${size.w}, 0)`}>
          {domain[1]}
        </text>
      </g> */}
    </g>
  )
}

export function VColorBarSvg({
  domain = [0, 100],
  ticks,
  cmap = BWR_CMAP_V2,
  steps,
  size = { ...DEFAULT_COLORBAR_SIZE },
  tickSize = 5,
  stroke = { ...DEFAULT_STROKE_PROPS },
  pos = { ...ZERO_POS },
}: IColorBarSvgProps) {
  if (!steps) {
    steps = cmap.colors
  }

  if (!steps) {
    steps = 15
  }

  const xscl = d3
    .scaleLinear()
    .domain(domain) // This is what is written on the Axis: from 0 to 100
    .range([0, size.w])

  const colorStep = 1 / (steps - 1)
  const inc = (domain[1] - domain[0]) / steps
  const inc2 = 2 * inc
  let start = domain[0] - inc
  let colorStart = 1 + colorStep

  let axis = new YAxis().setDomain(domain).setLength(size.w) //.setTicks(ticks)

  if (ticks) {
    //axis = axis.setTicks([domain[0], 0.5 * (domain[0] + domain[1]), domain[1]])
    //axis = axis.autoDomain(domain)
    axis.setTicks(ticks)
  } else {
    const dx = (domain[1] - domain[0]) / 4
    axis = axis.setTicks(range(0, 5).map((x) => domain[0] + x * dx))
  }

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
      fontSize="small"
    >
      <g>
        {range(steps).map((step) => {
          start += inc
          colorStart -= colorStep
          const y1 = xscl(start)
          const y2 = xscl(start + (step < steps - 1 ? inc2 : inc))

          return (
            <rect
              key={step}
              y={y1}
              width={size.h}
              height={y2 - y1}
              fill={cmap.getHexColor(colorStart, false)}
            />
          )
        })}

        {stroke.show && (
          <rect
            width={size.h}
            height={size.w}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            fill="none"
          />
        )}
      </g>

      {axis.ticks.map((tick, ti) => {
        const y = axis.domainToRange(tick.v)

        return (
          <g transform={`translate(${size.h + 2}, ${y})`} key={ti}>
            <line
              x2={tickSize}
              stroke={stroke.color}
              strokeWidth={stroke.width}
            />
            <g transform={`translate(${tickSize + 5}, 0)`}>
              <text dominantBaseline="central">{tick.label}</text>
            </g>
          </g>
        )
      })}
    </g>
  )
}
