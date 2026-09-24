import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgText } from '@/components/plot/svg-text'
import { IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { max } from '@/lib/math/math'
import { sum } from '@/lib/math/sum'
import { capitalCase } from '@/lib/text/capital-case'
import { range } from 'd3'
import { ReactElement } from 'react'
import { useNetworkSettings } from '../network-settings-store'
import { useNetwork } from '../network-store'

export function LegendSvg() {
  const { settings } = useNetworkSettings()
  const { groups, stepSize, sizeLim } = useNetwork()

  const groupsHeight =
    30 + groups.length * (settings.plot.legend.dot.radius * 2 + 5)

  const steps = range(stepSize, sizeLim.max, stepSize)

  const sizeHeight =
    35 +
    2 * sum(steps.map((t) => (t / sizeLim.max) * settings.plot.nodes.radius)) +
    5 * steps.length

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
        steps={steps}
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
  const { headings } = useNetwork()

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
        {capitalCase(headings.score)}
      </SvgText>
      <SvgG pos={{ x: 0, y: 20 }}>{elems}</SvgG>
    </SvgG>
  )
}

export function SizesSvg({ pos, steps }: { pos: IPos; steps: number[] }) {
  const { sizeLim } = useNetwork()
  const { settings } = useNetworkSettings()
  const { headings } = useNetwork()

  const maxRadius = (max(steps) / sizeLim.max) * settings.plot.nodes.radius

  const elems: ReactElement[] = []

  let y = 0

  for (const [si, step] of steps.entries()) {
    const radius = (step / sizeLim.max) * settings.plot.nodes.radius

    elems.push(
      <SvgG key={si} pos={{ x: 0, y }}>
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
            {step}
          </SvgText>
        </SvgG>
      </SvgG>
    )

    // add our radius plus radius of next element to get
    // nice spacing
    if (si < steps.length - 1) {
      y +=
        radius + (steps[si + 1] / sizeLim.max) * settings.plot.nodes.radius + 5
    }
  }

  const label = settings.applyMinusLog10ToSize
    ? `-log10(${capitalCase(headings.size)})`
    : capitalCase(headings.size)

  return (
    <SvgG id="size-legend" pos={pos}>
      <SvgText
        textAnchor="start"
        font={settings.plot.nodes.labels.text}
        fill={COLOR_BLACK}
        fontWeight="bold"
      >
        {label}
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
