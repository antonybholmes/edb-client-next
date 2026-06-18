import { PropsPanel } from '@/components/props-panel'
import { DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'

import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { SortableItem } from '@/components/sortable-item'
import { TruncateSpan } from '@/components/truncate-span'
import { produce } from 'immer'

import { SelectAll } from '@/components/select-all'
import { useMotifs, type IMotif } from './motifs-store'

function MotifItem({ motif }: { motif: IMotif }) {
  const { motifsInUse, setMotifsInUse } = useMotifs()

  const name =
    motif.motifId === motif.name
      ? motif.motifId
      : `${motif.name} (${motif.motifId})`

  return (
    <SortableItem key={motif.id} id={motif.id}>
      <Checkbox
        checked={motifsInUse[motif.id] ?? true}
        onCheckedChange={v => {
          setMotifsInUse(
            produce(motifsInUse, draft => {
              draft[motif.id] = v
            })
          )
        }}
      />

      <TruncateSpan className="grow h-full">{name}</TruncateSpan>
    </SortableItem>
  )
}

export function MotifsPropsPanel() {
  const { searchResult, motifsInUse, setMotifsInUse, setSearchResult } =
    useMotifs()

  return (
    <PropsPanel className="pr-2 gap-y-2">
      <SelectAll
        className="pl-7"
        setSelectAll={v => {
          setMotifsInUse(
            produce(motifsInUse, draft => {
              Object.keys(draft).forEach(key => {
                draft[key] = v
              })
            })
          )
        }}
      />

      <DndContext
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={event => {
          const { active, over } = event

          if (over && active.id !== over?.id) {
            const oldIndex = searchResult.motifs.findIndex(
              m => m.id === active.id
            )
            const newIndex = searchResult.motifs.findIndex(
              m => m.id === over.id
            )
            const newOrder = arrayMove(searchResult.motifs, oldIndex, newIndex)

            setSearchResult(
              produce(searchResult, draft => {
                draft.motifs = newOrder
              })
            )
          }
        }}
      >
        <SortableContext
          items={searchResult.motifs.map(motif => motif.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="flex flex-col">
            {searchResult.motifs.map(motif => {
              return <MotifItem motif={motif} key={motif.id} />
            })}
          </ul>
        </SortableContext>
      </DndContext>
    </PropsPanel>
  )
}
