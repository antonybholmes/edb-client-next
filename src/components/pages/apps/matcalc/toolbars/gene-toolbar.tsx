import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { AnnotationDataFrame } from '@/lib/dataframe/annotation-dataframe'
import { useSelectionRange } from '@/providers/selection-range-provider'
import { produce } from 'immer'

import {
  useCurrentSheets,
  useFiles,
} from '../history/history-provider/history-contexts'

import { useHistory } from '../history/history-provider/history-provider'
import { HistoryPlot } from '../history/history-provider/history-types'

import { makeGCT } from '@/lib/dataframe/dataframe-utils'

import { useRunExtGsea } from '../../genes/gsea/use-run-ext-gsea'
import { pathJoin } from '../history/history-provider/history-actions'
import { useMatcalcDialogs } from '../matcalc-dialogs'
import { useMatcalcSettings } from '../settings/matcalc-settings'

export function GeneToolbar() {
  const { open: openMatcalcDialog } = useMatcalcDialogs()

  const { sheet } = useCurrentSheets()

  const { addSheets, addPlots } = useHistory()
  const { selection } = useSelectionRange()

  const { settings, updateSettings } = useMatcalcSettings()
  const { file } = useFiles()
  const { runExtGsea } = useRunExtGsea()

  function _addPlots(plots: HistoryPlot[]) {
    addPlots(plots)

    updateSettings(
      produce(settings, (draft) => {
        draft.view.panels.tab = pathJoin(file, plots[0]!)
      })
    )
  }

  function gct() {
    const df = makeGCT(sheet as AnnotationDataFrame) as AnnotationDataFrame

    addSheets([df])
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
              openMatcalcDialog({
                type: 'motif-to-gene',
                payload: {
                  selection,
                },
              })
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
            onClick={() => runExtGsea((plot) => _addPlots([plot]))}
          >
            Extended GSEA
          </ToolbarButton>
          <ToolbarButton
            title="GSEA Bubble"
            onClick={() => {
              openMatcalcDialog({
                type: 'gsea-bubble-plot',
                payload: {
                  callback: (plot) => _addPlots([plot]),
                },
              })
            }}
          >
            GSEA Bubble
          </ToolbarButton>
        </ToolbarCol>
        <ToolbarCol>
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
