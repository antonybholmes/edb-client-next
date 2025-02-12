import { SwitchPropRow } from '@/components/switch-prop-row'
import { EdbSettingsContext } from '@/lib/edb/edb-settings-provider'
import { produce } from 'immer'
import { useContext } from 'react'

export function SettingsToolbarPanel() {
  const { settings, updateSettings } = useContext(EdbSettingsContext)

  return (
    <>
      <SwitchPropRow
        title="Show group labels"
        checked={settings.toolbars.groups.labels.show}
        onCheckedChange={v => {
          const newSettings = produce(settings, draft => {
            draft.toolbars.groups.labels.show = v
          })

          updateSettings(newSettings)
        }}
      />
    </>
  )
}
