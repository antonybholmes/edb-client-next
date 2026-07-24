import { PropsPanel } from '@/components/props-panel'

import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { SortableItem } from '@/components/sortable-item'
import { TruncateSpan } from '@/components/truncate-span'
import { produce } from 'immer'

import { SelectAll } from '@/components/select-all'
import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { useMotifs, type IMotif } from './motifs-store'

function MotifItem({ motif, index }: { motif: IMotif; index: number }) {
  const { motifsInUse, setMotifsInUse } = useMotifs()

  const name =
    motif.motifId === motif.name
      ? motif.motifId
      : `${motif.name} (${motif.motifId})`

  return (
    <SortableItem key={motif.id} id={motif.id} index={index}>
      <Checkbox
        checked={motifsInUse[motif.id] ?? true}
        onCheckedChange={(v) => {
          setMotifsInUse(
            produce(motifsInUse, (draft) => {
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
        setSelectAll={(v) => {
          setMotifsInUse(
            produce(motifsInUse, (draft) => {
              Object.keys(draft).forEach((key) => {
                draft[key] = v
              })
            })
          )
        }}
      />

      <DragDropProvider
        onDragEnd={(event) => {
          const newOrder = move(searchResult.motifs, event)

          setSearchResult(
            produce(searchResult, (draft) => {
              draft.motifs = newOrder
            })
          )
        }}
      >
        <ul className="flex flex-col">
          {searchResult.motifs.map((motif, mi) => {
            return <MotifItem motif={motif} key={motif.id} index={mi} />
          })}
        </ul>
      </DragDropProvider>
    </PropsPanel>
  )
}
