import { SVG_CRISP_EDGES } from '@/consts'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { BWR_CMAP_V2, ColorMap } from '@/lib/color/colormap'
import { range } from '@/lib/math/range'
import { useEdbSettings } from '../edb/edb-settings'
import { Axis, YAxis } from './axis'

import { AxisBottomTicksSvg, AxisRightTicksSvg } from './svg-axis-ticks'
import { SvgRect } from './svg-rect'

interface ISvgColorBarProps {
  ax: Axis
  cmap?: ColorMap
  steps?: number
  pos?: IPos
}

export function SvgHColorBar({
  ax,

  cmap = BWR_CMAP_V2,
  steps,

  pos = { ...ZERO_POS },
}: ISvgColorBarProps) {
  const { settings } = useEdbSettings()

  if (!steps) {
    steps = cmap.colors
  }

  if (!steps) {
    steps = 15
  }

  // const xscl = d3
  //   .scaleLinear()
  //   .domain(domain) // This is what is written on the Axis: from 0 to 100
  //   .range([0, size.w])

  const colorStep = 1 / (steps - 1)
  const inc = (ax.domain[1] - ax.domain[0]) / steps
  const inc2 = 2 * inc

  let colorStart = -colorStep

  let x2 = ax.domainToRange(ax.domain[0])
  const xinc = ax.domainToRange(ax.domain[0] + inc) - x2
  const xinc2 = ax.domainToRange(ax.domain[0] + inc2) - x2

  x2 -= xinc

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
      fontSize="small"
    >
      <g>
        {range(steps).map((step) => {
          colorStart += colorStep

          x2 += step < steps - 1 ? xinc : 0

          return (
            <SvgRect
              key={step}
              x={x2}
              height={settings.plots.colorbar.size.h}
              width={step < steps - 1 ? xinc2 : xinc}
              fill={cmap.getHexColor(colorStart, false)}
            />
          )
        })}

        {settings.plots.colorbar.stroke.show && (
          <SvgRect
            width={ax.length}
            height={settings.plots.colorbar.size.h}
            sp={settings.plots.colorbar.stroke}
          />
        )}
      </g>
      <g transform={`translate(0, ${settings.plots.colorbar.size.h})`}>
        <AxisBottomTicksSvg ax={ax} />
      </g>
    </g>
  )
}

export function SvgVColorBar({
  ax,
  cmap = BWR_CMAP_V2,
  steps,
  pos = { ...ZERO_POS },
}: ISvgColorBarProps) {
  const { settings } = useEdbSettings()

  if (!steps) {
    steps = cmap.colors
  }

  if (!steps) {
    steps = 15
  }

  ax = YAxis.fromAxis(ax) //.setTicks(ticks)

  // const xscl = d3
  //   .scaleLinear()
  //   .domain(domain) // This is what is written on the Axis: from 0 to 100
  //   .range([0, size.w])

  //  steps = 5

  const colorStep = 1 / (steps - 1)
  const inc = (ax.domain[1] - ax.domain[0]) / steps
  const inc2 = 2 * inc

  let colorStart = -colorStep

  let y2 = ax.domainToRange(ax.domain[0])
  const yinc = y2 - ax.domainToRange(ax.domain[0] + inc)
  const yinc2 = y2 - ax.domainToRange(ax.domain[0] + inc2)

  y2 -= yinc

  return (
    <g
      transform={`translate(${pos.x}, ${pos.y})`}
      shapeRendering={SVG_CRISP_EDGES}
      fontSize="small"
    >
      <g>
        {range(steps).map((step) => {
          colorStart += colorStep

          y2 -= step < steps - 1 ? yinc : 0 //const y2 = axis.domainToRange(start)

          return (
            <SvgRect
              key={step}
              y={y2}
              width={settings.plots.colorbar.size.h}
              height={step < steps - 1 ? yinc2 : yinc}
              fill={cmap.getHexColor(colorStart, false)}
            />
          )
        })}

        {settings.plots.colorbar.stroke.show && (
          <SvgRect
            width={settings.plots.colorbar.size.h}
            height={ax.length}

            sp={settings.plots.colorbar.stroke}
          />
        )}
      </g>

      <g transform={`translate(${settings.plots.colorbar.size.h}, 0)`}>
        <AxisRightTicksSvg ax={ax} />
      </g>
    </g>
  )
}
