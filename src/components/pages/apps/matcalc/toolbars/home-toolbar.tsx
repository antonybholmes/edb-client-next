import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

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
import {
  ChartNoAxesCombined,
  ChevronDown,
  DecimalsArrowLeft,
  DecimalsArrowRight,
} from 'lucide-react'
import { MESSAGE_CHANNEL } from '../data/data-panel'
import { useFiles } from '../history/history-provider/history-contexts'
import { useHistory } from '../history/history-provider/history-provider'
import { HistoryPlot } from '../history/history-provider/history-types'

import { useDialogs } from '@/components/dialogs/dialogs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  MenuSeparator,
} from '@/components/shadcn/ui/themed/baseui/dropdown-menu'
import { ToolbarColSmallButton } from '@/components/toolbar/toolbar-col-button'
import { VolcanoDialog } from '../../volcano/volcano-dialog'
import { pathJoin } from '../history/history-provider/history-actions'
import { useOpenFiles } from '../hooks/open'
import { useMatcalcDialogs } from '../matcalc-dialogs'
import { TEXT_HEATMAP } from '../matcalc-page'
import { useMatcalcSettings } from '../settings/matcalc-settings'

export function HomeToolbar() {
  const { open: openMatcalcDialog } = useMatcalcDialogs()
  const { openCustom: openCustomDialog } = useDialogs()
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
              onFileChange: (files) => {
                onTextFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }
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
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <ToolbarColSmallButton
                title="Create Chart"
                icon={<ChartNoAxesCombined size={18} />}
              >
                <ChartNoAxesCombined size={22} />
                <span>Chart</span>
                <ChevronDown
                  size={12}
                  className="absolute bottom-0 opacity-50 left-1/2 -translate-x-1/2"
                />
              </ToolbarColSmallButton>
            }
          />
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => makeClusterMap(false)}>
              Heatmap
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => makeDotPlot(false)}>
              Dot Heatmap
            </DropdownMenuItem>
            <MenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                openCustomDialog(VolcanoDialog, {
                  callback: (plot) => {
                    _addPlots([plot])
                  },
                })
              }}
            >
              Volcano
            </DropdownMenuItem>

            <DropdownMenuItem
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
            </DropdownMenuItem>

            <DropdownMenuItem
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
            </DropdownMenuItem>
            <DropdownMenuItem
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
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <ToolbarCol>
          <ToolbarButton
            onClick={() => makeClusterMap(false)}
            aria-label={TEXT_HEATMAP}
          >
            {TEXT_HEATMAP}
          </ToolbarButton>
          {/* <ToolbarButton
            onClick={() => makeDotPlot(false)}
            aria-label={TEXT_DOT_PLOT}
          >
            Dot
          </ToolbarButton> */}
        </ToolbarCol>
        {/* <ToolbarCol>
          <ToolbarButton
            title="Create Volcano Plot from Table"
            onClick={() => {
              openCustomDialog(VolcanoDialog, {
                callback: (plot) => {
                  console.log('Volcano dialog returned plot', plot)
                  _addPlots([plot])
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
            title="Sankey"
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
        </ToolbarCol> */}
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
