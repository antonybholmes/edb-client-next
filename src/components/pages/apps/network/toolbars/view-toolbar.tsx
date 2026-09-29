import { ToolbarTabGroup } from '@/components/toolbar/toolbar-tab-group'

import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarButton } from '@/components/toolbar/toolbar-button'
import { ToolbarCol } from '@/components/toolbar/toolbar-col'
import { ToolbarColButton } from '@/components/toolbar/toolbar-col-button'
import { ToolbarRow } from '@/components/toolbar/toolbar-row'
import { ZoomSelectList } from '@/components/toolbar/zoom-select-list'
import { useZoom } from '@/providers/zoom-provider'
import { produce } from 'immer'
import { Fullscreen, Tags } from 'lucide-react'
import { useNetworkSettings, ViewMode } from '../network-settings-store'
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

export function ViewToolbar() {
  const { settings, updateSettings } = useNetworkSettings()
  const { setZoom } = useZoom()
  return (
    <>
      <ToolbarTabGroup title="Zoom" className="gap-x-2">
        <ToolbarCol>
          <ToolbarRow>
            <span>Zoom</span>
            <ZoomSelectList />
          </ToolbarRow>
          <ToolbarRow>
            <ToolbarButton onClick={() => setZoom(1)} title="Zoom to 100%">
              <Fullscreen size={16} />
              <span>100%</span>
            </ToolbarButton>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Nodes" className="gap-x-2">
        <ToolbarColButton
          className="text-xs font-normal"
          checked={settings.plot.nodes.labels.showAll}
          onClick={() =>
            updateSettings(
              produce(settings, (draft) => {
                draft.plot.nodes.labels.showAll =
                  !settings.plot.nodes.labels.showAll
              })
            )
          }
        >
          <Tags className="group-data-[ribbon=single]:hidden" size={18} />

          <span className="text-wrap">All Labels</span>
        </ToolbarColButton>

        <ToolbarCol>
          <ToolbarRow>
            <span>Field</span>
            <FieldSelectList />
          </ToolbarRow>
        </ToolbarCol>

        <ToolbarCol>
          <ToolbarRow>
            <span>View</span>
            <SelectList
              items={NODE_VIEW_MODES}
              value={settings.plot.nodes.view.mode}
              onValueChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.view.mode = value as ViewMode
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
      </ToolbarTabGroup>
      <ToolbarTabGroup title="Edges">
        <ToolbarCol>
          <ToolbarRow>
            <span title="Edge View">View</span>
            <SelectList
              items={NODE_VIEW_MODES}
              value={settings.plot.edges.mode}
              onValueChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.edges.mode = value as ViewMode
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
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
