import { SvgBase } from '@/components/plot/svg-base'
import { ISVGProps } from '@/interfaces/svg-props'
import { ISankeyNode, useSankey } from './sankey-provider'
import { useSankeySettings } from './sankey-settings-store'

interface ILayoutNode extends ISankeyNode {
  x: number
  y: number
  h: number
}

export function SankeySvg({ ref }: ISVGProps) {
  const { plot } = useSankey()
  const { settings } = useSankeySettings()

  const nodeMap = new Map(plot.nodes.map((n) => [n.id, n]))

  const numCols = Math.max(...plot.nodes.map((n) => n.column)) + 1
  const xSpacing =
    numCols > 1 ? (settings.width - settings.nodeWidth) / (numCols - 1) : 0

  // Compute node totals
  const nodeMaxTotalMap = new Map<string, number>()

  // for each node, compute the total incoming and outgoing flow and
  // take the max of the two to determine the node height
  for (const node of plot.nodes) {
    const incoming = plot.links
      .filter((l) => l.target === node.id)
      .reduce((a, b) => a + b.value, 0)

    const outgoing = plot.links
      .filter((l) => l.source === node.id)
      .reduce((a, b) => a + b.value, 0)

    nodeMaxTotalMap.set(node.id, Math.max(incoming, outgoing))
  }

  // Compute scaling

  // Arrange nodes by column
  const byColumn = new Map<number, ISankeyNode[]>()

  for (let i = 0; i < numCols; i++) {
    byColumn.set(i, [])
  }

  for (const node of plot.nodes) {
    byColumn.get(node.column)!.push(node)
  }

  let scale = Infinity

  for (const column of byColumn.values()) {
    let total = 0

    for (const node of column) {
      total += nodeMaxTotalMap.get(node.id) ?? 0
    }

    // Allow for padding between nodes
    total += (column.length - 1) * settings.padding

    scale = Math.min(scale, settings.height / total)
  }

  const layout = new Map<string, ILayoutNode>()

  // Vertical layout
  for (let c = 0; c < numCols; c++) {
    let y = 0

    for (const node of byColumn.get(c)!) {
      const h = (nodeMaxTotalMap.get(node.id) ?? 0) * scale

      layout.set(node.id, {
        ...node,
        x: c * xSpacing,
        y,
        h,
      })

      y += h + settings.padding
    }
  }

  const sourceOffset = new Map<string, number>()
  const targetOffset = new Map<string, number>()

  return (
    <SvgBase width={settings.width} height={settings.height} ref={ref}>
      {/* Links */}
      {plot.links.map((link, i) => {
        const source = layout.get(link.source)!
        const target = layout.get(link.target)!

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

        const x0 = source.x + settings.nodeWidth
        const x1 = target.x
        const cx = (x0 + x1) / 2

        const d = `
          M ${x0} ${sy}
          C ${cx} ${sy},
            ${cx} ${ty},
            ${x1} ${ty}
        `

        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={link.color ?? '#5B8FF9'}
            strokeWidth={thickness}
            strokeOpacity={0.4}
          />
        )
      })}

      {/* Nodes */}
      {Array.from(layout.values()).map((node) => (
        <g key={node.id}>
          <rect
            x={node.x}
            y={node.y}
            width={settings.nodeWidth}
            height={node.h}
            rx={3}
            fill="#4F46E5"
          />
          <text
            x={node.x + settings.nodeWidth + 8}
            y={node.y + node.h / 2}
            dominantBaseline="middle"
            fontSize={13}
            fontFamily="sans-serif"
          >
            {node.label}
          </text>
        </g>
      ))}
    </SvgBase>
  )
}
