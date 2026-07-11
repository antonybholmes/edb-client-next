import {
  TOOLBAR_STYLE_MAP,
  useEdbSettings,
  type ToolbarStyle,
} from '@/components/edb/edb-settings'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
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
      <PropRow
        title="Group Labels"
        info="Choose whether to show a label below toolbar groups."
      >
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

      <LineSeparator />

      <PropRow
        title="Ribbon style"
        info="Choose the style of the ribbon toolbar. Classic style shows all tools in a multi-row layout, while Single Line style shows tools in a single row with overflow menu."
      >
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
