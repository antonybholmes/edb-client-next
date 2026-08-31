import { deepmerge } from 'deepmerge-ts'
import { useEdbSettings } from '../../edb/edb-settings'
import { SvgLine } from '../svg-line'
import type { IAxisProps } from '../svg-props'
import { SvgText } from '../svg-text'
import { Axis, YAxis } from './axis'
import { IAxisConfig } from './svg-axis-props'

export function getAxisProps(ax: Axis, props: IAxisConfig) {
  const axisProps = deepmerge(props, ax.params)

  const minorTickSize = axisProps.ticks.minor.style.line.size
  const minorTickOffset = axisProps.ticks.minor.style.line.offset

  const minorLabelOffset =
    minorTickSize + axisProps.ticks.minor.style.labels.offset

  const tickSize = axisProps.ticks.major.style.line.size
  const tickOffset = axisProps.ticks.major.style.line.offset

  const tickLabelOffset = tickSize + axisProps.ticks.major.style.labels.offset

  const titleOffset = axisProps.style.title.offset

  return {
    axisProps,
    minorTickProps: axisProps.ticks.minor,
    majorTickProps: axisProps.ticks.major,
    minorTickSize,
    minorTickOffset,
    minorLabelOffset,
    tickSize,
    tickOffset,
    tickLabelOffset,
    titleOffset,
  }
}

/**
 * Standard bottom axis ticks for a horizontal axis.
 *
 * @param param0
 * @returns
 */
export function AxisBottomTicksSvg({ ax }: IAxisProps) {
  const { settings } = useEdbSettings()

  const {
    minorTickProps,
    majorTickProps,
    minorTickSize,
    minorTickOffset,
    minorLabelOffset,
    tickSize,
    tickOffset,
    tickLabelOffset,
  } = getAxisProps(ax, settings.plots.axes.x)

  const majorXs = ax.ticks.map((tick) => ax.domainToRange(tick.v))
  const minorXs = ax.minorTicks.map((tick) => ax.domainToRange(tick.v))

  return (
    <>
      {minorTickProps.show && (
        <g>
          {minorTickProps.show &&
            minorTickProps.style.line.show &&
            minorXs.map((x, ti) => {
              return (
                <g transform={`translate(${x}, ${minorTickOffset})`} key={ti}>
                  <SvgLine y2={minorTickSize} s={minorTickProps.style.line} />
                </g>
              )
            })}

          {minorTickProps.show &&
            minorTickProps.style.labels.show &&
            ax.minorTicks.map((tick, ti) => {
              const x = minorXs[ti]

              return (
                <g transform={`translate(${x}, ${minorTickOffset})`} key={ti}>
                  {tick.label && (
                    <g transform={`translate(0, ${minorLabelOffset})`}>
                      <SvgText
                        font={minorTickProps.style.labels}
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

      {majorTickProps.show && majorTickProps.show && (
        <g>
          {majorTickProps.style.line.show &&
            majorXs.map((x, ti) => {
              return (
                <g transform={`translate(${x}, ${tickOffset})`} key={ti}>
                  <SvgLine y2={tickSize} s={majorTickProps.style.line} />
                </g>
              )
            })}

          {majorTickProps.show &&
            majorTickProps.style.labels.show &&
            ax.ticks.map((tick, ti) => {
              const x = majorXs[ti]

              return (
                <g transform={`translate(${x}, ${tickOffset})`} key={ti}>
                  {tick.label && (
                    <g transform={`translate(0, ${tickLabelOffset})`}>
                      <SvgText
                        font={majorTickProps.style.labels}
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

/**
 * Standard right axis ticks for a vertical axis.
 * @param param0
 * @returns
 */
export function AxisRightTicksSvg({ ax, axis = 'y' }: IAxisProps) {
  const { settings } = useEdbSettings()

  ax = YAxis.fromAxis(ax)

  const {
    minorTickProps,
    majorTickProps,
    minorTickSize,
    minorTickOffset,
    minorLabelOffset,
    tickSize,
    tickOffset,
    tickLabelOffset,
  } = getAxisProps(ax, settings.plots.axes[axis])

  const majorYs = ax.ticks.map((tick) => ax.domainToRange(tick.v))
  const minorYs = ax.minorTicks.map((tick) => ax.domainToRange(tick.v))

  return (
    <>
      {minorTickProps.show &&
        minorTickProps.style.line.show &&
        minorYs.map((y, ti) => {
          return (
            <g transform={`translate(${minorTickOffset}, ${y})`} key={ti}>
              <SvgLine x2={minorTickSize} s={minorTickProps.style.line} />
            </g>
          )
        })}

      {minorTickProps.show &&
        minorTickProps.style.labels.show &&
        ax.minorTicks.map((tick, ti) => {
          const y = minorYs[ti]

          return (
            <g transform={`translate(${minorTickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${minorLabelOffset}, 0)`}>
                  <SvgText
                    font={minorTickProps.style.labels}
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
        majorTickProps.style.line.show &&
        majorYs.map((y, ti) => {
          return (
            <g transform={`translate(${tickOffset}, ${y})`} key={ti}>
              <SvgLine x2={tickSize} s={majorTickProps.style.line} />
            </g>
          )
        })}

      {majorTickProps.show &&
        majorTickProps.style.labels.show &&
        ax.ticks.map((tick, ti) => {
          const y = majorYs[ti]

          return (
            <g transform={`translate(${tickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${tickLabelOffset}, 0)`}>
                  <SvgText
                    font={majorTickProps.style.labels}
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

export function AxisLeftTicksSvg({ ax }: IAxisProps) {
  const { settings } = useEdbSettings()

  ax = YAxis.fromAxis(ax)

  let {
    minorTickProps,
    majorTickProps,
    minorTickSize,
    minorTickOffset,
    minorLabelOffset,
    tickSize,
    tickOffset,
    tickLabelOffset,
  } = getAxisProps(ax, settings.plots.axes.y)

  const majorYs = ax.ticks.map((tick) => ax.domainToRange(tick.v))
  const minorYs = ax.minorTicks.map((tick) => ax.domainToRange(tick.v))

  return (
    <>
      {minorTickProps.show &&
        minorTickProps.style.line.show &&
        minorYs.map((y, ti) => {
          return (
            <g transform={`translate(${-minorTickOffset}, ${y})`} key={ti}>
              <SvgLine
                x1={-minorTickSize}
                x2={0}
                s={minorTickProps.style.line}
              />
            </g>
          )
        })}

      {minorTickProps.show &&
        minorTickProps.style.labels.show &&
        ax.minorTicks.map((tick, ti) => {
          const y = minorYs[ti]

          return (
            <g transform={`translate(${-minorTickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${minorLabelOffset}, 0)`}>
                  <SvgText
                    font={minorTickProps.style.labels}
                    dominantBaseline="central"
                    textAnchor="end"
                  >
                    {tick.label}
                  </SvgText>
                </g>
              )}
            </g>
          )
        })}

      {majorTickProps.show &&
        majorTickProps.style.line.show &&
        majorYs.map((y, ti) => {
          return (
            <g transform={`translate(${-tickOffset}, ${y})`} key={ti}>
              <SvgLine x1={-tickSize} x2={0} s={majorTickProps.style.line} />
            </g>
          )
        })}

      {majorTickProps.show &&
        majorTickProps.style.labels.show &&
        ax.ticks.map((tick, ti) => {
          const y = majorYs[ti]

          return (
            <g transform={`translate(${-tickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${-tickLabelOffset}, 0)`}>
                  <SvgText
                    font={majorTickProps.style.labels}
                    dominantBaseline="central"
                    textAnchor="end"
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
