import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { TEXT_FILE, TEXT_SAVE } from '@/consts'

import { produce } from 'immer'
import { useSaveTxt } from '../../../matcalc/hooks/save'
import { useTextSave } from '../text-provider'
import { useTextSettings } from '../text-settings'
import { FontToolbarGroup } from './font-toolbar-group'

export function HomeToolbar() {
  const { saveAs } = useSaveTxt()
  const { text } = useTextSave()
  const { settings, updateSettings } = useTextSettings()

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarIconButton title={TEXT_SAVE} onClick={() => saveAs(text)}>
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <FontToolbarGroup
        textProps={settings.text}
        update={(textProps) => {
          updateSettings(
            produce(settings, (draft) => {
              console.log('Updating text settings with:', textProps)
              draft.text = textProps
            })
          )
        }}
      />
    </>
  )
}
