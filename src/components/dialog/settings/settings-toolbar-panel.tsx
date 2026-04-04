import { SwitchPropRow } from '@/dialog/switch-prop-row'
import {
  TOOLBAR_STYLE_MAP,
  useEdbSettings,
  type ToolbarStyle,
} from '@/lib/edb/edb-settings'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/themed/v2/select'
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
          <SelectTrigger>
            <SelectValue data-placeholder="Choose ribbon style">
              {(value: ToolbarStyle) => <span>{TOOLBAR_STYLE_MAP[value]}</span>}
            </SelectValue>
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
