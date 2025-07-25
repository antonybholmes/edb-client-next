import { PropsPanel } from '@components/props-panel'
import { VScrollPanel } from '@components/v-scroll-panel'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { VerticalGripIcon } from '@icons/vertical-grip-icon'
import { VCenterRow } from '@layout/v-center-row'
import { where } from '@lib/math/where'
import { useContext } from 'react'
import { OverlapContext } from './overlap-provider'

function FileItem({ value, name, ...props }: { value: string; name: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: value })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      value={value}
      ref={setNodeRef}
      key={value}
      id={value}
      className="flex flex-row items-center gap-x-2 hover:bg-muted rounded-theme overflow-hidden p-1"
      {...props}
      style={style}
    >
      <VCenterRow className="cursor-ns-resize" {...listeners} {...attributes}>
        <VerticalGripIcon />
      </VCenterRow>
      <span>{name}</span>
    </li>
  )
}

export function FilesPropsPanel() {
  const { dfs, setDfs } = useContext(OverlapContext)

  return (
    <>
      <PropsPanel>
        {/* <FileDropPanel
          onFileDrop={files => {
            if (files.length > 0) {
              //setDroppedFile(files[0]);
              //console.log('Dropped file:', files[0])

              onTextFileChange('Open dropped file', files, openOverlapFiles)
            }
          }}
        > */}
        <VScrollPanel>
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
              <ul className="flex flex-col">
                {dfs.map(df => {
                  return <FileItem value={df.id} name={df.name} key={df.id} />
                })}
              </ul>
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
        </VScrollPanel>
        {/* </FileDropPanel> */}
      </PropsPanel>
    </>
  )
}
