import { IClusterGroupRow, type IClusterGroup } from '@/lib/cluster-group'

import { DragDropProvider } from '@dnd-kit/react'

import { useDialogs } from '@/components/dialogs/dialogs'
import { BaseCol } from '@/components/layout/base-col'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { PropsPanel } from '@/components/props-panel'
import { Checkbox } from '@/components/shadcn/ui/themed/baseui/check-box'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { cn } from '@/lib/shadcn-utils'
import { move } from '@dnd-kit/helpers'
import { produce } from 'immer'
import { Settings2 } from 'lucide-react'

import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { useHistory } from '@/components/pages/apps/matcalc/history/history-provider/history-provider'
import { FontPopover } from '@/components/plot/font/font-popover'
import { StrokeButton } from '@/components/plot/stroke-dropdown-menu'
import { LineSeparator } from '@/components/shadcn/ui/themed/baseui/dropdown-menu'
import {
  DRAG_HANDLE_APPEAR_CLS,
  DRAG_ICON_ANIM_CLS,
  SortableItem,
} from '@/components/sortable-item'
import { TEXT_SHOW } from '@/consts'
import { IGseaTableResultGroup } from '../../gsea-store'
import { GroupDialog } from '../group-dialog'
import { IGseaBubblePlot, useGseaBubbleContext } from '../gsea-bubble-provider'
import { useGseaBubbleSettings } from '../gsea-bubble-settings'
import { useGseaBubbleUserSettings } from '../gsea-bubble-user-settings'

export function GroupItem({
  index,
  plot,
  group,
}: {
  index: number
  plot: IGseaBubblePlot
  group: IGseaTableResultGroup
}) {
  const { setGroups } = useGseaBubbleUserSettings()
  const { openCustom: openCustomDialog } = useDialogs()
  const { updatePlot } = useHistory()

  return (
    <SortableItem
      id={group.id}
      index={index}
      key={group.id}

      type="group"
      accept="group"
      className="group h-10"
    >
      <Checkbox
        checked={group.show}
        onCheckedChange={(checked) => {
          updatePlot(
            produce(plot, (draft) => {
              const g = draft.groups.find((x) => x.id === group.id)
              if (g) {
                g.show = checked
              }
            })
          )
        }}
        style={{ color: group.color }}
        title={group.show ? 'Hide group' : 'Show group'}
        //icon={<Eye size={16} strokeWidth={1.5} />}
      />
      <FillButton
        colors={[
          {
            color: group.color,
            allowAlpha: false,
            allowNoColor: false,
            onColorChange: ({ color }) => {
              updatePlot(
                produce(plot, (draft) => {
                  const g = draft.groups.find((x) => x.id === group.id)
                  if (g) {
                    g.color = color
                  }
                })
              )

              // save colors user likes for groups so it will
              // default to this color next time the group is created
              setGroups([{ ...group, color }])
            },
          },
        ]}

        title="Set Group Color"
      />
      <TruncateSpan className="grow h-6 text-xs" style={{ color: group.color }}>
        {group.name}
      </TruncateSpan>

      <BaseCol
        className={cn(DRAG_HANDLE_APPEAR_CLS, 'gap-x-1 items-center shrink-0')}
      >
        <button
          title="Edit group"
          //className="text-foreground/50 focus-visible:text-foreground hover:text-foreground trans-color"
          onClick={() => openCustomDialog(GroupDialog, { plot, group })}
        >
          {/* <SettingsIcon style={{ stroke: group.color }} /> */}
          <Settings2
            className={cn('w-4', DRAG_ICON_ANIM_CLS)}
            style={{ color: group.color }}
          />
        </button>
      </BaseCol>
    </SortableItem>
  )
}

export interface IGroupCallback {
  title?: string
  groupRow: IClusterGroupRow
  group: IClusterGroup
  callback?: (groupRow: IClusterGroupRow, group: IClusterGroup) => void
}

export function GroupPropsPanel() {
  const { plots } = useGseaBubbleContext()
  const { updatePlot } = useHistory()
  const { settings, updateSettings } = useGseaBubbleSettings()

  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // )

  // cache the group items so that when dragging, they are
  // not re-rendered so that on drag effects work
  // const items = useMemo(() => {
  //   return groupState.groups.map((group, gi) => (
  //     <GroupItem group={group} key={gi} />
  //   ))
  // }, [groupState.groups])

  return (
    <PropsPanel className="gap-y-1">
      <CheckPropRow
        title={TEXT_SHOW}
        checked={settings.groups.show}
        onCheckedChange={(state) =>
          updateSettings(
            produce(settings, (draft) => {
              draft.groups.show = state
            })
          )
        }
      ></CheckPropRow>
      <CheckPropRow
        title="Labels"

        checked={settings.groups.font.show}
        onCheckedChange={(state) =>
          updateSettings(
            produce(settings, (draft) => {
              draft.groups.font.show = state
            })
          )
        }
      >
        <FontPopover
          fonts={[
            {
              title: 'Labels',
              textProps: settings.groups.font,
              showRotation: true,
              update: (textProps) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.groups.font = Object.assign(
                      { ...draft.groups.font },
                      textProps
                    )
                  })
                ),
              ext: (
                <CheckPropRow
                  title="Auto-color"

                  checked={settings.groups.colored}
                  onCheckedChange={(state) =>
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.groups.colored = state
                      })
                    )
                  }
                />
              ),
            },
          ]}
        />
      </CheckPropRow>
      <CheckPropRow
        title="Separate Borders"
        checked={settings.groups.border.separate.on}
        onCheckedChange={(state) =>
          updateSettings(
            produce(settings, (draft) => {
              draft.groups.border.separate.on = state
            })
          )
        }
      >
        <StrokeButton
          colors={[
            {
              color: settings.groups.border.value,
              show: settings.groups.border.show,
              width: settings.groups.border.width,
              dasharray: settings.groups.border.dasharray,
              onColorChange: ({ color, width, show, dasharray }) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.groups.border.value = color
                    draft.groups.border.show = show
                    draft.groups.border.width = width
                    draft.groups.border.dasharray = dasharray
                  })
                ),
            },
          ]}
        />
      </CheckPropRow>
      {/* <CheckPropRow
        title="Auto-color"

        checked={settings.groups.colored}
        onCheckedChange={(state) =>
          updateSettings(
            produce(settings, (draft) => {
              draft.groups.colored = state
            })
          )
        }
      /> */}
      <LineSeparator />
      <VScrollPanel className="grow">
        {plots.map((plot) => (
          <DragDropProvider
            key={plot.id}
            onDragEnd={(event) => {
              const newOrder = move(plot.groups, event)

              const newPlot = { ...plot, groups: newOrder }

              updatePlot(newPlot)
            }}
          >
            <ul className="flex flex-col gap-y-1">
              {plot.groups.map((gr, gri) => {
                return (
                  <GroupItem index={gri} plot={plot} group={gr} key={gr.id} />
                )
              })}
            </ul>

            {/* <DragOverlay>
              {activeId ? (
                <GroupItem
                  group={groups.find(group => group.id === activeId)!.group}
                  active={activeId}
                />
              ) : null}
            </DragOverlay> */}
          </DragDropProvider>
        ))}
      </VScrollPanel>
    </PropsPanel>
  )
}
