import { useDialogs } from '@/components/dialogs/dialogs'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { snrRankGenes } from '@/lib/gsea/gsea2'
import { makeUuid } from '@/lib/id'
import { useFooter } from '@/providers/footer-provider'
import {
  useCurrentGenesets,
  useCurrentGroups,
  useCurrentSheets,
} from '../../matcalc/history/history-provider/history-contexts'
import { IExtGseaPlot, newExtGseaPlot } from './ext-gsea/ext-gsea-provider'
import { useExtGseaWorker } from './ext-gsea/ext-gsea-worker'

export function useRunExtGsea() {
  const { sheet } = useCurrentSheets()
  const { groups } = useCurrentGroups()
  const { genesets } = useCurrentGenesets()
  const { remove: removeFooter, addIndicator } = useFooter()

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

    /* const { dismiss: dismissSpinnerToast } = toast({
            title: 'Extended GSEA',
            description: (
              <ToastSpinner>
                Running extended GSEA, please do not refresh your browser window...
              </ToastSpinner>
            ),
            durationMs: 60000,
          })
      
          setTimeout(() => {
            const group1 = groupState.groups[groupState.order[0]!]!
            const group2 = groupState.groups[groupState.order[1]!]!
      
            const rankedGenes = rankGenes(df, group1, group2)
      
            const extGsea = new ExtGSEA(rankedGenes)
      
            const gs1 = genesetState.genesets[genesetState.order[0]!]!
            const gs2 = genesetState.genesets[genesetState.order[1]!]!
      
            // run and cache results
            extGsea.runExtGsea(gs1, gs2)
      
            dismissSpinnerToast()
      
            plotsDispatch({
              type: 'add',
              style: 'Extended GSEA',
              //cf: { df },
              customProps: { extGsea },
            })
          }, 1000) */

    // const id = makeUuid()

    // addToast({
    //   id,
    //   title: APP_INFO.name,
    //   description:
    //     'Running Extended GSEA, please do not refresh your browser window...',

    //   timeout: 60000,
    // })

    const id = addIndicator('Running Extended GSEA...')

    const group1 = groups[0]! //groupState.groups[groupState.order[0]!]!
    const group2 = groups[1]! //groupState.groups[groupState.order[1]!]!

    const rankedGenes = snrRankGenes(
      sheet as AnnotationDataFrame,
      group1,
      group2
    )

    const gs1 = genesets[0]! // genesets[genesetState.order[0]!]!
    const gs2 = genesets[1]! // genesetState.genesets[genesetState.order[1]!]!

    runExtGseaWorker(
      {
        rankedGenes,
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
                rankedGenes,
                gs1: gs1,
                gs2: gs2,
                extGsea: extGseaRes,
                gsea1: gseaRes1,
                gsea2: gseaRes2,
              },
            ],
          }),
        }

        // we've finished so get rid of the animations
        //closeToast(id)

        removeFooter('left', id)

        callback(plot)
      }
    )
  }

  return { runExtGsea }
}
