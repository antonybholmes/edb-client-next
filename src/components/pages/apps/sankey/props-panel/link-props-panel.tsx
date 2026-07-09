import { type IClusterGroup } from '@/lib/cluster-group'

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { VCenterRow } from '@/components/layout/v-center-row'
import { SIMPLE_COLOR_EXT_CLS } from '@/components/plot/color-picker-popover'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { PropsPanel } from '@/components/props-panel'
import { SortableItem } from '@/components/sortable-item'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { MoveRight } from 'lucide-react'
import { IOutputLink } from '../sankey-layout'
import { useSankey } from '../sankey-provider'
import { useSankeySettings } from '../sankey-settings-store'

export const GROUP_CLS = `group rounded-theme group gap-x-1 opacity-80 py-1 px-2
hover:opacity-100 trans-opacity hover:bg-muted/60 data-[focus=true]:bg-muted/60`

export const GROUP_CONTENT_CLS = `flex flex-row items-center grow relative 
  w-full overflow-hidden py-2 pl-1 pr-2 gap-x-2 rounded-theme 
  group-hover:bg-muted group-data-[focus=true]:bg-muted`

function LinkItem({ link }: { link: IOutputLink }) {
  const { updateLink } = useSankey()
  const { settings } = useSankeySettings()

  const linkId = `${link.source.id}-${link.target.id}`

  return (
    <SortableItem id={linkId} key={linkId}>
      <FillButton
        colors={[
          {
            color: link.fill?.value ?? settings.links.fill.value,
            opacity: link.fill?.opacity ?? settings.links.fill.opacity,
            allowNoColor: false,
            onColorChange: ({ color, opacity }) =>
              updateLink({
                ...link,
                fill: { ...link.fill, value: color, opacity },
              }),
          },
        ]}

        className={SIMPLE_COLOR_EXT_CLS}
        title="Set color"
      />
      <VCenterRow className="overflow-hidden grow gap-x-2">
        {link.source.label} <MoveRight size={16} /> {link.target.label}
      </VCenterRow>
    </SortableItem>
  )
}

export interface IGroupCallback {
  title?: string
  group: IClusterGroup
  callback?: (group: IClusterGroup) => void
}

export function LinkPropsPanel() {
  const { graph } = useSankey()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const links =
    graph?.links.sort((a, b) => {
      const c = a.source.label.localeCompare(b.source.label)

      if (c !== 0) {
        return c
      }

      return a.target.label.localeCompare(b.target.label)
    }) || []

  return (
    <PropsPanel className="gap-y-1 mt-8">
      <DndContext
        sensors={sensors}
        modifiers={[restrictToVerticalAxis]}
        // onDragStart={event => setActiveId(event.active.id as string)}
        onDragEnd={(event) => {
          const { active, over } = event

          // if (over && active.id !== over?.id) {
          //   const oldIndex = groups.findIndex(
          //     (group) => group.id === (active.id as string)
          //   )
          //   const newIndex = groups.findIndex(
          //     (group) => group.id === (over.id as string)
          //   )
          //   const newOrder = arrayMove(
          //     groups.map((group) => group.id),
          //     oldIndex,
          //     newIndex
          //   )

          //   reorderGroups(newOrder)
          // }

          //setActiveId(null)
        }}
      >
        <SortableContext
          items={links.map((link) => `${link.source.id}-${link.target.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <VScrollPanel className="grow">
            <ul className="flex flex-col">
              {links.map((link) => {
                const linkId = `${link.source.id}-${link.target.id}`
                return <LinkItem link={link} key={linkId} />
              })}
            </ul>
          </VScrollPanel>
        </SortableContext>

        {/* <DragOverlay>
              {activeId ? (
                <GroupItem
                  group={groups.find(group => group.id === activeId)!.group}
                  active={activeId}
                />
              ) : null}
            </DragOverlay> */}
      </DndContext>
    </PropsPanel>
  )
}
