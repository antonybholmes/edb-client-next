import { deepmerge } from 'deepmerge-ts'
import { useEdbSettings } from '../edb/edb-settings'
import { Axis, YAxis } from './axis'
import { SvgLine } from './svg-line'
import { IAxisProps, IMajorMinorTickProps } from './svg-props'
import { SvgText } from './svg-text'

/**
 * Standard bottom axis ticks for a horizontal axis.
 *
 * @param param0
 * @returns
 */
export function AxisBottomTicksSvg({ ax }: IAxisProps) {
  const { settings } = useEdbSettings()

  const minorTickOffset = settings.plots.axes.ticks.minor.line.offset

  const minorLabelOffset =
    settings.plots.axes.ticks.minor.line.size +
    settings.plots.axes.ticks.minor.labels.offset

  const tickOffset = settings.plots.axes.ticks.major.line.offset

  const tickLabelOffset =
    settings.plots.axes.ticks.major.line.size +
    settings.plots.axes.ticks.major.labels.offset

  return (
    <>
      {ax.tickParams.minor.show && (
        <g>
          {ax.tickParams.minor.show &&
            ax.tickParams.minor.line.show &&
            ax.minorTicks.map((tick, ti) => {
              const x = ax.domainToRange(tick.v)

              return (
                <g transform={`translate(${x}, ${minorTickOffset})`} key={ti}>
                  <SvgLine
                    y2={settings.plots.axes.ticks.minor.line.size}
                    s={settings.plots.axes.ticks.minor.line}
                  />
                </g>
              )
            })}

          {ax.tickParams.minor.show &&
            ax.tickParams.minor.labels.show &&
            ax.minorTicks.map((tick, ti) => {
              const x = ax.domainToRange(tick.v)

              return (
                <g transform={`translate(${x}, ${minorTickOffset})`} key={ti}>
                  {tick.label && (
                    <g transform={`translate(0, ${minorLabelOffset})`}>
                      <SvgText
                        font={settings.plots.axes.ticks.minor.labels}
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
      )}

      {ax.tickParams.major.show && ax.tickParams.major.show && (
        <g>
          {ax.tickParams.major.line.show &&
            ax.ticks.map((tick, ti) => {
              const x = ax.domainToRange(tick.v)

              return (
                <g transform={`translate(${x}, ${tickOffset})`} key={ti}>
                  <SvgLine
                    y2={settings.plots.axes.ticks.major.line.size}
                    s={settings.plots.axes.ticks.major.line}
                  />
                </g>
              )
            })}

          {ax.tickParams.major.show &&
            ax.tickParams.major.labels.show &&
            ax.ticks.map((tick, ti) => {
              const x = ax.domainToRange(tick.v)

              return (
                <g transform={`translate(${x}, ${tickOffset})`} key={ti}>
                  {tick.label && (
                    <g transform={`translate(0, ${tickLabelOffset})`}>
                      <SvgText
                        font={settings.plots.axes.ticks.major.labels}
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
      )}
    </>
  )
}

export function getTickLineProps(
  which: 'major' | 'minor',

  ax: Axis,
  props: IMajorMinorTickProps
) {
  return which === 'major'
    ? (ax.tickParams.major.line ?? props.major.line)
    : (ax.tickParams.minor.line ?? props.minor.line)
}

export function getTickLineProp(
  which: 'major' | 'minor',
  prop: 'offset' | 'size',
  ax: Axis,
  props: IMajorMinorTickProps
) {
  return which === 'major'
    ? (ax.tickParams.major.line[prop] ?? props.major.line[prop])
    : (ax.tickParams.minor.line[prop] ?? props.minor.line[prop])
}

export function getTickLabelsProp(
  which: 'major' | 'minor',
  prop: 'offset',
  ax: Axis,
  props: IMajorMinorTickProps
) {
  return which === 'major'
    ? (ax.tickParams.major.labels[prop] ?? props.major.labels[prop])
    : (ax.tickParams.minor.labels[prop] ?? props.minor.labels[prop])
}

export function getTickSize(
  which: 'major' | 'minor',
  ax: Axis,
  props: IMajorMinorTickProps
) {
  return which === 'major'
    ? (ax.tickParams.major.line.size ?? props.major.line.size)
    : (ax.tickParams.minor.line.size ?? props.minor.line.size)
}

/**
 * Standard right axis ticks for a vertical axis.
 * @param param0
 * @returns
 */
export function AxisRightTicksSvg({ ax }: IAxisProps) {
  const { settings } = useEdbSettings()

  ax = YAxis.fromAxis(ax)

  const minorTickProps = deepmerge(
    settings.plots.axes.ticks.minor,
    ax.tickParams.minor
  )
  const majorTickProps = deepmerge(
    settings.plots.axes.ticks.major,
    ax.tickParams.major
  )

  console.log('AxisRightTicksSvg: minorTickProps', minorTickProps)

  const minorTickSize = minorTickProps.line.size
  const minorTickOffset = minorTickProps.line.offset

  const minorLabelOffset = minorTickSize + minorTickProps.labels.offset

  const tickSize = majorTickProps.line.size
  const tickOffset = majorTickProps.line.offset

  const tickLabelOffset = tickSize + majorTickProps.labels.offset

  return (
    <>
      {minorTickProps.show &&
        minorTickProps.line.show &&
        ax.minorTicks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${minorTickOffset}, ${y})`} key={ti}>
              <SvgLine
                x2={minorTickSize}
                s={settings.plots.axes.ticks.minor.line}
              />
            </g>
          )
        })}

      {minorTickProps.show &&
        minorTickProps.labels.show &&
        ax.minorTicks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${minorTickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${minorLabelOffset}, 0)`}>
                  <SvgText
                    font={minorTickProps.labels}
                    dominantBaseline="central"
                  >
                    {tick.label}
                  </SvgText>
                </g>
              )}
            </g>
          )
        })}

      {majorTickProps.show &&
        majorTickProps.line.show &&
        ax.ticks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${tickOffset}, ${y})`} key={ti}>
              <SvgLine x2={tickSize} s={settings.plots.axes.ticks.major.line} />
            </g>
          )
        })}

      {majorTickProps.show &&
        majorTickProps.labels.show &&
        ax.ticks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${tickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${tickLabelOffset}, 0)`}>
                  <SvgText
                    font={majorTickProps.labels}
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
