import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { COLOR_BLACK } from '@/lib/color/color'
import { range } from '@/lib/math/range'
import { useVariantSettings } from './variant-settings-store'
import { useVariants } from './variant-store'

export const BASE_W = 16
export const HALF_BASE_W = 0.5 * BASE_W
export const BASE_H = 20
export const HALF_BASE_H = 0.5 * BASE_H

export function DNASvg({ pos = ZERO_POS }: { pos?: IPos }) {
  const { settings } = useVariantSettings()
  let { dna } = useVariants()

  if (!dna || !settings.dna.show) {
    return null
  }

  const innerWidth = (dna?.seq.length ?? 0) * BASE_W

  const bgColors = new Map<number, string>()
  const fgColors = new Map<number, string>()

  // whether to show things like AID motifs or not

  if (settings.motifs.show && settings.dna.motifs.show) {
    for (const motif of settings.motifs.patterns) {
      if (motif.show) {
        const matches = [
          ...dna.seq.matchAll(
            new RegExp(motif.regex.pattern, motif.regex.flags)
          ),
        ]

        for (const match of matches) {
          range(match[0].length).forEach(i => {
            bgColors.set(match.index + i, motif.bgColor)
            fgColors.set(match.index + i, motif.color)
          })
        }
      }
    }
  }

  // matching is case insensitive

  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {settings.dna.index.show && (
        <g transform={`translate(0, ${-BASE_H})`}>
          {dna.seq.split('').map((_, bi) => (
            <text
              x={bi * BASE_W}
              y={1}
              key={bi}
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize="x-small"
            >
              {bi + 1}
            </text>
          ))}
        </g>
      )}

      <g transform={`translate(${-HALF_BASE_W}, 0)`}>
        {dna.seq.split('').map((_base, bi) => (
          <rect
            x={bi * BASE_W}
            y={-HALF_BASE_H}
            width={BASE_W}
            height={BASE_H}
            key={bi}
            rx={2}
            fill={bgColors.get(bi) ?? 'none'}
            fillOpacity={0.1}
          />
        ))}
      </g>

      <g>
        {dna.seq.split('').map((base, bi) => (
          <text
            x={bi * BASE_W}
            y={1}
            key={bi}
            textAnchor="middle"
            alignmentBaseline="middle"
            //fontWeight="bold"
            fill={fgColors.get(bi) ?? COLOR_BLACK}
          >
            {base}
          </text>
        ))}
      </g>

      {settings.dna.border.show && (
        <g transform={`translate(${-HALF_BASE_W}, 0)`}>
          <line
            x1={0}
            y1={-HALF_BASE_H}
            y2={-HALF_BASE_H}
            x2={innerWidth}
            stroke={settings.dna.border.color}
            strokeWidth={settings.dna.border.width}
          />
          <line
            x1={0}
            y1={HALF_BASE_H}
            y2={HALF_BASE_H}
            x2={innerWidth}
            stroke={settings.dna.border.color}
            strokeWidth={settings.dna.border.width}
          />
        </g>
      )}
    </g>
  )
}
