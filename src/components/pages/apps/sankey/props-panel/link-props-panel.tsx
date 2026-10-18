import { type IClusterGroup } from '@/lib/cluster-group'

import { SIMPLE_COLOR_EXT_CLS } from '@/components/plot/color-picker-popover'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { PropsPanel } from '@/components/props-panel'
import { SortableItem } from '@/components/sortable-item'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { DragDropProvider } from '@dnd-kit/react'
import { MoveRight } from 'lucide-react'
import { IOutputLink } from '../sankey-layout'
import { useSankey } from '../sankey-provider'
import { useSankeySettings } from '../sankey-settings-store'

function LinkItem({ link, index }: { link: IOutputLink; index: number }) {
  const { updateLink } = useSankey()
  const { settings } = useSankeySettings()

  const linkId = `${link.source.id}-${link.target.id}`

  return (
    <SortableItem id={linkId} index={index} key={linkId}>
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
      <div className="overflow-hidden grid grid-cols-5 grow">
        <span className="col-span-2 text-right">{link.source.label}</span>
        <span className="flex justify-center">
          <MoveRight size={16} />
        </span>
        <span className="col-span-2 text-left">{link.target.label}</span>
      </div>
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

  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // )

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
      <DragDropProvider
        //sensors={sensors}
        //modifiers={[restrictToVerticalAxis]}
        // onDragStart={event => setActiveId(event.active.id as string)}
        onDragEnd={(event) => {
          //const { active, over } = event
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
        <VScrollPanel className="grow">
          <ul className="flex flex-col">
            {links.map((link, li) => {
              const linkId = `${link.source.id}-${link.target.id}`
              return <LinkItem link={link} index={li} key={linkId} />
            })}
          </ul>
        </VScrollPanel>

        {/* <DragOverlay>
              {activeId ? (
                <GroupItem
                  group={groups.find(group => group.id === activeId)!.group}
                  active={activeId}
                />
              ) : null}
            </DragOverlay> */}
      </DragDropProvider>
    </PropsPanel>
  )
}
