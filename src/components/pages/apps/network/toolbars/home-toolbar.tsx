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
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { produce } from 'immer'
import { NetworkDialog } from '../network-dialog'
import { useNetworkSettings } from '../network-settings-store'

export function HomeToolbar() {
  const { openDataFrames } = useOpenFiles({ mode: 'set' })
  const { saveAs } = useSVG()
  const { settings, updateSettings } = useNetworkSettings()

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
                  openDataFrames(files, { indexCols: 0 })
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

      <ToolbarTabGroup title="Plot Size">
        <DoubleNumericalInput
          h="sm"
          v1={settings.plot.size.w}
          placeholder="Width"
          limit={[1, 5000]}
          dp={0}
          onNumChange1={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plot.size.w = v
              })
            )
          }}
          v2={settings.plot.size.h}
          onNumChange2={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plot.size.h = v
              })
            )
          }}
        />
      </ToolbarTabGroup>
    </>
  )
}
