import { SvgBase } from '@/components/plot/svg-base'
import { SvgMargin } from '@/components/plot/svg-margin'
import { SvgText } from '@/components/plot/svg-text'
import { ISVGProps } from '@/interfaces/svg-props'
import { useMemo, useRef } from 'react'
import { IOutputGraph, IOutputLink, IOutputNode } from './sankey-layout'
import { useSankey } from './sankey-provider'
import { ISankeySettings, useSankeySettings } from './sankey-settings-store'

const DEFAULT_NODE_COLOR = '#4F46E5'

const NO_DRAG = Object.freeze({
  element: null,
  startX: 0,
  startY: 0,
  node: null,
  links: [],
})

export function SankeySvg({ ref }: ISVGProps) {
  const { graph, updateLinks } = useSankey()
  const { settings } = useSankeySettings()
  //const [dragging, setDragging] = useState(false)

  const svgRef = useRef<SVGSVGElement>(null)

  const dragRef = useRef<{
    element: SVGCircleElement | SVGRectElement | SVGGElement | null
    startX: number // for tracking mouse dx
    startY: number // for tracking mouse dy
    // store the original node position at the start of drag to calculate new position during dragging
    node: IOutputNode | null
    links: IOutputLink[]
  }>(NO_DRAG)

  function handlePointerUp() {
    dragRef.current = NO_DRAG // { ...NO_DRAG }
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragRef.current.element || !graph) {
      return
    }

    console.log('pointer move', dragRef.current)

    const p = getSvgPoint(svgRef.current!, e.clientX, e.clientY)

    const d = {
      x: p.x - dragRef.current.startX,
      y: p.y - dragRef.current.startY,
    }

    console.log('pointer move', d)

    const id = dragRef.current.element.id.replace('node-', '')
    console.log('dragging node', id)

    const node = dragRef.current.node!

    const y0 = node.y0 + d.y
    const y1 = node.y1 + d.y

    const newNode = {
      ...node,
      x0: node.x0 + d.x,
      x1: node.x1 + d.x,
      y0,
      y1,
    }

    //updateNode(newNode)

    // we need all links connected to this node to also update their positions,
    // since link positions are derived from node positions

    const newLinks = dragRef.current.links.map((link) => {
      const newLink = { ...link }

      if (link.source.id === node.id) {
        newLink.y0! += d.y
      } else {
        newLink.y1! += d.y
      }

      return newLink
    })

    console.log('updating connected links', newLinks)

    updateLinks(newNode, newLinks)
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

  const nodes = Array.from(graph.nodes.values())

  function SVGNode({
    node,
    settings,
  }: {
    node: IOutputNode
    settings: ISankeySettings
  }) {
    function handlePointerDown(
      e: React.PointerEvent<SVGCircleElement | SVGRectElement>
    ) {
      if (!svgRef.current || !graph) {
        return
      }

      e.currentTarget.setPointerCapture(e.pointerId)

      const start = getSvgPoint(svgRef.current!, e.clientX, e.clientY)

      console.log('pointer down', e, e.currentTarget)

      const id = e.currentTarget.id.replace('node-', '')

      const node = graph.nodes.get(id)

      if (!node) {
        return
      }

      const connectedLinks = graph.links.filter(
        (l) => l.source.id === node.id || l.target.id === node.id
      )

      dragRef.current = {
        element: e.currentTarget,
        startX: start.x,
        startY: start.y,
        // we must clone the node and links here to avoid mutating the graph state directly during dragging,
        // which would cause issues with React's rendering and state management
        node: { ...node },
        links: connectedLinks.map((l) => ({ ...l })),
      }
    }

    const w = node.x1 - node.x0
    const h = node.y1 - node.y0 + settings.nodes.oversize
    return (
      <g key={node.id} id={`node-${node.id}`} onPointerDown={handlePointerDown}>
        {settings.nodes.shape === 'rect' && (
          <rect
            x={node.x0 - settings.nodes.width / 2}
            y={node.y0 - settings.nodes.oversize / 2}
            width={settings.nodes.width}
            height={h}
            rx={settings.nodes.rounding}
            fill={node.color ?? DEFAULT_NODE_COLOR}
            fillOpacity={settings.nodes.opacity}
          />
        )}
        {settings.nodes.shape === 'circle' && (
          <circle
            cx={node.x0}
            cy={node.y0 + (node.y1 - node.y0 + settings.nodes.oversize) / 2}
            r={(Math.max(w, h) + settings.nodes.oversize) / 2}
            fill={node.color ?? DEFAULT_NODE_COLOR}
            fillOpacity={settings.nodes.opacity}
            //onPointerDown={handlePointerDown}
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
      ref={(r) => {
        svgRef.current = r

        if (typeof ref === 'function') {
          ref(r)
        } else if (ref) {
          ref.current = r
        }
      }}
      scale={settings.scale}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      {/* Define gradients for links */}
      {settings.links.colorMode === 'gradient' && gradientDefs(graph, settings)}

      <SvgMargin margin={settings.margin}>
        {linkPaths(graph, settings)}

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
  node: IOutputNode
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

  settings: ISankeySettings
) {
  return (
    <defs>
      {graph.links.map((link) => {
        const sourceId = (link.source as IOutputNode).id
        const targetId = (link.target as IOutputNode).id
        const source = graph.nodes.get(sourceId)!
        const target = graph.nodes.get(targetId)!

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

  settings: ISankeySettings
) {
  return (
    <>
      {graph.links.map((link, i) => {
        const sourceId = (link.source as IOutputNode).id
        const targetId = (link.target as IOutputNode).id

        const source = graph.nodes.get(sourceId)!
        const target = graph.nodes.get(targetId)!
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

        const cx = (x0 + x1 - settings.nodes.width) / 2

        // const d = `
        //   M ${x0} ${link.y0}
        //   L ${x0 + r1} ${link.y0}
        //   C ${cx} ${link.y0}, ${cx} ${link.y1}, ${x1 - r2} ${link.y1}
        //   L ${x1} ${link.y1}
        // `

        const y0 = link.y0
        const y1 = link.y1

        const d = `
          M ${x0} ${y0}
          C ${cx} ${y0}, ${cx} ${y1}, ${x1} ${y1}
        `

        let color = settings.links.color

        switch (settings.links.colorMode) {
          case 'gradient':
            color = `url(#${gradientId})`
            break

          case 'source':
            color = source.color || settings.links.color
            break
          case 'target':
            color = target.color || settings.links.color
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

function getSvgPoint(svg: SVGSVGElement, clientX: number, clientY: number) {
  const pt = svg.createSVGPoint()
  pt.x = clientX
  pt.y = clientY

  return pt.matrixTransform(svg.getScreenCTM()!.inverse())
}
