import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { TEXT_FILE, TEXT_PASTE, TEXT_SAVE } from '@/consts'

import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarColSmallButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { produce } from 'immer'
import { Clipboard } from 'lucide-react'
import { useSaveTxt } from '../../../matcalc/hooks/save'
import { useTextSave } from '../text-provider'
import { useTextSettings } from '../text-settings'
import { FontToolbarGroup } from './font-toolbar-group'

export function HomeToolbar() {
  const { saveAs } = useSaveTxt()
  const { text, setText } = useTextSave()
  const { settings, updateSettings } = useTextSettings()

  return (
    <>
      <ToolbarTabGroup title={TEXT_FILE}>
        <ToolbarOpenFile
          onClick={() => {
            openFilesDialog({
              onFileChange: (files) => {
                onTextFileChange(files, ({ success, files }) => {
                  if (!success) {
                    return
                  }

                  setText(files[0].text)
                })
              },
            })
          }}
        />

        <ToolbarIconButton title={TEXT_SAVE} onClick={() => saveAs(text)}>
          <DownloadIcon />
        </ToolbarIconButton>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Clipboard">
        <ToolbarColSmallButton
          icon={<Clipboard size={18} />}
          title={TEXT_PASTE}
          onClick={() => {
            navigator.clipboard.readText().then((clipText) => {
              setText(clipText)
            })
          }}
        >
          <Clipboard size={24} />
          {TEXT_PASTE}
        </ToolbarColSmallButton>
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
