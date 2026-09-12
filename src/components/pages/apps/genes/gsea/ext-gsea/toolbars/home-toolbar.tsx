import { DownloadIcon } from '@/components/icons/download-icon'
import { PlayIcon } from '@/components/icons/play-icon'
import { useOpenFiles } from '@/components/pages/apps/matcalc/hooks/open'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { ToolbarColButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_PLOT, TEXT_SAVE_IMAGE } from '@/consts'
import { useSVG } from '@/providers/svg-provider'
import { produce } from 'immer'

import { useDialogs } from '@/components/dialogs/dialogs'
import { useExtGseaSettings } from '../ext-gsea-settings'
import { InputDialog } from '../input-dialog'

export function HomeToolbar() {
  const { openCustom: openCustomDialog } = useDialogs()
  const { settings, updateSettings } = useExtGseaSettings()
  const { openDataFrames } = useOpenFiles({ mode: 'set' })
  const { saveAs } = useSVG()

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
            saveAs('ext-gsea')
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Ext GSEA">
        <ToolbarColButton
          icon={<PlayIcon variant="app-theme" />}
          title={TEXT_PLOT}
          onClick={() => {
            openCustomDialog(InputDialog, {})
          }}
        >
          <PlayIcon variant="app-theme" />
          {TEXT_PLOT}
        </ToolbarColButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Plot Size" className="gap-x-2">
        <ToolbarRow title="Width">
          <NumericalInput
            h="md"
            value={settings.axes.x.length}
            placeholder="Width"
            limit={[1, 1000]}
            dp={0}
            onNumChange={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.axes.x.length = v
                })
              )
            }}
          />
        </ToolbarRow>
        <ToolbarRow title="ES Height">
          <NumericalInput
            h="md"
            value={settings.es.axes.y.length}
            placeholder="Height"
            limit={[1, 1000]}
            dp={0}
            onNumChange={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.es.axes.y.length = v
                })
              )
            }}
          />
        </ToolbarRow>
      </ToolbarTabGroup>
    </>
  )
}
