import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/themed/select'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { useEdbSettings, type ToolbarStyle } from '@lib/edb/edb-settings'
import { produce } from 'immer'
import { PropRow } from '../prop-row'

export function SettingsToolbarPanel() {
  const { settings, updateSettings } = useEdbSettings()

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

      <PropRow title="Ribbon style">
        <Select
          value={settings.toolbars.ribbon.style}
          onValueChange={v => {
            const newSettings = produce(settings, draft => {
              draft.toolbars.ribbon.style = v as ToolbarStyle
            })

            updateSettings(newSettings)
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Choose ribbon style" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="classic">Classic</SelectItem>
            <SelectItem value="single">Single Line</SelectItem>
          </SelectContent>
        </Select>
      </PropRow>
    </>
  )
}
