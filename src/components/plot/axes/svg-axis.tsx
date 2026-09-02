import { SVG_CRISP_EDGES } from '@/consts'
import { ZERO_POS } from '@/interfaces/pos'
import { useEdbSettings } from '../../edb/edb-settings'
import { SvgLine } from '../svg-line'
import { IAxisProps } from '../svg-props'
import { SvgText } from '../svg-text'

import {
  AxisBottomTicksSvg,
  AxisLeftTicksSvg,
  AxisRightTicksSvg,
  AxisTopTicksSvg,
  getAxisProps,
} from './svg-axis-ticks'

export function AxisLeftSvg({ ax, title, pos = { ...ZERO_POS } }: IAxisProps) {
  const { settings } = useEdbSettings()

  const { axisProps, tickSize, tickOffset, tickLabelOffset } = getAxisProps(
    ax,
    settings.plots.axes.y
  )

  const titleOffset =
    tickOffset +
    tickSize +
    tickLabelOffset +
    settings.plots.axes.y.style.title.offset

  const strokeWidth = settings.plots.axes.y.style.line.width

  const _title = title ?? ax.title

  if (!axisProps.style.show) {
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
        s={settings.plots.axes.y.style.line}
      />

      <AxisLeftTicksSvg ax={ax} />

      {axisProps.style.title.show && _title && (
        <SvgText
          transform={`translate(-${titleOffset}, ${0.5 * ax.length}) rotate(270)  `}
          textAnchor="middle"
          font={axisProps.style.title}
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
  axis = 'y',
  pos = { ...ZERO_POS },
}: IAxisProps) {
  const { settings } = useEdbSettings()

  const { axisProps, tickSize, tickOffset, tickLabelOffset, titleOffset } =
    getAxisProps(ax, settings.plots.axes[axis])

  const titleX = tickOffset + tickSize + tickLabelOffset + titleOffset

  const strokeWidth = axisProps.style.line.width

  const _title = title ?? ax.title

  if (!axisProps.style.show) {
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
        s={axisProps.style.line}
      />

      <AxisRightTicksSvg ax={ax} axis={axis} />

      {axisProps.style.title.show && ax && (
        <SvgText
          transform={`translate(-${titleX}, ${0.5 * ax.length}) rotate(270)`}
          textAnchor="middle"
          font={axisProps.style.title}
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
  axis = 'x',
  title,
}: IAxisProps) {
  const { settings } = useEdbSettings()

  const { axisProps, tickSize, tickOffset } = getAxisProps(
    ax,
    settings.plots.axes[axis]
  )

  // less space required for bottom axis title since we only need
  // to account for font height and tick mark
  const titleOffset =
    tickOffset +
    tickSize +
    (axisProps.ticks.major.show || axisProps.ticks.minor.show
      ? tickOffset + tickSize + axisProps.style.title.offset
      : 0)

  const _title = title ?? ax.title

  if (!axisProps.style.show) {
    return null
  }

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      {axisProps.style.line.show && (
        <SvgLine
          x1={-0.5 * axisProps.style.line.width}
          x2={ax.length + 0.5 * axisProps.style.line.width}

          s={axisProps.style.line}
        />
      )}

      <AxisBottomTicksSvg ax={ax} />

      {axisProps.style.title.show && _title && (
        <SvgText
          transform={`translate(${0.5 * ax.length}, ${titleOffset})`}
          textAnchor="middle"
          dominantBaseline="hanging"
          font={axisProps.style.title}
        >
          {_title}
        </SvgText>
      )}
    </g>
  )
}

export function AxisTopSvg({
  ax,
  pos = { ...ZERO_POS },
  axis = 'x',
  title,
}: IAxisProps) {
  const { settings } = useEdbSettings()

  const { axisProps, tickSize, tickOffset } = getAxisProps(
    ax,
    settings.plots.axes[axis]
  )

  const titleOffset =
    (axisProps.ticks.major.show || axisProps.ticks.minor.show
      ? tickOffset + tickSize
      : 0) + axisProps.style.title.offset

  const _title = title ?? ax.title

  if (!axisProps.style.show) {
    return null
  }

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
    >
      {axisProps.style.line.show && (
        <SvgLine
          x2={ax.length - 0.5 * axisProps.style.line.width}
          s={axisProps.style.line}
        />
      )}

      <AxisTopTicksSvg ax={ax} />

      {axisProps.style.title.show && _title && (
        <SvgText
          transform={`translate(${0.5 * ax.length}, ${-titleOffset})`}
          textAnchor="middle"
          font={axisProps.style.title}
        >
          {_title}
        </SvgText>
      )}
    </g>
  )
}
