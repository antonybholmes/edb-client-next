import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
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

  const groupsHeight =
    30 + groups.length * (settings.plot.legend.dot.radius * 2 + 5)

  const sizeHeight =
    30 +
    sum(
      settings.plot.legend.sizes.ticks.map((t) => t * settings.plot.nodes.scale)
    ) +
    5 * settings.plot.legend.sizes.ticks.length

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
          y: groupsHeight,
        }}
      />
      <EdgesSvg
        pos={{
          x: 0,
          y: groupsHeight + sizeHeight,
        }}
      />
    </SvgG>
  )
}

export function EdgesSvg({ pos }: { pos: IPos }) {
  const { settings } = useNetworkSettings()
  const { scoreName } = useNetwork()

  const elems: ReactElement[] = []

  let y = 0

  for (const [ti, tick] of settings.plot.legend.edges.ticks.entries()) {
    const strokeWidth = tick * settings.plot.edges.scale

    elems.push(
      <SvgG key={ti} pos={{ x: 0, y }}>
        <SvgLine
          x1={0}
          y1={0}
          x2={settings.plot.legend.edges.size}
          y2={0}
          s={settings.plot.edges.line}
          strokeWidth={strokeWidth}
        />
        <SvgG pos={{ x: settings.plot.legend.edges.size + 5, y: 0 }}>
          <SvgText textAnchor="start" font={settings.plot.nodes.labels.text}>
            {tick}
          </SvgText>
        </SvgG>
      </SvgG>
    )

    y += 20
  }

  return (
    <SvgG id="edge-legend" pos={pos}>
      <SvgText
        textAnchor="start"
        font={settings.plot.nodes.labels.text}
        fill={COLOR_BLACK}
        fontWeight="bold"
      >
        {scoreName}
      </SvgText>
      <SvgG pos={{ x: 0, y: 20 }}>{elems}</SvgG>
    </SvgG>
  )
}

export function SizesSvg({ pos }: { pos: IPos }) {
  const { settings } = useNetworkSettings()

  const maxRadius =
    Math.max(...settings.plot.legend.sizes.ticks) *
    0.5 *
    settings.plot.nodes.scale

  const elems: ReactElement[] = []

  let y = 0

  for (const [ti, tick] of settings.plot.legend.sizes.ticks.entries()) {
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
          <SvgText textAnchor="start" font={settings.plot.nodes.labels.text}>
            {tick}
          </SvgText>
        </SvgG>
      </SvgG>
    )

    // add our radius plus radius of next element to get
    // nice spacing
    if (ti < settings.plot.legend.sizes.ticks.length - 1) {
      y +=
        radius +
        settings.plot.legend.sizes.ticks[ti + 1] *
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
