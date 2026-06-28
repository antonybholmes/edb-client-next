import { PropsPanel } from '@/components/props-panel'
import { SortableItem } from '@/components/sortable-item'
import { VScrollPanel } from '@/components/v-scroll-panel'
import { where } from '@/lib/math/where'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useContext } from 'react'
import { OverlapContext } from './overlap-provider'

function FileItem({ value, name }: { value: string; name: string }) {
  return (
    <SortableItem value={value} key={value} id={value}>
      <span>{name}</span>
    </SortableItem>
  )
}

export function FilesPropsPanel() {
  const { dfs, setDfs } = useContext(OverlapContext)

  return (
    <>
      <PropsPanel className="pr-2">
        <DndContext
          modifiers={[restrictToVerticalAxis]}
          //onDragStart={event => setActiveId(event.active.id as string)}
          onDragEnd={(event) => {
            const { active, over } = event

            if (over && active.id !== over?.id) {
              const oldIndex = where(
                dfs,
                (df) => df.id === (active.id as string)
              )[0]!
              const newIndex = where(
                dfs,
                (df) => df.id === (over.id as string)
              )[0]!
              //const oldIndex =    genesetState.order.indexOf(over.id as string)
              const newOrder = arrayMove(dfs, oldIndex, newIndex)

              setDfs(newOrder)
            }
          }}
        >
          <SortableContext
            items={dfs.map((df) => df.id)}
            strategy={verticalListSortingStrategy}
          >
            <VScrollPanel>
              <ul className="flex flex-col">
                {dfs.map((df) => {
                  return <FileItem value={df.id} name={df.name} key={df.id} />
                })}
              </ul>
            </VScrollPanel>
          </SortableContext>
        </DndContext>
      </PropsPanel>
    </>
  )
}
