import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgG } from '@/components/plot/svg-g'
import { SvgText } from '@/components/plot/svg-text'
import { IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { sum } from '@/lib/math/sum'
import { ReactElement } from 'react'
import { useNetworkSettings } from '../network-settings-store'
import { useNetwork } from '../network-store'

export function LegendSvg() {
  const { settings } = useNetworkSettings()
  const { groups } = useNetwork()

  const sizeHeight = sum(
    settings.plot.legend.size.ticks.map(
      (t) => t * 0.5 * settings.plot.nodes.scale
    )
  )

  return (
    <SvgG
      id="legend"
      pos={{
        x: settings.plot.margin.left + settings.plot.size.w + 20,
        y: settings.plot.margin.top,
      }}
    >
      <GroupsSvg />
      <SizesSvg
        pos={{
          x: 0,
          y: 30 + groups.length * (settings.plot.legend.dot.radius * 2 + 5),
        }}
      />
    </SvgG>
  )
}

export function SizesSvg({ pos }: { pos: IPos }) {
  const { settings } = useNetworkSettings()

  const maxRadius =
    Math.max(...settings.plot.legend.size.ticks) *
    0.5 *
    settings.plot.nodes.scale

  const elems: ReactElement[] = []

  let y = 0

  for (const [ti, tick] of settings.plot.legend.size.ticks.entries()) {
    const radius = tick * 0.5 * settings.plot.nodes.scale

    elems.push(
      <SvgG key={ti} pos={{ x: 0, y }}>
        <SvgCircle
          r={radius}
          fill={COLOR_BLACK}
          fillOpacity={settings.plot.nodes.color.opacity}
          stroke={
            settings.plot.nodes.line.autoColor && settings.plot.nodes.line.show
              ? COLOR_BLACK
              : undefined
          }
          sp={settings.plot.nodes.line}
        />
        <SvgG pos={{ x: maxRadius + 5, y: 0 }}>
          <SvgText
            textAnchor="start"
            font={settings.plot.nodes.labels.text}
            fill={COLOR_BLACK}
          >
            {tick}
          </SvgText>
        </SvgG>
      </SvgG>
    )

    // add our radius plus radius of next element to get
    // nice spacing
    if (ti < settings.plot.legend.size.ticks.length - 1) {
      y +=
        radius +
        settings.plot.legend.size.ticks[ti + 1] *
          0.5 *
          settings.plot.nodes.scale +
        5
    }
  }

  return (
    <SvgG id="size-legend" pos={pos}>
      <SvgText
        textAnchor="start"
        font={settings.plot.nodes.labels.text}
        fill={COLOR_BLACK}
        fontWeight="bold"
      >
        Sizes
      </SvgText>
      <SvgG pos={{ x: maxRadius, y: 20 }}>{elems}</SvgG>
    </SvgG>
  )
}

export function GroupsSvg() {
  const { settings } = useNetworkSettings()

  const { groups } = useNetwork()

  return (
    <SvgG id="group-legend">
      <SvgText
        textAnchor="start"
        font={settings.plot.nodes.labels.text}
        fill={COLOR_BLACK}
        fontWeight="bold"
      >
        Groups
      </SvgText>
      <SvgG pos={{ x: settings.plot.legend.dot.radius, y: 10 }} id="groups">
        {groups.map((group, gi) => (
          <SvgG
            key={group.id}
            pos={{
              x: 0,
              y: 10 + gi * (settings.plot.legend.dot.radius * 2 + 5),
            }}
          >
            <SvgCircle
              r={settings.plot.legend.dot.radius}
              fill={group.color}
              fillOpacity={settings.plot.nodes.color.opacity}

              stroke={
                settings.plot.nodes.line.autoColor &&
                settings.plot.nodes.line.show
                  ? group.color
                  : undefined
              }
              sp={settings.plot.nodes.line}
            />
            <SvgG pos={{ x: settings.plot.legend.dot.radius + 5, y: 0 }}>
              <SvgText
                textAnchor="start"
                font={settings.plot.nodes.labels.text}
                fill={COLOR_BLACK}
              >
                {group.name}
              </SvgText>
            </SvgG>
          </SvgG>
        ))}
      </SvgG>
    </SvgG>
  )
}
