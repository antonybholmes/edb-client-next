import { SVG_CRISP_EDGES } from '@/consts'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { Axis } from './axis'
import { SvgLine } from './svg-line'
import {
  DEFAULT_BOLD_TEXT_PROPS,
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  IStrokeProps,
  type ITextProps,
} from './svg-props'
import { SvgText } from './svg-text'

interface IAxisLabel extends ITextProps {
  offset: number
}

interface IAxisLineProps extends IStrokeProps {
  size: number
  offset: number
}

interface IAxisTickProps {
  labels: IAxisLabel
  line: IAxisLineProps
}

export interface IAxisDisplayProps {
  title: IAxisLabel
  ticks: {
    major: IAxisTickProps
    minor: IAxisTickProps
  }
}

export const DEFAULT_AXIS_LABEL_PROPS: IAxisLabel = {
  ...DEFAULT_TEXT_PROPS,
  offset: 5,
}

export const DEFAULT_AXIS_LINE_PROPS: IAxisLineProps = {
  ...DEFAULT_STROKE_PROPS,
  size: 6,
  offset: 1,
}

export const DEFAULT_AXIS_TICK_PROPS: IAxisTickProps = {
  labels: { ...DEFAULT_AXIS_LABEL_PROPS },
  line: { ...DEFAULT_AXIS_LINE_PROPS },
}

export const DEFAULT_MINOR_AXIS_TICK_PROPS: IAxisTickProps = {
  ...DEFAULT_AXIS_TICK_PROPS,
  line: { ...DEFAULT_AXIS_TICK_PROPS.line, size: 3 },
}

export const DEFAULT_AXIS_DISPLAY_PROPS: IAxisDisplayProps = {
  title: { ...DEFAULT_BOLD_TEXT_PROPS, offset: 10 },
  ticks: {
    major: { ...DEFAULT_AXIS_TICK_PROPS },
    minor: { ...DEFAULT_MINOR_AXIS_TICK_PROPS },
  },
}

export interface IAxisProps {
  ax: Axis
  pos?: IPos
  font?: ITextProps
  labelFont?: ITextProps
  showTicks?: boolean
  showTickLabels?: boolean
  tickSize?: number
  strokeWidth?: number
  title?: string
  titleOffset?: number
  color?: string
  /**
   * Whether to show the axis line. Default is true.
   */
  showLine?: boolean
}

export function AxisLeftSvg({
  ax,
  showTicks = true,
  showTickLabels = true,
  tickSize = 5,
  strokeWidth = 1,
  color = COLOR_BLACK,
  pos = { ...ZERO_POS },
  title,
  titleOffset,
  labelFont = { ...DEFAULT_BOLD_TEXT_PROPS },
  font = { ...DEFAULT_TEXT_PROPS },
}: IAxisProps) {
  const _title = title ?? ax.title
  //use tick labels to guess an appropriate offset
  const _titleOffset =
    titleOffset ??
    3 * tickSize + 10 * Math.max(...ax.ticks.map((t) => t.label.length))

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      <line
        y1={-0.5 * strokeWidth}
        y2={ax.length - 0.5 * strokeWidth}
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {_title && (
        <SvgText
          transform={`translate(-${_titleOffset}, ${
            0.5 * ax.length
          }) rotate(270)  `}
          textAnchor="middle"
          font={labelFont}
        >
          {_title}
        </SvgText>
      )}

      {showTicks && (
        <g>
          <g>
            {ax.ticks.map((tick, ticki) => {
              return (
                <line
                  x2={tickSize}
                  stroke={color}
                  strokeWidth={strokeWidth}
                  transform={`translate(-${tickSize}, ${ax.domainToRange(tick.v)})`}
                  key={ticki}
                />
              )
            })}
          </g>

          {showTickLabels && (
            <g transform={`translate(-${tickSize * 2}, 0)`}>
              {ax.ticks.map((tick, ticki) => {
                return (
                  <SvgText
                    key={ticki}
                    x={0}
                    y={ax.domainToRange(tick.v)}
                    fill={color}
                    dominantBaseline="central"
                    textAnchor="end"
                    font={font}
                  >
                    {tick.label}
                  </SvgText>
                )
              })}
            </g>
          )}
        </g>
      )}
    </g>
  )
}

export function AxisBottomSvg({
  ax,
  showTicks = true,
  showTickLabels = true,
  showLine = true,
  tickSize = 5,
  strokeWidth = 1,
  color = COLOR_BLACK,
  pos = { ...ZERO_POS },
  titleOffset,
  title,
  font = { ...DEFAULT_TEXT_PROPS },
  labelFont: titleFont = { ...DEFAULT_BOLD_TEXT_PROPS },
}: IAxisProps) {
  const _titleOffset = titleOffset ?? tickSize * 10

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      {showLine && (
        <SvgLine
          x1={-0.5 * strokeWidth}
          x2={ax.length + 0.5 * strokeWidth}
          stroke={color}
          strokeWidth={strokeWidth}
        />
      )}

      {title && titleFont.show && (
        <SvgText
          transform={`translate(${0.5 * ax.length}, ${_titleOffset})`}
          textAnchor="middle"
          font={titleFont}
        >
          {title}
        </SvgText>
      )}

      {showTicks && (
        <g>
          <g>
            {ax.ticks.map((tick, ticki) => {
              return (
                <SvgLine
                  y2={tickSize}
                  stroke={color}
                  transform={`translate(${ax.domainToRange(tick.v)}, 0)`}
                  key={ticki}
                  strokeWidth={strokeWidth}
                />
              )
            })}
          </g>

          {showTickLabels && font.show && (
            <g transform={`translate(0, ${tickSize * 2})`}>
              {ax.ticks.map((tick, ticki) => (
                <SvgText
                  key={ticki}
                  x={ax.domainToRange(tick.v)}
                  fill={color}
                  dominantBaseline="hanging"
                  textAnchor="middle"
                  font={font}
                >
                  {tick.label}
                </SvgText>
              ))}
            </g>
          )}
        </g>
      )}
    </g>
  )
}

export function AxisTopSvg({
  ax,
  tickSize = 5,
  strokeWidth = 2,
  color = COLOR_BLACK,
  pos = { ...ZERO_POS },
  title,
  titleOffset,
  font,
  labelFont: titleFont,
}: IAxisProps) {
  const _title = title ?? ax.title
  const _titleOffset = titleOffset ?? tickSize * 8

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      <SvgLine
        x2={ax.length - 0.5 * strokeWidth}
        stroke={color}
        strokeWidth={strokeWidth}
      />

      {_title && (
        <SvgText
          transform={`translate(${0.5 * ax.length}, ${-_titleOffset})`}
          textAnchor="middle"
          font={titleFont}
        >
          {_title}
        </SvgText>
      )}

      <g>
        {ax.ticks.map((tick, ticki) => {
          return (
            <SvgLine
              y1={-tickSize}
              y2={0.5 * strokeWidth}
              stroke={color}
              transform={`translate(${ax.domainToRange(tick.v)}, 0)`}
              key={ticki}
              strokeWidth={strokeWidth}
            />
          )
        })}
      </g>

      <g transform={`translate(0, -${tickSize * 4})`}>
        {ax.ticks.map((tick, ticki) => (
          <SvgText
            key={ticki}
            x={ax.domainToRange(tick.v)}
            dominantBaseline="hanging"
            textAnchor="middle"
            font={font}
          >
            {tick.label}
          </SvgText>
        ))}
      </g>
    </g>
  )
}
