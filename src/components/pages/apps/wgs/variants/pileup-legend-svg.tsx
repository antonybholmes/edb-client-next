import { ZERO_POS, type IPos } from '@/interfaces/pos'
import type { ISVGProps } from '@/interfaces/svg-props'
import { useVariantSettings } from './variant-settings-store'

interface IProps extends ISVGProps {
  pos?: IPos
}

export function PileupLegendSvg({ pos = ZERO_POS }: IProps) {
  // matching is case insensitive

  const { settings } = useVariantSettings()

  const cmap = settings.variants.cmap

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {cmap.colors.map((c, i) => (
        <g key={i} transform={`translate(0, ${i * 24})`}>
          <rect width={16} height={16} fill={c.color} />
          <text x={24} y={9} alignmentBaseline="middle">
            {c.name}
          </text>
        </g>
      ))}
    </g>
  )
}
