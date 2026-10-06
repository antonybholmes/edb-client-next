import { DownloadIcon } from '@/components/icons/download-icon'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { TEXT_FILE, TEXT_PASTE, TEXT_SAVE } from '@/consts'

import {
  onTextFileChange,
  openFilesDialog,
} from '@/components/pages/open-files'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarColSmallButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarOpenFile } from '@/components/toolbar/toolbar-open-files'
import { produce } from 'immer'
import { Clipboard, Copy, Scissors } from 'lucide-react'
import { useSaveTxt } from '../../../matcalc/hooks/save'
import { useText } from '../text-provider'
import { useTextSettings } from '../text-settings'
import { FontToolbarGroup } from './font-toolbar-group'

export function HomeToolbar() {
  const { saveAs } = useSaveTxt()

  const { settings, updateSettings } = useTextSettings()

  const { text, setText, ref } = useText()

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
          <Clipboard size={24} strokeWidth={1} />
          {TEXT_PASTE}
        </ToolbarColSmallButton>
        <ToolbarCol>
          <ToolbarIconButton
            title="Cut"
            onClick={async () => {
              const textarea = ref.current
              if (!textarea) {
                return
              }

              const start = textarea.selectionStart
              const end = textarea.selectionEnd

              if (start === end) {
                return
              }

              const originalValue = textarea.value
              const textToCut = originalValue.slice(start, end)

              try {
                await navigator.clipboard.writeText(textToCut)
              } catch (err) {
                console.error('Failed to copy text: ', err)
              }

              const nextValue =
                originalValue.slice(0, start) + originalValue.slice(end)

              setText(nextValue)

              requestAnimationFrame(() => {
                textarea.focus()
                textarea.setSelectionRange(start, start)
              })
            }}
          >
            <Scissors size={16} className="-rotate-90" />
          </ToolbarIconButton>

          <ToolbarIconButton
            title="Copy"
            onClick={async () => {
              const textarea = ref.current
              if (!textarea) {
                return
              }

              const start = textarea.selectionStart
              const end = textarea.selectionEnd

              if (start === end) {
                return
              }

              const originalValue = textarea.value
              const textToCopy = originalValue.slice(start, end)

              try {
                await navigator.clipboard.writeText(textToCopy)
              } catch (err) {
                console.error('Failed to copy text: ', err)
              }

              requestAnimationFrame(() => {
                textarea.focus()
                textarea.setSelectionRange(start, start)
              })
            }}
          >
            <Copy size={16} />
          </ToolbarIconButton>
        </ToolbarCol>
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
