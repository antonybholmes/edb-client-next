import { useGseaBubbleSettings } from '../gsea-bubble-settings-store'

import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgVColorBar } from '@/components/plot/svg-color-bar'
import { SvgText } from '@/components/plot/svg-text'
import { COLOR_MAPS } from '@/lib/color/colormap'

import { useEdbSettings } from '@/components/edb/edb-settings'
import { nodeRadiusFunc } from '@/components/pages/apps/matcalc/apps/heatmap/svg/cell-svg'
import { useAxis } from '@/components/plot/axes/axes-store'
import { useGseaBubbleContext } from '../gsea-bubble-provider'

export function GseaBubbleLegendSvg() {
  const { plots } = useGseaBubbleContext()
  const { settings } = useGseaBubbleSettings()
  const { settings: edbSettings } = useEdbSettings()

  const { axis: cax } = useAxis({
    plotId: 'cbar',
    groupId: 'cbar',
    axisId: 'cbar',
  })

  const sizes = settings.legend.bubbles.sizes

  if (plots.length === 0) {
    return null
  }

  const plot = plots[0]!

  const cmap = COLOR_MAPS[settings.scale.cmap]!

  const dotLegendPos = []

  const radiusScale = nodeRadiusFunc(
    settings.bubbles.size,
    settings.bubbles.scale.mode
  )

  let y = 0

  for (const [si, s] of sizes.entries()) {
    const d = Math.min(s, settings.size.maxSize)

    //const r1 = Math.min(d / settings.size.maxSize, 1) * settings.bubbles.size
    const normSize = Math.min(d / settings.size.maxSize, 1)
    const r1 = radiusScale(normSize)

    dotLegendPos.push({ label: d.toFixed(0), r: r1, y })

    if (si < sizes.length - 1) {
      const r2 =
        Math.min(sizes[si + 1]! / settings.size.maxSize, 1) *
        settings.bubbles.size
      y += r1 + r2 + settings.padding
    }
  }

  const label =
    settings.scale.mode === 'p' ? `-log10(${plot.log10q.label})` : 'NES'

  return (
    <>
      {settings.colorbar.show &&
        settings.colorbar.position.includes('right') && (
          <>
            <g id="p-legend">
              <SvgText
                x={edbSettings.plots.colorbar.size.h / 2}
                y={0}
                textAnchor="middle"
              >
                {label}
              </SvgText>
              <g transform={`translate(0, ${settings.padding * 2})`}>
                <SvgVColorBar
                  ax={cax}

                  cmap={cmap}
                />
              </g>
            </g>
            <g
              id="dot-legend"
              transform={`translate(0, ${edbSettings.plots.colorbar.size.w + settings.padding * 5})`}
            >
              <SvgText
                x={edbSettings.plots.colorbar.size.h / 2}
                y={0}
                textAnchor="middle"
              >
                {plot.size.label}
              </SvgText>
              <g
                transform={`translate(0, ${settings.padding + settings.bubbles.size})`}
              >
                {dotLegendPos.map((d, di) => (
                  <g key={di}>
                    <SvgCircle
                      key={di}
                      cx={edbSettings.plots.colorbar.size.h / 2}
                      cy={d.y}
                      r={d.r}
                      stroke="black"
                    />
                    <SvgText
                      x={
                        edbSettings.plots.colorbar.size.h / 2 +
                        settings.bubbles.size +
                        settings.padding
                      }
                      y={d.y}
                      //textAnchor="start"
                      //dominantBaseline="central"
                    >
                      {d.label}
                    </SvgText>
                  </g>
                ))}
              </g>
            </g>
          </>
        )}
    </>
  )
}
