import { SvgBase } from '@/components/plot/svg-base'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgText } from '@/components/plot/svg-text'
import { ISVGProps } from '@/interfaces/svg-props'
import { useMemo } from 'react'
import {
  ILayoutNode,
  ISankey,
  ISankeyLink,
  ISankeyNode,
  useSankey,
} from './sankey-provider'
import { ISankeySettings, useSankeySettings } from './sankey-settings-store'

const DEFAULT_NODE_COLOR = '#4F46E5'

export function SankeySvg({ ref }: ISVGProps) {
  const { plot, layoutMap, scale, byColumn, numCols } = useSankey()
  const { settings } = useSankeySettings()

  const w = useMemo(
    () => settings.width + settings.margin.left + settings.margin.right,
    [settings.width, settings.margin.left, settings.margin.right]
  )

  const h = useMemo(
    () => settings.height + settings.margin.top + settings.margin.bottom,
    [settings.height, settings.margin.top, settings.margin.bottom]
  )

  return (
    <SvgBase width={w} height={h} ref={ref}>
      {/* Define gradients for links */}
      {settings.links.color === 'gradient' &&
        gradientDefs(plot, layoutMap, settings)}

      <SvgMargin margin={settings.margin}>
        {linkPaths(numCols, byColumn, layoutMap, plot, settings, scale)}

        {Array.from(layoutMap.values()).map((node) => (
          <g key={node.id} id={`node-${node.id}`}>
            {settings.nodes.shape === 'rect' && (
              <rect
                x={node.x - settings.nodeWidth / 2}
                y={node.y}
                width={settings.nodeWidth}
                height={node.h}
                rx={settings.nodes.rounding}
                fill={node.color ?? DEFAULT_NODE_COLOR}
              />
            )}
            {settings.nodes.shape === 'circle' && (
              <circle
                cx={node.x}
                cy={node.y + node.h / 2}
                r={Math.max(settings.nodeWidth, node.h) / 2}
                fill={node.color ?? DEFAULT_NODE_COLOR}
              />
            )}
            {settings.nodes.labels.font.show && label(node, settings)}
          </g>
        ))}
      </SvgMargin>
    </SvgBase>
  )
}

function label(node: ILayoutNode, settings: ISankeySettings) {
  const x =
    node.x +
    (settings.nodes.labels.position === 'left'
      ? -(settings.nodeWidth / 2 + 8)
      : settings.nodes.labels.position === 'right'
        ? settings.nodeWidth / 2 + 8
        : 0)

  const y =
    node.y +
    (settings.nodes.labels.position === 'top'
      ? -8
      : settings.nodes.labels.position === 'bottom'
        ? node.h + 8
        : node.h / 2)

  const anchor =
    settings.nodes.labels.position === 'left'
      ? 'end'
      : settings.nodes.labels.position === 'right'
        ? 'start'
        : 'middle'

  return (
    <SvgText x={x} y={y} textAnchor={anchor} font={settings.nodes.labels.font}>
      {node.label}
    </SvgText>
  )
}

function gradientDefs(
  plot: ISankey,
  layoutMap: Map<string, ILayoutNode>,
  settings: ISankeySettings,
  offsetPercent: number = 5
) {
  return (
    <defs>
      {plot.links.map((link) => {
        const source = layoutMap.get(link.source)!
        const target = layoutMap.get(link.target)!
        const id = `gradient-${link.source}-${link.target}`
        return (
          <linearGradient
            key={id}
            id={id}
            gradientUnits="userSpaceOnUse"
            x1={source.x}
            y1={0}
            x2={target.x}
            y2={0}
          >
            <stop offset={`${offsetPercent}%`} stopColor={source.color} />
            <stop offset={`${100 - offsetPercent}%`} stopColor={target.color} />
          </linearGradient>
        )
      })}
    </defs>
  )
}

function linkPaths(
  cols: number,
  byColumn: Map<number, ISankeyNode[]>,
  layoutMap: Map<string, ILayoutNode>,
  plot: ISankey,
  settings: ISankeySettings,
  scale: number
) {
  // reorder links by source and target position to ensure consistent layering
  const sortedLinks: ISankeyLink[] = []

  const linkMap = new Map<string, ISankeyLink[]>()

  for (const link of plot.links) {
    const source = layoutMap.get(link.source)!

    if (!linkMap.has(source.id)) {
      linkMap.set(source.id, [])
    }

    linkMap.get(source.id)!.push(link)
  }

  const sourceTargetLinkMap = new Map<string, ISankeyLink>(
    plot.links.map((link) => [`${link.source}-${link.target}`, link])
  )

  for (let col = 0; col < cols - 1; col++) {
    const nodes = byColumn.get(col)

    if (nodes) {
      // sort by layout y position so smaller y (higher up) are rendered first
      const sortedSources = nodes.slice().sort((a, b) => {
        const la = layoutMap.get(a.id)!
        const lb = layoutMap.get(b.id)!

        return la.y - lb.y
      })

      for (const source of sortedSources) {
        // see what we point to
        const links = linkMap.get(source.id)!
        const targets = links.map((l) => l.target)

        const sortedTargets = targets
          .map((t) => layoutMap.get(t)!)
          .sort((a, b) => a.y - b.y)

        for (const target of sortedTargets) {
          const link = sourceTargetLinkMap.get(`${source.id}-${target.id}`)
          console.log('dsdsfsfd', `${source.id}-${target.id}`)
          sortedLinks.push(link!)
        }
      }
    }
  }

  const sourceOffset = new Map<string, number>()
  const targetOffset = new Map<string, number>()

  return (
    <>
      {sortedLinks.map((link, i) => {
        const source = layoutMap.get(link.source)!
        const target = layoutMap.get(link.target)!
        const gradientId = `gradient-${link.source}-${link.target}`

        const thickness = link.value * scale

        const sy = source.y + (sourceOffset.get(source.id) ?? 0) + thickness / 2

        const ty = target.y + (targetOffset.get(target.id) ?? 0) + thickness / 2

        sourceOffset.set(
          source.id,
          (sourceOffset.get(source.id) ?? 0) + thickness
        )

        targetOffset.set(
          target.id,
          (targetOffset.get(target.id) ?? 0) + thickness
        )

        const x0 = source.x
        const x1 = target.x
        const cx = (x0 + x1) / 2

        const r1 = Math.min(settings.nodeWidth, source.h)
        const r2 = Math.min(settings.nodeWidth, target.h)
        console.log({ r1, r2 })

        const d = `
          M ${x0} ${sy}
          
          C ${cx} ${sy}, ${cx} ${ty}, ${x1 - r2} ${ty}
          L ${x1} ${ty}
        `

        return (
          <path
            key={i}
            d={d}
            fill="none"
            //stroke={link.color ?? '#5B8FF9'}
            stroke={`url(#${gradientId})`}
            strokeWidth={thickness}
            strokeOpacity={settings.links.opacity}
          />
        )
      })}
    </>
  )
}
