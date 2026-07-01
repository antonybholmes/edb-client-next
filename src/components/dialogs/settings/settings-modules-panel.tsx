import { useEdbSettings } from '@/components/edb/edb-settings'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { produce } from 'immer'

export function AppsToolbarPanel() {
  const { settings, updateSettings } = useEdbSettings()

  return (
    <>
      <SwitchPropRow
        title="Open each app in a new tab"
        checked={settings.apps.links.openInNewWindow}
        onCheckedChange={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.apps.links.openInNewWindow = v
            })
          )
        }}
      />
      <SwitchPropRow
        title="Use accent colors for apps"
        checked={settings.apps.useAccentColors}
        onCheckedChange={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.apps.useAccentColors = v
            })
          )
        }}
      />
    </>
  )
}
