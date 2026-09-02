import { deepmerge } from 'deepmerge-ts'
import { useEdbSettings } from '../../edb/edb-settings'
import { SvgLine } from '../svg-line'
import type { IAxisProps } from '../svg-props'
import { SvgText } from '../svg-text'

import {
  axisDomainToRange,
  getAxisTicks,
  IAxis,
  setAxisDirection,
} from './axis'
import { IAxisConfig } from './svg-axis-props'

export function getAxisProps(ax: IAxis, props: IAxisConfig) {
  const axisProps = deepmerge(props, ax)

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

  const ticks = getAxisTicks(ax)
  const minorTicks = getAxisTicks(ax, { which: 'minor' })

  const majorXs = axisDomainToRange(ax, ticks)
  const minorXs = axisDomainToRange(ax, minorTicks)

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
            minorTicks.map((tick, ti) => {
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
            ticks.map((tick, ti) => {
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

export function AxisTopTicksSvg({ ax }: IAxisProps) {
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

  const ticks = getAxisTicks(ax)
  const minorTicks = getAxisTicks(ax, { which: 'minor' })

  const majorXs = axisDomainToRange(ax, ticks)
  const minorXs = axisDomainToRange(ax, minorTicks)

  return (
    <>
      {minorTickProps.show && (
        <g>
          {minorTickProps.show &&
            minorTickProps.style.line.show &&
            minorXs.map((x, ti) => {
              return (
                <g transform={`translate(${x}, ${-minorTickOffset})`} key={ti}>
                  <SvgLine
                    y1={-minorTickSize}
                    y2={0}
                    s={minorTickProps.style.line}
                  />
                </g>
              )
            })}

          {minorTickProps.show &&
            minorTickProps.style.labels.show &&
            minorTicks.map((tick, ti) => {
              const x = minorXs[ti]

              return (
                <g transform={`translate(${x}, ${-minorTickOffset})`} key={ti}>
                  {tick.label && (
                    <g transform={`translate(0, ${-minorLabelOffset})`}>
                      <SvgText
                        font={minorTickProps.style.labels}
                        textAnchor="middle"
                        dominantBaseline="auto"
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
                <g transform={`translate(${x}, ${-tickOffset})`} key={ti}>
                  <SvgLine
                    y1={-tickSize}
                    y2={0}
                    s={majorTickProps.style.line}
                  />
                </g>
              )
            })}

          {majorTickProps.show &&
            majorTickProps.style.labels.show &&
            ticks.map((tick, ti) => {
              const x = majorXs[ti]

              return (
                <g transform={`translate(${x}, ${-tickOffset})`} key={ti}>
                  {tick.label && (
                    <g transform={`translate(0, ${-tickLabelOffset})`}>
                      <SvgText
                        font={majorTickProps.style.labels}
                        textAnchor="middle"
                        dominantBaseline="auto"
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

  ax = setAxisDirection(ax, 'y')

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

  const ticks = getAxisTicks(ax)
  const minorTicks = getAxisTicks(ax, { which: 'minor' })

  const majorYs = axisDomainToRange(ax, ticks)
  const minorYs = axisDomainToRange(ax, minorTicks)

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
        minorTicks.map((tick, ti) => {
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
        ticks.map((tick, ti) => {
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

  ax = setAxisDirection(ax, 'y')

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

  const ticks = getAxisTicks(ax)
  const minorTicks = getAxisTicks(ax, { which: 'minor' })

  const majorYs = axisDomainToRange(ax, ticks)
  const minorYs = axisDomainToRange(ax, minorTicks)
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
        minorTicks.map((tick, ti) => {
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
        ticks.map((tick, ti) => {
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
