import { autoTickInterval, createAxis } from '@/components/plot/axes/axis'
import { SvgCircle } from '@/components/plot/svg-circle'
import { SvgVColorBar } from '@/components/plot/svg-color-bar'
import { SvgG } from '@/components/plot/svg-g'
import { SvgLine } from '@/components/plot/svg-line'
import { SvgText } from '@/components/plot/svg-text'
import { IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { getColorMap } from '@/lib/color/colormap'
import { sum } from '@/lib/math/sum'
import { capitalCase } from '@/lib/text/capital-case'

import { ReactElement } from 'react'
import { nodeRadiusFunc } from '../../matcalc/apps/heatmap/svg/cell-svg'
import { INetworkSettings, useNetworkSettings } from '../network-settings-store'
import { useNetwork } from '../network-store'

export function LegendSvg() {
  const { settings } = useNetworkSettings()
  const { groups, nodes, edges } = useNetwork()

  const nodeLabelFontSize = settings.plot.nodes.labels.text.font.fontSize

  //estimate the space needed for node labels based on font size
  const nodeLabelHeight = nodeLabelFontSize // * 1.2 // approximate line height for labels

  console.log(
    'nodeLabelHeight:',
    settings.plot.nodes.labels.text.font.fontSize,
    nodeLabelHeight,
    groups.length
  )

  const nodeRadiusScale = nodeRadiusFunc(
    settings.plot.nodes.radius,
    settings.plot.nodes.scale.mode
  )

  let blockHeight = Math.max(
    nodeLabelHeight,
    settings.plot.legend.dot.radius * 2 + 5
  )

  const groupsHeight = (groups.length + 2) * blockHeight

  let {
    ticks: sizeTicks,
    interval: sizeInterval,
    format: sizeFormat,
  } = autoTickInterval(
    {
      min: 0,
      max: nodes.metricLim1.max,
    },
    settings.plot.legend.sizes.ticks
  )

  if (sizeTicks[0] < sizeInterval) {
    sizeTicks = sizeTicks.slice(1)
  }

  if (sizeTicks.length > settings.plot.legend.sizes.ticks) {
    sizeTicks = sizeTicks.slice(0, settings.plot.legend.sizes.ticks)
  }

  const sizeHeight =
    2 * blockHeight +
    2 * sum(sizeTicks.map((t) => nodeRadiusScale(t / nodes.metricLim1.max))) +
    5 * sizeTicks.length

  let {
    ticks: strengthTicks,
    interval: strengthInterval,
    format: strengthFormat,
  } = autoTickInterval(
    {
      min: 0,
      max: edges.strengthLim.max,
    },
    settings.plot.legend.edges.ticks
  )

  if (strengthTicks[0] < strengthInterval) {
    strengthTicks = strengthTicks.slice(1)
  }

  if (strengthTicks.length > settings.plot.legend.edges.ticks) {
    strengthTicks = strengthTicks.slice(0, settings.plot.legend.edges.ticks)
  }

  const edgesHeight = 2 * blockHeight + strengthTicks.length * blockHeight

  return (
    <SvgG
      id="legend"
      pos={{
        x: settings.plot.margin.left + settings.plot.size.w + 20,
        y: settings.plot.margin.top,
      }}
    >
      <GroupsSvg blockHeight={blockHeight} />
      <SizesSvg
        pos={{
          x: 0,
          y: groupsHeight,
        }}
        ticks={sizeTicks}
        format={sizeFormat}
      />
      <EdgesSvg
        blockHeight={blockHeight}
        ticks={strengthTicks}
        format={strengthFormat}
        pos={{
          x: 0,
          y: groupsHeight + sizeHeight,
        }}
      />

      {settings.plot.nodes.color.mode === 'auto' && (
        <Size2Svg
          pos={{ x: 0, y: groupsHeight + sizeHeight + edgesHeight }}
          blockHeight={blockHeight}
        />
      )}
    </SvgG>
  )
}

export function Size2Svg({
  pos,
  blockHeight,
}: {
  pos: IPos
  blockHeight: number
}) {
  const { settings } = useNetworkSettings()
  const { headings, nodes } = useNetwork()

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
        label: (nodes.metricLim2.max / 2).toString(),
      },
      {
        v: 1,
        label: nodes.metricLim2.max.toString(),
      },
    ],
    minorTicks: [0.25, 0.75],
  })

  return (
    <SvgG id="size2-legend" pos={pos}>
      <SvgText
        textAnchor="start"
        dominantBaseline="auto"
        font={settings.plot.nodes.labels.text}
        fontWeight="bold"
      >
        {getSize2Label(headings, settings)}
      </SvgText>
      <SvgG pos={{ x: 0, y: blockHeight }}>
        <SvgVColorBar ax={cax} cmap={cmap} />
      </SvgG>
    </SvgG>
  )
}

export function EdgesSvg({
  blockHeight,
  pos,
  ticks,
  format,
}: {
  pos: IPos
  ticks: number[]
  format: (n: number) => string
  blockHeight: number
}) {
  const { settings } = useNetworkSettings()
  const { headings } = useNetwork()

  const elems: ReactElement[] = []

  let y = 0

  for (const [ti, tick] of ticks.entries()) {
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
            {format(tick)}
          </SvgText>
        </SvgG>
      </SvgG>
    )

    y += blockHeight
  }

  return (
    <SvgG id="edge-legend" pos={pos}>
      <SvgText
        textAnchor="start"
        dominantBaseline="auto"
        font={settings.plot.nodes.labels.text}
        fontWeight="bold"
      >
        {capitalCase(headings.score)}
      </SvgText>
      <SvgG pos={{ x: 0, y: blockHeight }}>{elems}</SvgG>
    </SvgG>
  )
}

export function SizesSvg({
  pos,
  ticks,
  format,
}: {
  pos: IPos
  ticks: number[]
  format: (n: number) => string
}) {
  const { settings } = useNetworkSettings()
  const { headings, nodes } = useNetwork()

  const nodeRadiusScale = nodeRadiusFunc(
    settings.plot.nodes.radius,
    settings.plot.nodes.scale.mode
  )

  const maxRadius = nodeRadiusScale(1)

  const elems: ReactElement[] = []

  let y = 0

  for (const [si, step] of ticks.entries()) {
    const radius = nodeRadiusScale(step / nodes.metricLim1.max)

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
            {format(step)}
          </SvgText>
        </SvgG>
      </SvgG>
    )

    // add our radius plus radius of next element to get
    // nice spacing
    if (si < ticks.length - 1) {
      y += radius + nodeRadiusScale(ticks[si + 1] / nodes.metricLim1.max) + 5
    }
  }

  return (
    <SvgG id="size-legend" pos={pos}>
      <SvgText
        textAnchor="start"
        dominantBaseline="auto"
        font={settings.plot.nodes.labels.text}
        fill={COLOR_BLACK}
        fontWeight="bold"
      >
        {getSizeLabel(headings, settings)}
      </SvgText>
      <SvgG pos={{ x: maxRadius, y: 25 }}>{elems}</SvgG>
    </SvgG>
  )
}

export function GroupsSvg({ blockHeight }: { blockHeight: number }) {
  const { settings } = useNetworkSettings()

  const { groups } = useNetwork()

  return (
    <SvgG id="group-legend">
      <SvgText
        textAnchor="start"
        dominantBaseline="auto"
        font={settings.plot.nodes.labels.text}
        fill={COLOR_BLACK}
        fontWeight="bold"
      >
        Groups
      </SvgText>
      <SvgG
        pos={{ x: settings.plot.legend.dot.radius, y: blockHeight / 2 }}
        id="groups"
      >
        {groups.map((group, gi) => (
          <SvgG
            key={group.id}
            pos={{
              x: 0,
              y: 10 + gi * blockHeight,
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

// export function nodeRadiusFunc(
//   settings: INetworkSettings
// ): (v: number) => number {
//   const nodeRadiusScale = (
//     settings.plot.nodes.scale.mode === 'sqrt'
//       ? d3.scaleSqrt()
//       : d3.scaleLinear()
//   )
//     .domain([0, 1]) // Your 0 to 1 score
//     .range([1, settings.plot.nodes.radius])
//   return nodeRadiusScale
// }

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
  return settings.data.applyMinusLog10ToMetric1
    ? `-log10(${capitalCase(headings.metric1)})`
    : capitalCase(headings.metric1)
}

export function getSize2Label(
  headings: { metric2: string },
  settings: INetworkSettings
): string {
  return settings.data.applyMinusLog10ToMetric2
    ? `-log10(${capitalCase(headings.metric2)})`
    : capitalCase(headings.metric2)
}
