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
import { NodeViewMode, useNetworkSettings } from '../network-settings-store'
import { FieldSelectList } from '../props/field-select-list'

const NODE_VIEW_MODES = [
  {
    value: 'normal',
    label: 'Normal',
  },
  {
    value: 'translucent',
    label: 'Translucent',
  },
  {
    value: 'hidden',
    label: 'Hidden',
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
            <ToolbarButton onClick={() => setZoom(1)} title="Zoom To 100%">
              <Fullscreen size={16} />
              <span>100%</span>
            </ToolbarButton>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>

      <ToolbarTabGroup title="Nodes" className="gap-x-2">
        <ToolbarColButton
          title="Toggle Whether All Node Labels Are Shown"
          className="text-xs font-normal"
          checked={settings.plot.nodes.labels.showAll}
          onClick={() => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plot.nodes.labels.showAll =
                  !settings.plot.nodes.labels.showAll
              })
            )
          }}
        >
          <Tags className="group-data-[ribbon=single]:hidden" size={18} />

          <span className="text-wrap">All Labels</span>
        </ToolbarColButton>

        <ToolbarCol>
          <ToolbarRow>
            <FieldSelectList />
          </ToolbarRow>
        </ToolbarCol>

        <ToolbarCol>
          <ToolbarRow>
            <SelectList
              items={NODE_VIEW_MODES}
              value={settings.plot.nodes.view.mode}
              onValueChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.view.mode = value as NodeViewMode
                  })
                )
              }}
              w="sm"
              variant="toolbar"
              title="Default Node View"
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
              checked={settings.plot.nodes.view.labelled.on}
              onClick={() => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.view.labelled.on =
                      !settings.plot.nodes.view.labelled.on
                  })
                )
              }}
              title="Highlight Labelled Nodes"
            >
              Labelled
            </ToolbarButton>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>
      <ToolbarTabGroup title="Edges">
        <ToolbarCol>
          <ToolbarRow>
            <SelectList
              items={NODE_VIEW_MODES}
              value={settings.plot.edges.mode}
              onValueChange={(value) => {
                console.log('New edge view mode value:', value)
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.edges.mode = value as NodeViewMode
                  })
                )
              }}
              w="sm"
              variant="toolbar"
              title="Default Edge View"
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
              checked={settings.plot.edges.labelled.on}
              onClick={() => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.edges.labelled.on =
                      !settings.plot.edges.labelled.on
                  })
                )
              }}
              title="Highlight Edges Connected to Labelled Nodes"
            >
              Labelled
            </ToolbarButton>
          </ToolbarRow>
        </ToolbarCol>
      </ToolbarTabGroup>
    </>
  )
}
