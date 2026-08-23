import { SVG_CRISP_EDGES } from '@/consts'
import { ZERO_POS } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { useEdbSettings } from '../../edb/edb-settings'
import { SvgLine } from '../svg-line'
import { IAxisProps } from '../svg-props'
import { SvgText } from '../svg-text'
import {
  AxisBottomTicksSvg,
  AxisLeftTicksSvg,
  AxisRightTicksSvg,
  getTickProps,
} from './svg-axis-ticks'

export function AxisLeftSvg({
  ax,

  title,
  pos = { ...ZERO_POS },
}: IAxisProps) {
  const { settings } = useEdbSettings()

  const { tickProps, tickSize, tickOffset, tickLabelOffset } = getTickProps(
    ax,
    settings.plots.axes.y
  )

  const titleOffset =
    tickOffset + tickSize + tickLabelOffset + settings.plots.axes.y.title.offset

  const strokeWidth = settings.plots.axes.y.line.width

  const _title = title ?? ax.title

  if (!tickProps.show) {
    return null
  }

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      <SvgLine
        y1={-0.5 * strokeWidth}
        y2={ax.length + 0.5 * strokeWidth}
        s={settings.plots.axes.y.line}
      />

      <AxisLeftTicksSvg ax={ax} />

      {settings.plots.axes.y.title.show && ax && (
        <SvgText
          transform={`translate(-${titleOffset}, ${
            0.5 * ax.length
          }) rotate(270)  `}
          textAnchor="middle"
          font={settings.plots.axes.y.title}
        >
          {_title}
        </SvgText>
      )}
    </g>
  )
}

export function AxisRightSvg({
  ax,

  title,
  pos = { ...ZERO_POS },
}: IAxisProps) {
  const { settings } = useEdbSettings()

  const { tickSize, tickOffset, tickLabelOffset } = getTickProps(
    ax,
    settings.plots.axes.y
  )

  const titleOffset =
    tickOffset + tickSize + tickLabelOffset + settings.plots.axes.y.title.offset

  const strokeWidth = settings.plots.axes.y.line.width

  const _title = title ?? ax.title

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      <SvgLine
        y1={-0.5 * strokeWidth}
        y2={ax.length + 0.5 * strokeWidth}
        s={settings.plots.axes.y.line}
      />

      <AxisRightTicksSvg ax={ax} />

      {settings.plots.axes.y.title.show && ax && (
        <SvgText
          transform={`translate(-${titleOffset}, ${
            0.5 * ax.length
          }) rotate(270)  `}
          textAnchor="middle"
          font={settings.plots.axes.y.title}
        >
          {_title}
        </SvgText>
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

  const { tickSize, tickOffset } = getTickProps(ax, settings.plots.axes.x)

  // less space required for bottom axis title since we only need
  // to account for font height and tick mark
  const titleOffset = tickOffset + tickSize + settings.plots.axes.x.title.offset

  const _title = title ?? ax.title

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

      {settings.plots.axes.x.title.show && _title && (
        <SvgText
          transform={`translate(${0.5 * ax.length}, ${titleOffset})`}
          textAnchor="middle"
          font={settings.plots.axes.x.title}
        >
          {_title}
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
