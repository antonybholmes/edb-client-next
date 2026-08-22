import { useEdbSettings } from '../edb/edb-settings'
import { YAxis } from './axis'
import { SvgLine } from './svg-line'
import { IAxisProps } from './svg-props'
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

/**
 * Standard right axis ticks for a vertical axis.
 * @param param0
 * @returns
 */
export function AxisRightTicksSvg({ ax }: IAxisProps) {
  const { settings } = useEdbSettings()

  ax = YAxis.fromAxis(ax)

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
      {ax.tickParams.minor.show &&
        ax.tickParams.minor.line.show &&
        ax.minorTicks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${minorTickOffset}, ${y})`} key={ti}>
              <SvgLine
                x2={settings.plots.axes.ticks.minor.line.size}
                s={settings.plots.axes.ticks.minor.line}
              />
            </g>
          )
        })}

      {ax.tickParams.minor.show &&
        ax.tickParams.minor.labels.show &&
        ax.minorTicks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${minorTickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${minorLabelOffset}, 0)`}>
                  <SvgText
                    font={settings.plots.axes.ticks.minor.labels}
                    dominantBaseline="central"
                  >
                    {tick.label}
                  </SvgText>
                </g>
              )}
            </g>
          )
        })}

      {ax.tickParams.major.show &&
        ax.tickParams.major.line.show &&
        ax.ticks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${minorTickOffset}, ${y})`} key={ti}>
              <SvgLine
                x2={settings.plots.axes.ticks.major.line.size}
                s={settings.plots.axes.ticks.major.line}
              />
            </g>
          )
        })}

      {ax.tickParams.major.show &&
        ax.tickParams.major.labels.show &&
        ax.ticks.map((tick, ti) => {
          const y = ax.domainToRange(tick.v)

          return (
            <g transform={`translate(${tickOffset}, ${y})`} key={ti}>
              {tick.label && (
                <g transform={`translate(${tickLabelOffset}, 0)`}>
                  <SvgText
                    font={settings.plots.axes.ticks.major.labels}
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
