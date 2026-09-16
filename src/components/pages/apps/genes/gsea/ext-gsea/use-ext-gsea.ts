import { useDialogs } from '@/components/dialogs/dialogs'

import { useRunning } from '@/components/toolbar/running-indicator'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { makeUuid } from '@/lib/id'
import { useFooter } from '@/providers/footer-provider'
import {
  useCurrentGenesets,
  useCurrentGroups,
  useCurrentSheets,
} from '../../../matcalc/history/history-provider/history-contexts'
import { snrRankGenes } from '../gsea-plot/gsea'
import { IExtGseaPlot, newExtGseaPlot } from './ext-gsea-provider'
import { useExtGseaWorker } from './ext-gsea-worker'

export function useExtGsea() {
  const { sheet } = useCurrentSheets()
  const { groups } = useCurrentGroups()
  const { genesets } = useCurrentGenesets()
  const { remove: removeFooter, addIndicator } = useFooter()
  const { setMessage, clearMessage } = useRunning('ext-gsea')

  const { run: runExtGseaWorker } = useExtGseaWorker()
  const { open: openDialog } = useDialogs()

  function runExtGsea(callback: (plot: IExtGseaPlot) => void) {
    if (groups.length < 2) {
      openDialog({
        type: 'alert',
        payload: {
          title: 'Extended GSEA',
          content: 'You need to create 2 groups/phenotypes.',
        },
      })
      return
    }

    if (genesets.length < 2) {
      openDialog({
        type: 'alert',
        payload: {
          title: 'Extended GSEA',
          content: 'You need to create 2 gene sets.',
        },
      })
      return
    }

    const id = addIndicator('Running Extended GSEA...')
    setMessage('Running Extended GSEA...')

    const group1 = groups[0]! //groupState.groups[groupState.order[0]!]!
    const group2 = groups[1]! //groupState.groups[groupState.order[1]!]!

    const scores = snrRankGenes(sheet as AnnotationDataFrame, group1, group2)

    const gs1 = genesets[0]! // genesets[genesetState.order[0]!]!
    const gs2 = genesets[1]! // genesetState.genesets[genesetState.order[1]!]!

    runExtGseaWorker(
      {
        scores,
        gs1,
        gs2,
      },
      (data) => {
        const { extGseaRes, gseaRes1, gseaRes2 } = data

        const plot = {
          ...newExtGseaPlot('Extended GSEA', {
            results: [
              {
                id: makeUuid(),
                name: 'Extended GSEA',
                scores,
                gs1: gs1,
                gs2: gs2,
                extGsea: extGseaRes,
                gsea1: gseaRes1,
                gsea2: gseaRes2,
              },
            ],
          }),
        }

        removeFooter('left', id)
        clearMessage()

        callback(plot)
      }
    )
  }

  return { runExtGsea }
}
