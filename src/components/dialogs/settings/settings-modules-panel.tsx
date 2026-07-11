import { useEdbSettings } from '@/components/edb/edb-settings'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { produce } from 'immer'

export function AppsToolbarPanel() {
  const { settings, updateSettings } = useEdbSettings()

  return (
    <>
      <SwitchPropRow
        title="Open each app in a new tab"
        info="When enabled, each app will open in a new browser tab instead of the current tab."
        checked={settings.apps.links.openInNewWindow}
        onCheckedChange={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.apps.links.openInNewWindow = v
            })
          )
        }}
      />
      <LineSeparator />
      <SwitchPropRow
        title="Use accent colors for apps"
        info="When enabled, apps will use accent colors for their UI elements to have a unique look."
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
