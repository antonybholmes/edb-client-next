import { TAB10_PALETTE } from '@/lib/color/palette'
import { makeUuid } from '@/lib/id'
import { textJoin } from '@/lib/text/text'
import { useEffect } from 'react'
import { IGseaBubble, useGsea } from '../gsea-store'
import { newGseaBubblePlot, useGseaBubbleContext } from './gsea-bubble-provider'
import { useGseaBubbleSettings } from './gsea-bubble-settings'
import { GseaBubblePlotsSvg } from './svg/gsea-bubble-plots-svg'

export function GseaBubbleTabPanel() {
  const { inUseReports, inUsePhenotypes } = useGsea()
  const { settings } = useGseaBubbleSettings()
  const { setPlots } = useGseaBubbleContext()

  useEffect(() => {
    let plots = inUsePhenotypes
      .map((phen) => {
        const genesets = inUseReports.filter((r) => r.phen === phen)

        const bubble: IGseaBubble = {
          id: makeUuid(),
          name: phen,
          groups: [
            {
              id: makeUuid(),
              show: true,
              name: 'default',
              color: TAB10_PALETTE[0],
              genesets,
            },
          ],

          nes: { label: 'NES' },
          size: { label: 'Size' },
          log10q: { label: 'FDR q-val' },
        }
        return newGseaBubblePlot(bubble)
      })
      .filter((bubble) => bubble.groups.flatMap((g) => g.genesets).length > 0)

    if (settings.phenotypes.merge) {
      const mergedBubble: IGseaBubble = {
        id: makeUuid(),
        name: textJoin(inUsePhenotypes),
        groups: [
          {
            id: makeUuid(),
            show: true,
            name: 'default',
            color: TAB10_PALETTE[0],
            genesets: plots.flatMap((bubble) =>
              bubble.groups.flatMap((g) => g.genesets)
            ),
          },
        ],

        nes: { label: 'NES' },
        size: { label: 'Size' },
        log10q: { label: 'FDR q-val' },
      }
      plots = [newGseaBubblePlot(mergedBubble)]
    }

    setPlots(plots)
  }, [inUseReports, inUsePhenotypes, settings.phenotypes.merge])

  return <GseaBubblePlotsSvg />
}
