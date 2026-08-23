import { deepmerge } from 'deepmerge-ts'
import { useEdbSettings } from '../edb/edb-settings'
import { Axis, YAxis } from './axis'
import { SvgLine } from './svg-line'
import { IAxisDisplayProps, IAxisProps } from './svg-props'
import { SvgText } from './svg-text'

export function getTickProps(ax: Axis, props: IAxisDisplayProps) {
  const minorTickProps = deepmerge(props.ticks.minor, ax.tickParams.minor)
  const majorTickProps = deepmerge(props.ticks.major, ax.tickParams.major)

  console.log('AxisRightTicksSvg: minorTickProps', minorTickProps)

  const minorTickSize = minorTickProps.line.size
  const minorTickOffset = minorTickProps.line.offset

  const minorLabelOffset = minorTickSize + minorTickProps.labels.offset

  const tickSize = majorTickProps.line.size
  const tickOffset = majorTickProps.line.offset

  const tickLabelOffset = tickSize + majorTickProps.labels.offset

  return {
    minorTickProps,
    majorTickProps,
    minorTickSize,
    minorTickOffset,
    minorLabelOffset,
    tickSize,
    tickOffset,
    tickLabelOffset,
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
  } = getTickProps(ax, settings.plots.axes)

  return (
    <>
      {minorTickProps.show && (
        <g>
          {minorTickProps.show &&
            minorTickProps.line.show &&
            ax.minorTicks.map((tick, ti) => {
              const x = ax.domainToRange(tick.v)

              return (
                <g transform={`translate(${x}, ${minorTickOffset})`} key={ti}>
                  <SvgLine y2={minorTickSize} s={minorTickProps.line} />
                </g>
              )
            })}

          {minorTickProps.show &&
            minorTickProps.labels.show &&
            ax.minorTicks.map((tick, ti) => {
              const x = ax.domainToRange(tick.v)

              return (
                <g transform={`translate(${x}, ${minorTickOffset})`} key={ti}>
                  {tick.label && (
                    <g transform={`translate(0, ${minorLabelOffset})`}>
                      <SvgText
                        font={minorTickProps.labels}
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
          {majorTickProps.line.show &&
            ax.ticks.map((tick, ti) => {
              const x = ax.domainToRange(tick.v)

              return (
                <g transform={`translate(${x}, ${tickOffset})`} key={ti}>
                  <SvgLine y2={tickSize} s={majorTickProps.line} />
                </g>
              )
            })}

          {majorTickProps.show &&
            majorTickProps.labels.show &&
            ax.ticks.map((tick, ti) => {
              const x = ax.domainToRange(tick.v)

              return (
                <g transform={`translate(${x}, ${tickOffset})`} key={ti}>
                  {tick.label && (
                    <g transform={`translate(0, ${tickLabelOffset})`}>
                      <SvgText
                        font={majorTickProps.labels}
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
export function AxisRightTicksSvg({ ax }: IAxisProps) {
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
  } = getTickProps(ax, settings.plots.axes)

  return (
    <>
      {minorTickProps.show &&
        minorTickProps.line.show &&
        ax.minorTicks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${minorTickOffset}, ${y})`} key={ti}>
              <SvgLine x2={minorTickSize} s={minorTickProps.line} />
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
              <SvgLine x2={tickSize} s={majorTickProps.line} />
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
  } = getTickProps(ax, settings.plots.axes)

  tickOffset++
  minorTickOffset++

  return (
    <>
      {minorTickProps.show &&
        minorTickProps.line.show &&
        ax.minorTicks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${-minorTickOffset}, ${y})`} key={ti}>
              <SvgLine x2={minorTickSize} s={minorTickProps.line} />
            </g>
          )
        })}

      {minorTickProps.show &&
        minorTickProps.labels.show &&
        ax.minorTicks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${-minorTickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${minorLabelOffset}, 0)`}>
                  <SvgText
                    font={minorTickProps.labels}
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
        majorTickProps.line.show &&
        ax.ticks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${-tickOffset}, ${y})`} key={ti}>
              <SvgLine x1={-tickSize} x2={0} s={majorTickProps.line} />
            </g>
          )
        })}

      {majorTickProps.show &&
        majorTickProps.labels.show &&
        ax.ticks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${-tickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${-tickLabelOffset}, 0)`}>
                  <SvgText
                    font={majorTickProps.labels}
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
