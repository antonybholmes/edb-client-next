import { useOpenFiles } from '@/components/pages/apps/matcalc/hooks/open'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'
import { TEXT_SAVE_IMAGE } from '@/consts'
import { useSVG } from '@/providers/svg-provider'

import { DownloadImageIcon } from '@/components/icons/computer/download-image-icon'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { produce } from 'immer'

import { useVolcanoSettings } from '../crispr-settings'

export function HomeToolbar() {
  const { openDataFrames } = useOpenFiles({ mode: 'set' })
  const { saveAs } = useSVG()

  const { settings, updateSettings } = useVolcanoSettings()

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
            saveAs('volcano')
          }}
        >
          <DownloadImageIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Plot Size" className="gap-x-2">
        <ToolbarCol>
          <ToolbarRow title="Width" titleCls="w-10" smallTitle="W">
            <NumericalInput
              h="toolbar"
              value={settings.axes.xaxis.length}
              placeholder="Width"
              limit={[1, 1000]}
              dp={0}
              onNumChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.axes.xaxis.length = v
                  })
                )
              }}
            />
          </ToolbarRow>
          <ToolbarRow title="Height" titleCls="w-10" smallTitle="H">
            <NumericalInput
              h="toolbar"
              value={settings.axes.yaxis.length}
              placeholder="Row Height"
              limit={[1, 1000]}
              dp={0}
              onNumChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.axes.yaxis.length = v
                  })
                )
              }}
            />
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
