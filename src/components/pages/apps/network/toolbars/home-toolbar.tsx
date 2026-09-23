import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import { useOpenFiles } from '@/components/pages/apps/matcalc/hooks/open'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarColButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_PLOT, TEXT_SAVE_IMAGE } from '@/consts'
import { useSVG } from '@/providers/svg-provider'

import { useDialogs } from '@/components/dialogs/dialogs'
import { NetworkDialog } from '../network-dialog'

export function HomeToolbar() {
  const { openDataFrames } = useOpenFiles({ mode: 'set' })
  const { saveAs } = useSVG()

  const { openCustom: openCustomDialog } = useDialogs()

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
                  openDataFrames(files, { indexCols: 1 })
                })
              },
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            saveAs('network')
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Network">
        <ToolbarColButton
          icon={<PlayIcon variant="app-theme" />}
          title={TEXT_PLOT}
          onClick={() => {
            openCustomDialog(NetworkDialog, {})
          }}
        >
          <PlayIcon variant="app-theme" />
          {TEXT_PLOT}
        </ToolbarColButton>
      </ToolbarTabGroup>
    </>
  )
}
