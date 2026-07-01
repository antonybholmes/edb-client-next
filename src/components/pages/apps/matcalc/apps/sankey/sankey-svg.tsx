import { SvgBase } from '@/components/plot/svg-base'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgText } from '@/components/plot/svg-text'
import { ISVGProps } from '@/interfaces/svg-props'
import { useMemo, useState } from 'react'
import { IOutputGraph, IOutputNode } from './sankey-layout'
import { ILayoutNode, useSankey } from './sankey-provider'
import { ISankeySettings, useSankeySettings } from './sankey-settings-store'

const DEFAULT_NODE_COLOR = '#4F46E5'

export function SankeySvg({ ref }: ISVGProps) {
  const { plot, layoutMap, graph } = useSankey()
  const { settings } = useSankeySettings()
  const [dragging, setDragging] = useState(false)
  const [pos, setPos] = useState({ x: 100, y: 100 })

  function handlePointerUp() {
    setDragging(false)
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragging) return

    const svg = e.currentTarget
    const pt = svg.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY

    const p = pt.matrixTransform(svg.getScreenCTM()!.inverse())

    console.log('pointer move', p)

    setPos({
      x: p.x,
      y: p.y,
    })
  }

  const w = useMemo(
    () => settings.width + settings.margin.left + settings.margin.right,
    [settings.width, settings.margin.left, settings.margin.right]
  )

  const h = useMemo(
    () => settings.height + settings.margin.top + settings.margin.bottom,
    [settings.height, settings.margin.top, settings.margin.bottom]
  )

  if (!graph) {
    return null
  }

  const nodes = graph.nodes as ILayoutNode[]

  function SVGNode({
    node,
    settings,
  }: {
    node: ILayoutNode
    settings: ISankeySettings
  }) {
    function handlePointerDown(
      e: React.PointerEvent<SVGCircleElement | SVGRectElement>
    ) {
      e.currentTarget.setPointerCapture(e.pointerId)
      setDragging(true)
    }

    const w = node.x1 - node.x0
    const h = node.y1 - node.y0
    return (
      <g key={node.id} id={`node-${node.id}`}>
        {settings.nodes.shape === 'rect' && (
          <rect
            x={node.x0 - settings.nodes.width / 2}
            y={node.y0}
            width={settings.nodes.width}
            height={node.y1 - node.y0}
            rx={settings.nodes.rounding}
            fill={node.color ?? DEFAULT_NODE_COLOR}
            fillOpacity={settings.nodes.opacity}
            onPointerDown={handlePointerDown}
          />
        )}
        {settings.nodes.shape === 'circle' && (
          <circle
            cx={node.x0}
            cy={node.y0 + (node.y1 - node.y0) / 2}
            r={Math.max(w, h) / 2}
            fill={node.color ?? DEFAULT_NODE_COLOR}
            fillOpacity={settings.nodes.opacity}
            onPointerDown={handlePointerDown}
          />
        )}
        {settings.nodes.labels.font.show && (
          <SVGLabel node={node} settings={settings} />
        )}
      </g>
    )
  }

  return (
    <SvgBase
      width={w}
      height={h}
      ref={ref}
      scale={settings.scale}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Define gradients for links */}
      {settings.links.colorMode === 'gradient' &&
        gradientDefs(graph, layoutMap, settings)}

      <SvgMargin margin={settings.margin}>
        {linkPaths(graph, layoutMap, settings)}

        {nodes.map((node) => {
          return <SVGNode key={node.id} node={node} settings={settings} />
        })}
      </SvgMargin>
    </SvgBase>
  )
}

function SVGLabel({
  node,
  settings,
}: {
  node: ILayoutNode
  settings: ISankeySettings
}) {
  const w = node.x1 - node.x0
  const x =
    node.x0 +
    (settings.nodes.labels.position === 'left'
      ? -(w / 2 + 8)
      : settings.nodes.labels.position === 'right'
        ? w / 2 + 8
        : 0)

  const h = node.y1 - node.y0

  const y =
    node.y0 +
    (settings.nodes.labels.position === 'top'
      ? -8
      : settings.nodes.labels.position === 'bottom'
        ? h + 8
        : h / 2)

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
  graph: IOutputGraph,
  layoutMap: Map<string, ILayoutNode>,
  settings: ISankeySettings
) {
  return (
    <defs>
      {graph.links.map((link) => {
        const sourceId = (link.source as IOutputNode).id
        const targetId = (link.target as IOutputNode).id
        const source = layoutMap.get(sourceId)!
        const target = layoutMap.get(targetId)!

        //console.log(layoutMap, link, 'source', source, 'target', target)

        const id = `gradient-${sourceId}-${targetId}`
        return (
          <linearGradient
            key={id}
            id={id}
            gradientUnits="userSpaceOnUse"
            x1={source.x0}
            y1={0}
            x2={target.x0}
            y2={0}
          >
            <stop
              offset={`${settings.links.gradientOffset * 100}%`}
              stopColor={source.color}
            />
            <stop
              offset={`${100 - settings.links.gradientOffset * 100}%`}
              stopColor={target.color}
            />
          </linearGradient>
        )
      })}
    </defs>
  )
}

function linkPaths(
  graph: IOutputGraph,
  layoutMap: Map<string, ILayoutNode>,

  settings: ISankeySettings
) {
  // reorder links by source and target position to ensure consistent layering
  // const sortedLinks: ISankeyLink[] = []

  // const linkMap = new Map<string, ISankeyLink[]>()

  // for (const link of plot.links) {
  //   const source = layoutMap.get(link.source)!

  //   if (!linkMap.has(source.id)) {
  //     linkMap.set(source.id, [])
  //   }

  //   linkMap.get(source.id)!.push(link)
  // }

  // const sourceTargetLinkMap = new Map<string, ISankeyLink>(
  //   plot.links.map((link) => [`${link.source}-${link.target}`, link])
  // )

  // for (let col = 0; col < cols - 1; col++) {
  //   const nodes = byColumn.get(col)

  //   if (nodes) {
  //     // sort by layout y position so smaller y (higher up) are rendered first
  //     const sortedSources = nodes.slice().sort((a, b) => {
  //       const la = layoutMap.get(a.id)!
  //       const lb = layoutMap.get(b.id)!

  //       return la.y - lb.y
  //     })

  //     for (const source of sortedSources) {
  //       // see what we point to
  //       const links = linkMap.get(source.id)!
  //       const targets = links.map((l) => l.target)

  //       const sortedTargets = targets
  //         .map((t) => layoutMap.get(t)!)
  //         .sort((a, b) => a.y - b.y)

  //       for (const target of sortedTargets) {
  //         const link = sourceTargetLinkMap.get(`${source.id}-${target.id}`)
  //         console.log('dsdsfsfd', `${source.id}-${target.id}`)
  //         sortedLinks.push(link!)
  //       }
  //     }
  //   }
  // }

  //const sourceOffset = new Map<string, number>()
  //const targetOffset = new Map<string, number>()

  return (
    <>
      {graph.links.map((link, i) => {
        const sourceId = (link.source as IOutputNode).id
        const targetId = (link.target as IOutputNode).id

        const source = layoutMap.get(sourceId)!
        const target = layoutMap.get(targetId)!
        const gradientId = `gradient-${sourceId}-${targetId}`

        // const thickness = link.value * scale

        // const sy = source.y0 + (sourceOffset.get(source.id) ?? 0) + thickness / 2

        // const ty = target.y + (targetOffset.get(target.id) ?? 0) + thickness / 2

        // sourceOffset.set(
        //   source.id,
        //   (sourceOffset.get(source.id) ?? 0) + thickness
        // )

        // targetOffset.set(
        //   target.id,
        //   (targetOffset.get(target.id) ?? 0) + thickness
        // )

        const x0 = source.x0
        const x1 = target.x0

        const r1 =
          settings.nodes.shape === 'rect'
            ? settings.nodes.width
            : (source.y1 - source.y0) / 4

        const r2 =
          settings.nodes.shape === 'rect'
            ? settings.nodes.width
            : (target.y1 - target.y0) / 4

        const cx = (x0 + x1 - settings.nodes.width) / 2

        // const d = `
        //   M ${x0} ${link.y0}
        //   L ${x0 + r1} ${link.y0}
        //   C ${cx} ${link.y0}, ${cx} ${link.y1}, ${x1 - r2} ${link.y1}
        //   L ${x1} ${link.y1}
        // `

        const d = `
          M ${x0} ${link.y0}
          C ${cx} ${link.y0}, ${cx} ${link.y1}, ${x1} ${link.y1}
  
        `

        let color = settings.links.color

        switch (settings.links.colorMode) {
          case 'gradient':
            color = `url(#${gradientId})`
            break

            break
          case 'source':
            color = source.color ?? settings.links.color
            break
          case 'target':
            color = target.color ?? settings.links.color
            break
          default:
            color = settings.links.color
            break
        }

        return (
          <path
            key={i}
            d={d}
            fill="none"
            //stroke={link.color ?? '#5B8FF9'}
            stroke={color}
            strokeWidth={link.width}
            strokeOpacity={settings.links.opacity}
          />
        )
      })}
    </>
  )
}
