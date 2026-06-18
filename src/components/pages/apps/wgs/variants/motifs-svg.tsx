import type { Axis } from '@/components/plot/axis'
import { ZERO_POS, type IPos } from '@/interfaces/pos'
import { useMemo } from 'react'
import { useVariantSettings } from './variant-settings-store'
import { useVariants } from './variant-store'

export const BASE_W = 16
export const HALF_BASE_W = 0.5 * BASE_W
export const BASE_H = 20
export const HALF_BASE_H = 0.5 * BASE_H

export function MotifsSvg({ xax, pos = ZERO_POS }: { xax: Axis; pos?: IPos }) {
  const { settings } = useVariantSettings()
  let { dna } = useVariants()

  const motifLocs = useMemo(() => {
    if (!settings.motifs.show) {
      return []
    }

    const motifLocs: {
      name: string
      color: string
      locations: { x1: number; x2: number }[]
    }[] = []

    for (const motif of settings.motifs.patterns) {
      if (motif.show) {
        const matches = [
          ...(dna?.seq.matchAll(
            new RegExp(motif.regex.pattern, motif.regex.flags)
          ) ?? []),
        ]

        motifLocs.push({
          name: motif.name,
          color: motif.color,
          locations: matches.map(m => ({
            x1: xax.domainToRange(settings.location.start + (m.index ?? 0)),
            x2: xax.domainToRange(
              settings.location.start + (m.index ?? 0) + (m[0].length ?? 0) - 1
            ),
          })),
        })
      }
    }

    return motifLocs
  }, [
    dna,
    settings.motifs.show,
    settings.motifs.patterns,
    settings.location.start,
    xax,
  ])

  const innerWidth = (dna?.seq.length ?? 0) * BASE_W

  if (!settings.motifs.show || settings.motifs.patterns.length === 0) {
    return null
  }
  return (
    <g transform={`translate(${pos.x}, ${pos.y})`}>
      {motifLocs.map((motif, mi) => (
        <g key={motif.name} transform={`translate(0, ${mi * 30})`}>
          <g transform={`translate(${innerWidth * 0.5}, ${0})`}>
            <text
              textAnchor="middle"
              alignmentBaseline="middle"
              fontSize="small"
              fontWeight="bold"
            >
              {motif.name} motif
            </text>
          </g>

          <g transform={`translate(0, 10)`}>
            {motif.locations.map((loc, li) => (
              <rect
                key={`${mi}:${li}`}
                x={loc.x1}
                width={loc.x2 - loc.x1}
                height={10}
                fill={motif.color}
              />
            ))}
          </g>
        </g>
      ))}
    </g>
  )
}
