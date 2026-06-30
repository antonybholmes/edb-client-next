import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { useDialogs } from '@/components/dialogs/dialogs'
import { CommaIcon } from '@/components/icons/comma-icon'
import { DownloadIcon } from '@/components/icons/download-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { useMessages } from '@/providers/message-provider'
import { produce } from 'immer'
import { DecimalsArrowLeft, DecimalsArrowRight } from 'lucide-react'
import { MESSAGE_CHANNEL } from '../data/data-panel'
import { useFiles } from '../history/history-provider/history-contexts'
import { useHistory } from '../history/history-provider/history-provider'
import { HistoryPlot } from '../history/history-provider/history-types'

import { pathJoin } from '../history/history-provider/history-actions'
import { useOpenFiles } from '../hooks/open'
import { useMatcalcDialogs } from '../matcalc-dialogs'
import { TEXT_DOT_PLOT, TEXT_HEATMAP } from '../matcalc-page'
import { useMatcalcSettings } from '../settings/matcalc-settings'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { open: openMatcalcDialog } = useMatcalcDialogs()
  const { file } = useFiles()
  const { sendMessage } = useMessages(MESSAGE_CHANNEL)

  const { addPlots } = useHistory()

  const { settings, updateSettings } = useMatcalcSettings()

  const { openDataFrames } = useOpenFiles()

  function _addPlots(plots: HistoryPlot[]) {
    addPlots(plots)

    updateSettings(
      produce(settings, (draft) => {
        draft.view.panels.tab = pathJoin(file, plots[0]!)
      })
    )
  }

  function makeClusterMap(isClusterMap: boolean) {
    openMatcalcDialog({
      type: 'heatmap',
      payload: {
        isClusterMap,
        callback: (plot) => _addPlots([plot]),
      },
    })
  }

  function makeDotPlot(isClusterMap: boolean) {
    openMatcalcDialog({
      type: 'dot-plot',
      payload: {
        isClusterMap,
        callback: (plot) => _addPlots([plot]),
      },
    })
  }

  return (
    <>
      <ToolbarTabGroup title="File" className="items-start">
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) => {
                onTextFileChange(message, files, (files) => {
                  openMatcalcDialog({
                    type: 'open-table-file',
                    payload: { files, callback: openDataFrames },
                  })
                })
              },
            })
          }}
        />

        <ToolbarIconButton
          title="Download current table to device"
          onClick={() => {
            sendMessage({
              type: 'info',
              source: 'matcalc',
              target: file?.id ?? '',
              data: 'save',
            })
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Plot" className="items-start">
        <ToolbarCol>
          <ToolbarButton
            onClick={() => makeClusterMap(false)}
            aria-label={TEXT_HEATMAP}
          >
            {TEXT_HEATMAP}
          </ToolbarButton>
          <ToolbarButton
            onClick={() => makeDotPlot(false)}
            aria-label={TEXT_DOT_PLOT}
          >
            Dot
          </ToolbarButton>
        </ToolbarCol>
        <ToolbarCol>
          <ToolbarButton
            title="Create Volcano Plot from Table"
            onClick={() => {
              openMatcalcDialog({
                type: 'volcano-plot',
                payload: {
                  callback: (plot) => _addPlots([plot]),
                },
              })
            }}
          >
            Volcano
          </ToolbarButton>

          <ToolbarButton
            title="Create Box Plot from Table"
            onClick={() => {
              openMatcalcDialog({
                type: 'box-whiskers',
                payload: {
                  callback: (plot) => _addPlots([plot]),
                },
              })
            }}
          >
            Box
          </ToolbarButton>
        </ToolbarCol>
        <ToolbarCol>
          <ToolbarButton
            title="Sankey Plot"
            onClick={() => {
              console.log('Opening Sankey Dialog')
              openMatcalcDialog({
                type: 'sankey-plot',
                payload: {
                  callback: (plot) => {
                    console.log('Sankey dialog returned plot', plot)
                    _addPlots([plot])
                  },
                },
              })
            }}
          >
            Sankey
          </ToolbarButton>
        </ToolbarCol>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Gene Expression">
        <ToolbarButton
          title="Download Gene Expression Data"
          onClick={() => openMatcalcDialog({ type: 'gex', payload: {} })}
        >
          Gene Expression
        </ToolbarButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Number" className="items-start">
        <ToolbarIconButton
          checked={settings.view.commas}
          title="Comma"
          onClick={() =>
            updateSettings(
              produce(settings, (draft) => {
                draft.view.commas = !draft.view.commas
              })
            )
          }
        >
          <CommaIcon />
        </ToolbarIconButton>
        <ToolbarCol>
          <ToolbarIconButton
            title="Decrease Decimal"
            onClick={() =>
              updateSettings(
                produce(settings, (draft) => {
                  draft.view.dp = Math.max(draft.view.dp - 1, 0)
                })
              )
            }
          >
            <DecimalsArrowLeft strokeWidth={1.5} size={20} />
          </ToolbarIconButton>
          <ToolbarIconButton
            title="Increase Decimal"
            onClick={() =>
              updateSettings(
                produce(settings, (draft) => {
                  draft.view.dp = Math.min(draft.view.dp + 1, 10)
                })
              )
            }
          >
            <DecimalsArrowRight strokeWidth={1.5} size={20} />
          </ToolbarIconButton>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
