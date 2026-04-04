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
        {/* <FileDropPanel
          onFileDrop={files => {
            if (files.length > 0) {
              //setDroppedFile(files[0]);
              //console.log('Dropped file:', files[0])

              onTextFileChange('Open dropped file', files, openOverlapFiles)
            }
          }}
        > */}

        {/* <Reorder.Group
            axis="y"
            values={dfs.map(df => df.id)}
            onReorder={order =>
              setDfs(reorder(dfs, order, (df, id) => df.id === id))
            }
            className="flex flex-col"
          >
            {dfs.map(df => {
              return <FileItem value={df.id} name={df.name} key={df.id} />
            })}
          </Reorder.Group> */}

        <DndContext
          modifiers={[restrictToVerticalAxis]}
          //onDragStart={event => setActiveId(event.active.id as string)}
          onDragEnd={event => {
            const { active, over } = event

            if (over && active.id !== over?.id) {
              const oldIndex = where(
                dfs,
                df => df.id === (active.id as string)
              )[0]!
              const newIndex = where(
                dfs,
                df => df.id === (over.id as string)
              )[0]!
              //const oldIndex =    genesetState.order.indexOf(over.id as string)
              const newOrder = arrayMove(dfs, oldIndex, newIndex)

              setDfs(newOrder)
            }

            //setActiveId(null)
          }}
        >
          <SortableContext
            items={dfs.map(df => df.id)}
            strategy={verticalListSortingStrategy}
          >
            <VScrollPanel>
              <ul className="flex flex-col">
                {dfs.map(df => {
                  return <FileItem value={df.id} name={df.name} key={df.id} />
                })}
              </ul>
            </VScrollPanel>
          </SortableContext>

          {/* <DragOverlay>
                              {activeId ? (
                                <FileItem
                                  geneset={genesetState.genesets[activeId]!}
                                  active={activeId}
                                />
                              ) : null}
                            </DragOverlay> */}
        </DndContext>

        {/* </FileDropPanel> */}
      </PropsPanel>
    </>
  )
}
