import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { produce } from 'immer'
import { useNetworkSettings } from '../network-settings-store'
import { FieldSelectList } from '../props/field-select-list'

const NODE_VIEW_MODES = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: 'labelled',
    label: 'Labelled',
  },
]

export function NodesToolbar() {
  const { settings, updateSettings } = useNetworkSettings()

  return (
    <>
      <ToolbarTabGroup title="Nodes" className="gap-x-2">
        <ToolbarCol>
          <ToolbarRow>
            <span>View</span>
            <SelectList
              items={NODE_VIEW_MODES}
              value={settings.plot.nodes.view.mode}
              onValueChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.view.mode = value as 'all' | 'labelled'
                  })
                )
              }}
              w="xs"
              variant="toolbar"
            >
              {NODE_VIEW_MODES.map((position) => (
                <SelectItem key={position.value} value={position.value}>
                  {position.label}
                </SelectItem>
              ))}
            </SelectList>
          </ToolbarRow>
          <ToolbarRow>
            <Checkbox
              checked={settings.plot.nodes.view.hidden.show}
              onCheckedChange={(checked) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.view.hidden.show = checked
                  })
                )
              }}
            >
              Show Hidden
            </Checkbox>
          </ToolbarRow>
        </ToolbarCol>
        <ToolbarCol>
          <ToolbarRow>
            <span>Field</span>
            <FieldSelectList />
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
