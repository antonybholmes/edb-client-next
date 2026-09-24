import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { PropsPanel } from '@/components/props-panel'
import { produce } from 'immer'
import { useNetworkSettings } from '../network-settings-store'

import { Textarea } from '@/components/shadcn/ui/themed/textarea'
import { useDebounce } from '@/hooks/debounce'
import { useEffect, useState } from 'react'

export function NodesDisplayPropsPanel() {
  const { settings, updateSettings } = useNetworkSettings()

  const [text, setText] = useState('')

  useEffect(() => {
    setText(settings.labels.join('\n'))
  }, [settings.labels])

  const debounceText = useDebounce(text)

  useEffect(() => {
    updateSettings(
      produce(settings, (draft) => {
        draft.labels = debounceText
          .split('\n')
          .map((x) => x.trim())
          .filter((x) => x.length > 0)
      })
    )
  }, [debounceText])

  return (
    <PropsPanel>
      <CheckPropRow
        title="All Labels"
        className="ml-0.5 mt-1"
        checked={settings.plot.nodes.labels.showAll}
        onCheckedChange={(v) =>
          updateSettings(
            produce(settings, (draft) => {
              draft.plot.nodes.labels.showAll = v
            })
          )
        }
      />

      <Textarea
        title="Node Label"
        value={text}
        onTextChange={(value) => {
          setText(value)
        }}
      />
    </PropsPanel>
  )
}
