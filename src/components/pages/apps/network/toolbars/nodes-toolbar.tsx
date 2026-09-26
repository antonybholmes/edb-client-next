import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
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
            <ToolbarButton
              checked={settings.plot.nodes.view.hidden.show}
              onClick={() => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.view.hidden.show =
                      !settings.plot.nodes.view.hidden.show
                  })
                )
              }}
            >
              Show Hidden
            </ToolbarButton>
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
