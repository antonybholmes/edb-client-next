import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { TEXT_SAVE_IMAGE } from '@/consts'

import { useDialogs } from '@/components/dialogs/dialogs'
import { useSVG } from '@/providers/svg-provider'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { svgRef } = useSVG()

  return (
    <>
      <ToolbarTabGroup title="File">
        <ToolbarIconButton
          title={TEXT_SAVE_IMAGE}
          onClick={() => {
            openDialog({
              type: 'save-image',
              payload: {
                name: 'umap',
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
