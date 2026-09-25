import { useGseaBubbleSettings } from '../gsea-bubble-settings-store'

import { AxisBottomSvg } from '../../../../../../../plot/axes/svg-axis'

import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgText } from '@/components/plot/svg-text'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { useAxis } from '@/components/plot/axes/axes-store'
import { axisDomainToRange } from '@/components/plot/axes/axis'
import { SvgRect } from '@/components/plot/svg-rect'
import { SVG_CRISP_EDGES } from '@/consts'
import { IPos } from '@/interfaces/pos'
import { IGseaBubble } from '../../gsea-store'
import { IBubblePoint } from '../gsea-bubble-provider'

const TOOLTIP_OFFSET = 10

export interface IPlotInfo {
  plot: IGseaBubble
  points: IBubblePoint[]
  //xlim: ILim
  pos: IPos
}

export function BubblePlotSvg({
  info,
  innerPlotWidth,
  innerPlotHeight,
  handleVariantEnter,
  handleVariantLeave,
}: {
  info: IPlotInfo

  innerPlotWidth: number
  innerPlotHeight: number
  handleVariantEnter: (plot: IGseaBubble, row: number, p: IPos) => void
  handleVariantLeave: () => void
}) {
  const { settings } = useGseaBubbleSettings()
  const { settings: edbSettings } = useEdbSettings()

  const { axis: xax } = useAxis({
    plotId: info.plot.id,
    groupId: 'nes',
    axisId: 'x',
  })

  if (!xax) {
    return null
  }

  const xPoints = axisDomainToRange(
    xax,
    info.points.map((p) => p.x)
  )

  return (
    <>
      <SvgMargin margin={settings.plot.margin}>
        {info.points.map((point, xi) => {
          const x1 = xPoints[xi]
          const y1 = point.y * settings.axes.y.rowHeight

          return (
            <SvgCircle
              cx={x1}
              cy={y1}
              r={point.r}
              fill={point.color}
              fp={settings.bubbles.fill}
              sp={settings.bubbles.stroke}
              key={xi}
              onMouseLeave={handleVariantLeave}
              onMouseEnter={() => {
                handleVariantEnter(info.plot, xi, {
                  x:
                    x1 +
                    settings.margin.left +
                    settings.plot.margin.left +
                    info.pos.x +
                    TOOLTIP_OFFSET,
                  y:
                    y1 +
                    settings.margin.top +
                    settings.plot.margin.top +
                    info.pos.y +
                    TOOLTIP_OFFSET,
                })
              }}
            />
          )
        })}
      </SvgMargin>

      <g
        transform={`translate(${settings.plot.margin.left - settings.padding}, ${settings.plot.margin.top})`}
      >
        {info.points.map((p, xi) => {
          const y1 = p.y * settings.axes.y.rowHeight

          return (
            <SvgText
              key={xi}
              y={y1}
              textAnchor="end"
              font={edbSettings.plots.axes.y.ticks.major.style.labels}
            >
              {p.label}
            </SvgText>
          )
        })}
      </g>

      {settings.border.show && (
        <SvgMargin margin={settings.plot.margin}>
          <SvgRect
            shapeRendering={SVG_CRISP_EDGES}
            width={innerPlotWidth}
            height={innerPlotHeight}
            stroke={settings.border.value}
            strokeWidth={settings.border.width}
            fill="none"
          />
        </SvgMargin>
      )}

      {settings.title.show && info.plot.name && (
        <g
          transform={`translate(${settings.plot.margin.left + innerPlotWidth / 2}, ${settings.plot.margin.top - settings.padding * 1.5})`}
        >
          <SvgText textAnchor="middle" fontWeight="bold">
            {info.plot.name}
          </SvgText>
        </g>
      )}

      {edbSettings.plots.axes.x.style.show && (
        <AxisBottomSvg
          ax={xax}

          pos={{
            x: settings.plot.margin.left,
            y: settings.plot.margin.top + innerPlotHeight,
          }}

          //title={info.plot.nes.label}
        />
      )}
    </>
  )
}
