import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { SortableItem } from '@/components/sortable-item'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { TruncateSpan } from '@/components/truncate-span'
import { TEXT_SELECT_ALL } from '@/consts'
import { produce } from 'immer'
import { ListFilter } from 'lucide-react'
import { useState } from 'react'
import { useMotifs, type IDataset, type IMotif } from './motifs-store'

function DatasetItem({ dataset }: { dataset: IDataset }) {
  const { datasetsInUse, setDatasetsInUse } = useMotifs()

  return (
    <SortableItem key={dataset.id} id={dataset.id} className="h-8 gap-x-2">
      <Checkbox
        checked={datasetsInUse[dataset.id] ?? true}
        onCheckedChange={v => {
          setDatasetsInUse(
            produce(datasetsInUse, draft => {
              draft[dataset.id] = v
            })
          )
        }}
      />

      <TruncateSpan className="grow h-full">{dataset.name}</TruncateSpan>
    </SortableItem>
  )
}

function MotifItem({ motif }: { motif: IMotif }) {
  const { motifsInUse, setMotifsInUse } = useMotifs()

  const name =
    motif.motifId === motif.name
      ? motif.motifId
      : `${motif.name} (${motif.motifId})`

  return (
    <SortableItem key={motif.id} id={motif.id} className="h-8 gap-x-2">
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

export function DatasetFilter() {
  const { datasets, datasetsInUse, setDatasetsInUse } = useMotifs()

  const [open, setOpen] = useState(false)
  const [selectAll, setSelectAll] = useState(true)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <ToolbarIconButton checked={open} title="Filter Datasets">
            <ListFilter size={14} />
          </ToolbarIconButton>
        }
      />

      <PopoverContent
        //onEscapeKeyDown={() => setOpen(false)}
        //onInteractOutside={() => setOpen(false)}
        align="end"
        className="px-3 py-3 gap-y-2"
      >
        <h2 className="font-bold text-xs">Datasets</h2>
        <Checkbox
          checked={selectAll}
          onCheckedChange={v => {
            setSelectAll(v)
            setDatasetsInUse(
              produce(datasetsInUse, draft => {
                Object.keys(draft).forEach(key => {
                  draft[key] = v
                })
              })
            )
          }}
        >
          {TEXT_SELECT_ALL}
        </Checkbox>
        <LineSeparator />
        <ul className="flex flex-col gap-y-2.5">
          {datasets.map(dataset => {
            return (
              <li key={dataset.id}>
                <Checkbox
                  checked={datasetsInUse[dataset.id] ?? true}
                  onCheckedChange={v => {
                    setDatasetsInUse(
                      produce(datasetsInUse, draft => {
                        draft[dataset.id] = v
                      })
                    )
                  }}
                >
                  {dataset.name}
                </Checkbox>
              </li>
            )
          })}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
