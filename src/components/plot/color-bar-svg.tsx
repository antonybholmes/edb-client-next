import { SVG_CRISP_EDGES } from '@/consts'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import type { IDim } from '@interfaces/dim'
import { BWR_CMAP, ColorMap } from '@lib/colormap'
import { range } from '@lib/math/range'
import * as d3 from 'd3'
import { Axis, YAxis, type ILim } from './axis'
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
  cmap = BWR_CMAP,
  steps = 15,
  size = { ...DEFAULT_COLORBAR_SIZE },
  stroke = { ...DEFAULT_STROKE_PROPS },
  tickSize = 5,
  pos = { ...ZERO_POS },
}: IColorBarSvgProps) {
  const xscl = d3
    .scaleLinear()
    .domain(domain) // This is what is written on the Axis: from 0 to 100
    .range([0, size.width])

  const inc = (domain[1] - domain[0]) / steps
  const inc2 = 2 * inc
  let start = domain[0] - inc

  const colorStep = 1 / (steps - 1)
  let colorStart = -colorStep

  let axis = new Axis().setDomain(domain).setLength(size.width) //.setTicks(ticks)

  if (!ticks) {
    axis = axis.setTicks([domain[0], 0.5 * (domain[0] + domain[1]), domain[1]])
  }

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
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
              height={size.height}
              width={x2 - x1}
              fill={cmap.getColorWithoutAlpha(colorStart)}
            />
          )
        })}

        {stroke.show && (
          <rect
            width={size.width}
            height={size.height}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            fill="none"
          />
        )}
      </g>

      {axis.ticks.map((tick, ti) => {
        const x = axis.domainToRange(tick)

        return (
          <g transform={`translate(${x}, ${size.height + 2})`} key={ti}>
            <line
              y2={tickSize}
              stroke={stroke.color}
              strokeWidth={stroke.width}
            />
            <g transform={`translate(0, ${tickSize + 15})`}>
              <text textAnchor="middle">{tick.toLocaleString()}</text>
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
  cmap = BWR_CMAP,
  steps = 15,
  size = { ...DEFAULT_COLORBAR_SIZE },
  tickSize = 5,
  stroke = { ...DEFAULT_STROKE_PROPS },
  pos = { ...ZERO_POS },
}: IColorBarSvgProps) {
  const xscl = d3
    .scaleLinear()
    .domain(domain) // This is what is written on the Axis: from 0 to 100
    .range([0, size.width])

  const colorStep = 1 / (steps - 1)
  const inc = (domain[1] - domain[0]) / steps
  const inc2 = 2 * inc
  let start = domain[0] - inc
  let colorStart = 1 + colorStep

  let axis = new YAxis().setDomain(domain).setLength(size.width) //.setTicks(ticks)

  if (!ticks) {
    axis = axis.setTicks([domain[0], 0.5 * (domain[0] + domain[1]), domain[1]])
  }

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
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
              width={size.height}
              height={y2 - y1}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment

              fill={cmap.getColorWithoutAlpha(colorStart)}
            />
          )
        })}

        {stroke.show && (
          <rect
            width={size.height}
            height={size.width}
            stroke={stroke.color}
            strokeWidth={stroke.width}
            fill="none"
          />
        )}
      </g>

      {axis.ticks.map((tick, ti) => {
        const y = axis.domainToRange(tick)

        return (
          <g transform={`translate(${size.height + 2}, ${y})`} key={ti}>
            <line
              x2={tickSize}
              stroke={stroke.color}
              strokeWidth={stroke.width}
            />
            <g transform={`translate(${tickSize + 5}, 0)`}>
              <text dominantBaseline="central">{tick.toLocaleString()}</text>
            </g>
          </g>
        )
      })}
    </g>
  )
}
