import { ExtScrollCard } from '@/components/ext-scroll-card/ext-scroll-card'
import { makeUuid } from '@/lib/id'
import { useMemo } from 'react'
import { IGseaBubble, useGsea } from '../gsea-plot-store'
import { GseaBubbleProvider } from './gsea-bubble-provider'
import { GseaBubblePlotSvg } from './gsea-bubble-svg'

export function GseaBubbleTabPanel({
  svgRef,
}: {
  svgRef: React.RefObject<SVGSVGElement>
}) {
  const { inUseReports, phenotypesFilter } = useGsea()

  const bubblePlots: IGseaBubble[] = useMemo(() => {
    return Object.entries(phenotypesFilter)
      .filter(([_, show]) => show)
      .map(([phen, _]) => phen)
      .sort()
      .map((phen) => {
        const genesets = inUseReports.filter((r) => r.phen === phen)

        const bubble: IGseaBubble = {
          id: makeUuid(),
          name: phen,
          genesets,
          nes: { label: 'NES' },
          size: { label: 'Size' },
          log10q: { label: 'FDR q-val' },
        }
        return bubble
      })
      .filter((bubble) => bubble.genesets.length > 0)
  }, [inUseReports, phenotypesFilter])

  if (bubblePlots.length === 0) {
    return null
  }

  return (
    <ExtScrollCard className="px-2 pb-2">
      <GseaBubbleProvider plots={bubblePlots}>
        <GseaBubblePlotSvg ref={svgRef} />
      </GseaBubbleProvider>
    </ExtScrollCard>
  )
}
