import { DownloadIcon } from '@/components/icons/download-icon'
import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { TEXT_FILE, TEXT_SAVE_IMAGE } from '@/consts'

import { useDialogs } from '@/components/dialogs/dialogs'
import { useSVG } from '@/providers/svg-provider'
import { useOpen } from '../use-open'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { openFiles } = useOpen()
  const { svgRef } = useSVG()

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (message, files) =>
                onTextFileChange(message, files, openFiles),
            })
          }}
        />

        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            openDialog({
              type: 'save-image',
              payload: {
                name: 'venn',
                svgRef,
              },
            })
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>
    </>
  )
}
