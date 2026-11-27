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
    </>
  )
}
