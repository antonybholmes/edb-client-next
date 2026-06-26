import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { useDialogs } from '@/components/dialogs/dialogs'
import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { snrRankGenes } from '@/lib/gsea/gsea2'
import { useFooter } from '@/providers/footer-provider'
import { useSelectionRange } from '@/providers/selection-range-provider'
import { produce } from 'immer'
import { useExtGseaWorker } from '../apps/ext-gsea/ext-gsea-worker'
import {
  useCurrentGenesets,
  useCurrentGroups,
  useCurrentSheets,
  useFiles,
} from '../history/history-provider/history-contexts'
import { newExtGseaPlot } from '../history/history-provider/history-factories'
import { useHistory } from '../history/history-provider/history-provider'
import { HistoryPlot } from '../history/history-provider/history-types'

import { makeGCT } from '@/lib/dataframe/dataframe-utils'
import { pathJoin } from '../history/history-provider/history-actions'
import { useMatcalcDialogs } from '../matcalc-dialogs'
import { useMatcalcSettings } from '../settings/matcalc-settings'

export function GeneToolbar() {
  const { open: openMatcalcDialog } = useMatcalcDialogs()

  const { sheets } = useCurrentSheets()
  const { groups } = useCurrentGroups()
  const { genesets } = useCurrentGenesets()
  const { remove: removeFooter, addIndicator } = useFooter()
  const { addSheets, addPlots } = useHistory()
  const { selection } = useSelectionRange()
  const { run: runExtGseaWorker } = useExtGseaWorker()
  const { open: openDialog } = useDialogs()

  const { settings, updateSettings } = useMatcalcSettings()
  const { file } = useFiles()

  function _addPlots(plots: HistoryPlot[]) {
    addPlots(plots)

    updateSettings(
      produce(settings, (draft) => {
        draft.view.panels.tab = pathJoin(file, plots[0]!)
      })
    )
  }

  function gct() {
    const df = makeGCT(sheets[0] as AnnotationDataFrame) as AnnotationDataFrame

    addSheets([df])

    // history.current = ({
    //   step: history.current.step + 1,
    //   history: [{ title: df.name, df: [df] }],
    // })
  }

  function runExtGsea() {
    console.log(groups)

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
      sheets[0] as AnnotationDataFrame,
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
            rankedGenes,
            gs1: gs1,
            gs2: gs2,
            extGseaRes,
            gseaRes1,
            gseaRes2,
          }),
        }

        _addPlots([plot])
        // we've finished so get rid of the animations
        //closeToast(id)

        removeFooter('left', id)
      }
    )
  }

  return (
    <>
      <ToolbarTabGroup title="Annotation">
        <ToolbarCol>
          <ToolbarButton
            title="Convert Gene Symbols between Human and Mouse"
            onClick={() => {
              openMatcalcDialog({
                type: 'gene-species-convert',
                payload: {},
              })
            }}
          >
            Convert Species
          </ToolbarButton>

          <ToolbarButton
            title="Convert Motifs to Gene Symbols"
            onClick={() => {
              if (selection) {
                openMatcalcDialog({
                  type: 'motif-to-gene',
                  payload: {
                    selection,
                  },
                })
              }
            }}
          >
            Motif To Gene
          </ToolbarButton>
        </ToolbarCol>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="GSEA">
        <ToolbarCol>
          <ToolbarButton
            aria-label="Run Extended GSEA"
            onClick={() => runExtGsea()}
          >
            Extended GSEA
          </ToolbarButton>

          <ToolbarButton
            title="Convert Matrix to GSEA GCT Format"
            onClick={() => gct()}
          >
            GCT
          </ToolbarButton>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
