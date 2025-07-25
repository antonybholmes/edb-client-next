import { SwitchPropRow } from '@dialog/switch-prop-row'
import { useEdbSettings } from '@lib/edb/edb-settings'
import { produce } from 'immer'

export function ModulesToolbarPanel() {
  const { settings, updateSettings } = useEdbSettings()

  return (
    <>
      <SwitchPropRow
        title="Open each module in a new tab"
        checked={settings.modules.links.openInNewWindow}
        onCheckedChange={v => {
          const newSettings = produce(settings, draft => {
            draft.modules.links.openInNewWindow = v
          })

          updateSettings(newSettings)
        }}
      />
    </>
  )
}
