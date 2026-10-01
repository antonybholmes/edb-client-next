import { IClusterGroupRow, type IClusterGroup } from '@/lib/cluster-group'

import { DragDropProvider } from '@dnd-kit/react'

import {
  DRAG_HANDLE_APPEAR_CLS,
  DRAG_ICON_ANIM_CLS,
  SortableItem,
} from '../../../../sortable-item'

import { useDialogs } from '@/components/dialogs/dialogs'
import { BaseCol } from '@/components/layout/base-col'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { PropsPanel } from '@/components/props-panel'
import { SmallCheckbox } from '@/components/shadcn/ui/themed/v2/small-check-box'
import { TruncateSpan } from '@/components/truncate-span'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { StretchRow } from '@/layout/stretch-row'
import { cn } from '@/lib/shadcn-utils'
import { move } from '@dnd-kit/helpers'
import { produce } from 'immer'
import { Eye, Settings2 } from 'lucide-react'
import { IGroup, useNetwork } from '../network-store'
import { useUserData } from '../network-user-data-store'
import { GroupDialog } from './group-dialog'

export function GroupItem({ index, group }: { index: number; group: IGroup }) {
  const { setGroups, groups } = useNetwork()
  const { settings: userData, updateSettings: updateUserData } = useUserData()
  const { openCustom: openCustomDialog } = useDialogs()

  return (
    <SortableItem
      id={group.id}
      index={index}
      key={group.id}

      type="group"
      accept="group"
      className="group h-10"
    >
      <SmallCheckbox
        checked={group.show}
        onCheckedChange={(checked) => {
          setGroups(
            produce(groups, (draft) => {
              const g = draft.find((x) => x.id === group.id)
              if (g) {
                g.show = checked
              }
            })
          )
        }}
        style={{ color: group.color }}
        title={group.show ? 'Hide group' : 'Show group'}
        icon={<Eye size={16} strokeWidth={1.5} />}
      />

      <TruncateSpan className="grow h-6 text-xs" style={{ color: group.color }}>
        {group.name}
      </TruncateSpan>

      <FillButton
        colors={[
          {
            color: group.color,
            allowAlpha: false,
            allowNoColor: false,
            onColorChange: ({ color }) => {
              setGroups(
                produce(groups, (draft) => {
                  const g = draft.find((x) => x.id === group.id)
                  if (g) {
                    g.color = color
                  }
                })
              )

              // save colors user likes for groups so it will
              // default to this color next time the group is created
              updateUserData(
                produce(userData, (draft) => {
                  draft.groups.colors = {
                    ...draft.groups.colors,
                    [group.name.toLowerCase()]: color,
                  }
                })
              )
            },
          },
        ]}

        title="Set Group Color"
      />

      <BaseCol
        className={cn(DRAG_HANDLE_APPEAR_CLS, 'gap-x-1 items-center shrink-0')}
      >
        <button
          title="Edit group"
          //className="text-foreground/50 focus-visible:text-foreground hover:text-foreground trans-color"
          onClick={() => openCustomDialog(GroupDialog, { group })}
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
  const { groups, setGroups } = useNetwork()

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
    <>
      <PropsPanel className="gap-y-1">
        <StretchRow className="gap-x-1 justify-between"></StretchRow>

        <VScrollPanel className="grow">
          <DragDropProvider
            onDragEnd={(event) => {
              const newOrder = move(groups, event)

              setGroups(newOrder)
            }}
          >
            <ul className="flex flex-col gap-y-1">
              {groups.map((gr, gri) => {
                return <GroupItem index={gri} group={gr} key={gr.id} />
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
        </VScrollPanel>
      </PropsPanel>
    </>
  )
}
