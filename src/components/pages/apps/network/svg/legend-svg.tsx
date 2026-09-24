import { createAxis } from '@/components/plot/axes/axis'
import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgVColorBar } from '@/components/plot/svg-color-bar'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgText } from '@/components/plot/svg-text'
import { IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { getColorMap } from '@/lib/color/colormap'
import { max } from '@/lib/math/math'
import { sum } from '@/lib/math/sum'
import { capitalCase } from '@/lib/text/capital-case'
import { range } from 'd3'
import { ReactElement } from 'react'
import { INetworkSettings, useNetworkSettings } from '../network-settings-store'
import { useNetwork } from '../network-store'

export function LegendSvg() {
  const { settings } = useNetworkSettings()
  const { groups, stepSize, metricLim1 } = useNetwork()

  const groupsHeight =
    30 + groups.length * (settings.plot.legend.dot.radius * 2 + 5)

  const steps = range(stepSize, metricLim1.max, stepSize)

  const sizeHeight =
    35 +
    2 *
      sum(steps.map((t) => (t / metricLim1.max) * settings.plot.nodes.radius)) +
    5 * steps.length

  const edgesHeight = 35 + settings.plot.legend.edges.ticks.length * 20

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

      {settings.plot.nodes.color.mode === 'auto' && (
        <Size2Svg pos={{ x: 0, y: groupsHeight + sizeHeight + edgesHeight }} />
      )}
    </SvgG>
  )
}

export function Size2Svg({ pos }: { pos: IPos }) {
  const { settings } = useNetworkSettings()
  const { headings, metricLim2 } = useNetwork()

  const cmap = getColorMap(settings.plot.nodes.color.cmap)

  const cax = createAxis({
    id: 'cbar',
    domain: [0, 1],

    ticks: [
      {
        v: 0,
        label: '0',
      },
      {
        v: 0.5,
        label: (metricLim2.max / 2).toString(),
      },
      {
        v: 1,
        label: metricLim2.max.toString(),
      },
    ],
    minorTicks: [0.25, 0.75],
  })

  return (
    <SvgG id="size2-legend" pos={pos}>
      <SvgText
        textAnchor="start"
        font={settings.plot.nodes.labels.text}

        fontWeight="bold"
      >
        {getSize2Label(headings, settings)}
      </SvgText>
      <SvgG pos={{ x: 0, y: 15 }}>
        <SvgVColorBar ax={cax} cmap={cmap} />
      </SvgG>
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

        fontWeight="bold"
      >
        {capitalCase(headings.score)}
      </SvgText>
      <SvgG pos={{ x: 0, y: 20 }}>{elems}</SvgG>
    </SvgG>
  )
}

export function SizesSvg({ pos, steps }: { pos: IPos; steps: number[] }) {
  const { metricLim1 } = useNetwork()
  const { settings } = useNetworkSettings()
  const { headings } = useNetwork()

  const maxRadius = (max(steps) / metricLim1.max) * settings.plot.nodes.radius

  const elems: ReactElement[] = []

  let y = 0

  for (const [si, step] of steps.entries()) {
    const radius = (step / metricLim1.max) * settings.plot.nodes.radius

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
        radius +
        (steps[si + 1] / metricLim1.max) * settings.plot.nodes.radius +
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
        {getSizeLabel(headings, settings)}
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

/**
 * Returns the size label correctly formatted to show if log scaling is applied.
 *
 * @param headings The headings object containing the size label.
 * @param settings The network settings object.
 * @returns The formatted size label based on the settings.
 */
export function getSizeLabel(
  headings: { metric1: string },
  settings: INetworkSettings
): string {
  return settings.data.applyMinusLog10ToSize
    ? `-log10(${capitalCase(headings.metric1)})`
    : capitalCase(headings.metric1)
}

export function getSize2Label(
  headings: { metric2: string },
  settings: INetworkSettings
): string {
  return settings.data.applyMinusLog10ToSize2
    ? `-log10(${capitalCase(headings.metric2)})`
    : capitalCase(headings.metric2)
}
