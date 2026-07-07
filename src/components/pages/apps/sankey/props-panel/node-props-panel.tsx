import { type IClusterGroup } from '@/lib/cluster-group'

import { VCenterCol } from '@/layout/v-center-col'
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

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { PropsPanel } from '@/components/props-panel'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import { SortableItem } from '@/components/sortable-item'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { IOutputNode } from '../sankey-layout'
import { useSankey } from '../sankey-provider'

export const GROUP_CLS = `group rounded-theme group gap-x-1 opacity-80 py-1 px-2
hover:opacity-100 trans-opacity hover:bg-muted/60 data-[focus=true]:bg-muted/60`

export const GROUP_CONTENT_CLS = `flex flex-row items-center grow relative 
  w-full overflow-hidden py-2 pl-1 pr-2 gap-x-2 rounded-theme 
  group-hover:bg-muted group-data-[focus=true]:bg-muted`

function NodeItem({ node }: { node: IOutputNode }) {
  const { updateNode } = useSankey()

  return (
    <SortableItem id={node.id} key={node.id}>
      <ColorPickerButton
        colors={[
          {
            color: node.color,
            onColorChange: ({ color }) => updateNode({ ...node, color }),
          },
        ]}

        className={SIMPLE_COLOR_EXT_CLS}
        title="Set color"
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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const nodes = Array.from(graph?.nodes.values() || []).sort((a, b) =>
    a.label.localeCompare(b.label)
  )

  return (
    <PropsPanel className="mt-8 gap-y-1">
      {/* <PropRow title="Shape">
          <SelectList
            items={[
              { value: 'rect', label: 'Rectangle' },
              { value: 'circle', label: 'Circle' },
            ]}
            value={settings.nodes.shape}
            onValueChange={(value) => {
              const shape = value as 'rect' | 'circle'
              updateSettings(
                produce(settings, (draft) => {
                  draft.nodes.shape = shape
                })
              )
            }}
            w="sm"
          >
            <SelectItem value="rect">Rectangle</SelectItem>
            <SelectItem value="circle">Circle</SelectItem>
          </SelectList>
        </PropRow>
        <NumericalPropRow
          title="Width"
          limit={[1, 1000]}
          value={settings.nodes.width}
          onNumChange={(value) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.nodes.width = value
              })
            )
          }}
        />

        <PropRow title="Rounding">
          <BarSlider
            value={settings.nodes.rounding}
            min={0}
            max={100}
            format={(v) => v.toString()}
            onValueChange={(value: number | readonly number[]) => {
              const newValue = Array.isArray(value) ? value[0]! : value
              updateSettings(
                produce(settings, (draft) => {
                  draft.nodes.rounding = newValue
                })
              )
            }}
            step={1}
            //className="w-20"
          />
        </PropRow>
        <PropRow title="Oversize">
          <BarSlider
            value={settings.nodes.oversize}
            min={0}
            max={100}
            format={(v) => v.toString()}
            onValueChange={(value: number | readonly number[]) => {
              const newValue = Array.isArray(value) ? value[0]! : value
              updateSettings(
                produce(settings, (draft) => {
                  draft.nodes.oversize = newValue
                })
              )
            }}
            step={1}
          />
        </PropRow>
        <NumericalPropRow
          title="Gap"
          limit={[0, 1000]}
          value={settings.nodes.gap}
          onNumChange={(value) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.nodes.gap = value
              })
            )
          }}
        />

        <PropRow title="Opacity">
          <BarSlider
            value={settings.nodes.opacity}
            min={0}
            max={1}

            onValueChange={(value: number | readonly number[]) => {
              const newValue = Array.isArray(value) ? value[0]! : value
              updateSettings(
                produce(settings, (draft) => {
                  draft.nodes.opacity = newValue
                })
              )
            }}
            step={0.05}
          />
        </PropRow>
        <PropRow title="Labels">
          <FontPopover
            fonts={[
              {
                textProps: settings.nodes.labels.font,
                showRotation: true,
                update: (f) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.nodes.labels.font = f
                    })
                  ),
              },
            ]}
          />
          <SelectList
            items={[
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
              { value: 'center', label: 'Center' },
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' },
            ]}
            value={settings.nodes.labels.position}
            onValueChange={(value) => {
              const position = value as
                'left' | 'right' | 'center' | 'top' | 'bottom'
              updateSettings(
                produce(settings, (draft) => {
                  draft.nodes.labels.position = position
                })
              )
            }}
            w="xs"
          >
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="right">Right</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="top">Top</SelectItem>
            <SelectItem value="bottom">Bottom</SelectItem>
          </SelectList>
        </PropRow>

        <LineSeparator /> */}

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
          items={nodes.map((node) => node.id)}
          strategy={verticalListSortingStrategy}
        >
          <VScrollPanel className="grow">
            <ul className="flex flex-col">
              {nodes.map((node) => {
                return <NodeItem node={node} key={node.id} />
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
