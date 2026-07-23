import { type IClusterGroup } from '@/lib/cluster-group'

import { VCenterCol } from '@/layout/v-center-col'

import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { PropsPanel } from '@/components/props-panel'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import { SortableItem } from '@/components/sortable-item'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { DragDropProvider } from '@dnd-kit/react'
import { IOutputNode } from '../sankey-layout'
import { useSankey } from '../sankey-provider'
import { DEFAULT_NODE_COLOR } from '../sankey-settings-store'

function NodeItem({ node, index }: { node: IOutputNode; index: number }) {
  const { updateNode } = useSankey()

  return (
    <SortableItem id={node.id} index={index} key={node.id}>
      <FillButton
        colors={[
          {
            color: node.fill?.value ?? DEFAULT_NODE_COLOR,
            allowNoColor: false,
            onColorChange: ({ color }) =>
              updateNode({ ...node, fill: { ...node.fill, value: color } }),
          },
        ]}

        title="Node Fill"
      />
      <VCenterCol className="overflow-hidden grow gap-y-1">
        <Input
          value={node.label}
          onTextChange={(v) => updateNode({ ...node, label: v })}
        />
      </VCenterCol>
    </SortableItem>
  )
}

export interface IGroupCallback {
  title?: string
  group: IClusterGroup
  callback?: (group: IClusterGroup) => void
}

export function NodePropsPanel() {
  const { graph } = useSankey()

  // const sensors = useSensors(
  //   useSensor(PointerSensor),
  //   useSensor(KeyboardSensor, {
  //     coordinateGetter: sortableKeyboardCoordinates,
  //   })
  // )

  const nodes = Array.from(graph?.nodes.values() || []).sort((a, b) =>
    a.label.localeCompare(b.label)
  )

  return (
    <PropsPanel className="mt-8 gap-y-1">
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
            {nodes.map((node, ni) => {
              return <NodeItem node={node} index={ni} key={node.id} />
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
