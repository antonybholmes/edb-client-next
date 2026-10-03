import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { TEXT_FILE, TEXT_SAVE } from '@/consts'

import { useSaveTxt } from '../../../matcalc/hooks/save'
import { useTextSave } from '../text-provider'

export function HomeToolbar() {
  const { saveAs } = useSaveTxt()
  const { text } = useTextSave()

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarIconButton title={TEXT_SAVE} onClick={() => saveAs(text)}>
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>
    </>
  )
}
