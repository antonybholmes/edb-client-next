import {
  TOOLBAR_STYLE_MAP,
  useEdbSettings,
  type ToolbarStyle,
} from '@/components/edb/edb-settings'
import { capitalCase } from '@/lib/text/capital-case'
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
      <PropRow title="Group Labels">
        <Select
          value={settings.toolbars.groups.labels.mode}
          onValueChange={(v) => {
            const newSettings = produce(settings, (draft) => {
              draft.toolbars.groups.labels.mode = v as 'auto' | 'show' | 'hide'
            })

            updateSettings(newSettings)
          }}
        >
          <SelectTrigger>
            <SelectValue data-placeholder="Choose group labels mode">
              {(value) => <span>{capitalCase(value)}</span>}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="auto">Auto</SelectItem>
            <SelectItem value="show">Show</SelectItem>
            <SelectItem value="hide">Hide</SelectItem>
          </SelectContent>
        </Select>
      </PropRow>

      <PropRow title="Ribbon style">
        <Select
          value={settings.toolbars.ribbon.style}
          onValueChange={(v) => {
            const newSettings = produce(settings, (draft) => {
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
