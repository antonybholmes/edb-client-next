import { PropsPanel } from '@/components/props-panel'
import { SortableItem } from '@/components/sortable-item'
import { VScrollPanel } from '@/components/v-scroll-panel'

import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { useContext } from 'react'
import { OverlapContext } from './overlap-provider'

function FileItem({
  value,
  name,
  index,
}: {
  value: string
  name: string
  index: number
}) {
  return (
    <SortableItem value={value} key={value} id={value} index={index}>
      <span>{name}</span>
    </SortableItem>
  )
}

export function FilesPropsPanel() {
  const { dfs, setDfs } = useContext(OverlapContext)

  return (
    <>
      <PropsPanel className="pr-2">
        <VScrollPanel>
          <DragDropProvider
            //onDragStart={event => setActiveId(event.active.id as string)}
            onDragEnd={(event) => {
              const newOrder = move(dfs, event)

              setDfs(newOrder)
            }}
          >
            <ul className="flex flex-col">
              {dfs.map((df, di) => {
                return (
                  <FileItem
                    value={df.id}
                    name={df.name}
                    key={df.id}
                    index={di}
                  />
                )
              })}
            </ul>
          </DragDropProvider>
        </VScrollPanel>
      </PropsPanel>
    </>
  )
}
