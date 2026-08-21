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
  const {
    reports,

    phenotypesFilter,
  } = useGsea()

  const bubblePlots: IGseaBubble[] = useMemo(() => {
    return Object.entries(phenotypesFilter)
      .filter(([_, show]) => show)
      .map(([phen, _]) => phen)
      .sort()
      .map((phen) => {
        const genesets = reports.filter((r) => r.phen === phen)

        const bubble: IGseaBubble = {
          id: makeUuid(),
          name: phen,
          genesets,
          nes: { label: '' },
          size: { label: '' },
          log10q: { label: '' },
        }
        return bubble
      })
      .filter((bubble) => bubble.genesets.length > 0)
  }, [reports, phenotypesFilter])

  return (
    <ExtScrollCard className="px-2 pb-2">
      <GseaBubbleProvider plots={bubblePlots}>
        <GseaBubblePlotSvg ref={svgRef} />
      </GseaBubbleProvider>
    </ExtScrollCard>
  )
}
