import { PlayIcon } from '@/components/icons/play-icon'
import { useOpenFiles } from '@/components/pages/apps/matcalc/hooks/open'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarColSmallButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_PLOT, TEXT_SAVE_IMAGE } from '@/consts'
import { useSVG } from '@/providers/svg-provider'

import { DownloadImageIcon } from '@/components/icons/computer/download-image-icon'
import { useHistory } from '../../matcalc/history/history-provider/history-provider'
import { useMatcalcDialogs } from '../../matcalc/matcalc-dialogs'

export function HomeToolbar() {
  const { openDataFrames } = useOpenFiles({ mode: 'set' })
  const { saveAs } = useSVG()
  const { addPlots } = useHistory()

  const { open: openMatcalcDialog } = useMatcalcDialogs()

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (files) => {
                onTextFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }
                  openDataFrames(files, { indexCols: 0 })
                })
              },
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            saveAs('volcano')
          }}
        >
          <DownloadImageIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Heatmap">
        <ToolbarColSmallButton
          icon={<PlayIcon variant="app-theme" />}
          title={TEXT_PLOT}
          onClick={() => {
            openMatcalcDialog({
              type: 'heatmap',
              payload: {
                callback: (plot) => {
                  console.log(plot)
                  addPlots([plot])
                },
              },
            })
          }}
        >
          <PlayIcon variant="app-theme" />
          {TEXT_PLOT}
        </ToolbarColSmallButton>
      </ToolbarTabGroup>
    </>
  )
}
