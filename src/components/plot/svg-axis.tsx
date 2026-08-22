import { SVG_CRISP_EDGES } from '@/consts'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { useEdbSettings } from '../edb/edb-settings'
import { Axis, YAxis } from './axis'
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
  line: IStrokeProps
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
  labels: { ...DEFAULT_AXIS_LABEL_PROPS, show: false },
  line: { ...DEFAULT_AXIS_TICK_PROPS.line, size: 3 },
}

export const DEFAULT_AXIS_DISPLAY_PROPS: IAxisDisplayProps = {
  title: { ...DEFAULT_BOLD_TEXT_PROPS, offset: 20 },
  line: { ...DEFAULT_STROKE_PROPS },
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
  pos = { ...ZERO_POS },
  title,
}: IAxisProps) {
  const { settings } = useEdbSettings()

  const titleOffset =
    settings.plots.axes.x.ticks.major.line.offset +
    settings.plots.axes.x.ticks.major.line.size +
    settings.plots.axes.x.ticks.major.labels.offset +
    settings.plots.axes.x.title.offset

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      {settings.plots.axes.x.line.show && (
        <SvgLine
          x1={-0.5 * settings.plots.axes.x.line.width}
          x2={ax.length + 0.5 * settings.plots.axes.x.line.width}

          s={settings.plots.axes.x.line}
        />
      )}

      <AxisBottomTicksSvg ax={ax} />

      {settings.plots.axes.x.title.show && title && (
        <SvgText
          transform={`translate(${0.5 * ax.length}, ${titleOffset})`}
          textAnchor="middle"
          font={settings.plots.axes.x.title}
        >
          {title}
        </SvgText>
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

/**
 * Standard bottom axis ticks for a horizontal axis.
 *
 * @param param0
 * @returns
 */
export function AxisBottomTicksSvg({ ax }: IAxisProps) {
  const { settings } = useEdbSettings()

  const minorTickOffset = settings.plots.colorbar.axis.ticks.minor.line.offset

  const minorLabelOffset =
    settings.plots.colorbar.axis.ticks.minor.line.size +
    settings.plots.colorbar.axis.ticks.minor.labels.offset

  const tickOffset = settings.plots.colorbar.axis.ticks.major.line.offset

  const tickLabelOffset =
    settings.plots.colorbar.axis.ticks.major.line.size +
    settings.plots.colorbar.axis.ticks.major.labels.offset

  return (
    <>
      {settings.plots.colorbar.axis.ticks.minor.line.show &&
        ax.minorTicks.map((tick, ti) => {
          const x = ax.domainToRange(tick.v)

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
        ax.minorTicks.map((tick, ti) => {
          const x = ax.domainToRange(tick.v)

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
        ax.ticks.map((tick, ti) => {
          const x = ax.domainToRange(tick.v)

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
        ax.ticks.map((tick, ti) => {
          const x = ax.domainToRange(tick.v)

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
    </>
  )
}

/**
 * Standard right axis ticks for a vertical axis.
 * @param param0
 * @returns
 */
export function AxisRightTicksSvg({ ax }: IAxisProps) {
  const { settings } = useEdbSettings()

  ax = YAxis.fromAxis(ax)

  const minorTickOffset = settings.plots.colorbar.axis.ticks.minor.line.offset
  const minorLabelOffset =
    settings.plots.colorbar.axis.ticks.minor.line.size +
    settings.plots.colorbar.axis.ticks.minor.labels.offset

  const tickOffset = settings.plots.colorbar.axis.ticks.major.line.offset

  const tickLabelOffset =
    settings.plots.colorbar.axis.ticks.major.line.size +
    settings.plots.colorbar.axis.ticks.major.labels.offset

  return (
    <>
      {settings.plots.colorbar.axis.ticks.minor.line.show &&
        ax.minorTicks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

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
        ax.minorTicks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

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
        ax.ticks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

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
        ax.ticks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

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
    </>
  )
}
