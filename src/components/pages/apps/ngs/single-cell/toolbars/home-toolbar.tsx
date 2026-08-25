import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { TEXT_SAVE_IMAGE } from '@/consts'

import { useSVG } from '@/providers/svg-provider'

export function HomeToolbar() {
  const { saveAs } = useSVG()

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            saveAs('umap')
          }}
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>
    </>
  )
}
