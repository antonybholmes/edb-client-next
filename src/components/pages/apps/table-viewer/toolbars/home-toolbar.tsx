import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { TEXT_FILE, TEXT_SAVE_TABLE } from '@/consts'

import { useDialogs } from '@/components/dialogs/dialogs'
import { friendlyFilename } from '@/lib/path'
import { useCurrentSheets } from '../../matcalc/history/history-provider/history-contexts'

export function HomeToolbar() {
  const { open: openDialog } = useDialogs()
  const { sheet } = useCurrentSheets()

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarIconButton
          title={TEXT_SAVE_TABLE}
          onClick={() =>
            openDialog({
              type: 'save',
              payload: {
                name: friendlyFilename(sheet?.name ?? 'table'),
              },
            })
          }
        >
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>
    </>
  )
}
