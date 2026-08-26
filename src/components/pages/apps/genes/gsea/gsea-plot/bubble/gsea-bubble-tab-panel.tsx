import { makeUuid } from '@/lib/id'
import { textJoin } from '@/lib/text/text'
import { useMemo } from 'react'
import { IGseaBubble, useGsea } from '../gsea-plot-store'
import { GseaBubbleProvider } from './gsea-bubble-provider'
import { useGseaBubbleSettings } from './gsea-bubble-settings-store'
import { GseaBubblePlotSvg } from './gsea-bubble-svg'

export function GseaBubbleTabPanel() {
  const { inUseReports, inUsePhenotypes } = useGsea()
  const { settings } = useGseaBubbleSettings()

  const bubblePlots: IGseaBubble[] = useMemo(() => {
    let plots = inUsePhenotypes
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

    if (settings.phenotypes.merge) {
      const mergedBubble: IGseaBubble = {
        id: makeUuid(),
        name: textJoin(inUsePhenotypes),
        genesets: plots.flatMap((bubble) => bubble.genesets),
        nes: { label: 'NES' },
        size: { label: 'Size' },
        log10q: { label: 'FDR q-val' },
      }
      plots = [mergedBubble]
    }

    return plots
  }, [inUseReports, inUsePhenotypes, settings.phenotypes.merge])

  return (
    <GseaBubbleProvider plots={bubblePlots}>
      <GseaBubblePlotSvg />
    </GseaBubbleProvider>
  )
}
