import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { HeaderIconButton } from '@/layouts/header-icon-button'
import { DatabaseCheck } from 'lucide-react'
import { useState } from 'react'
import { useLollipopStore } from './lollipop-store'

export function DatasetMenu() {
  const {
    datasets,
    datasetsForUse,

    setDatasetsForUse,
  } = useLollipopStore()

  const [open, setOpen] = useState(false)

  if (datasets.length === 0) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        title="Select datasets for use in the lollipop plot"

        render={
          <HeaderIconButton checked={open}>
            <DatabaseCheck strokeWidth={1.5} size={20} />
          </HeaderIconButton>
        }
      />

      <PopoverContent variant="header" className="gap-y-2 text-xs w-64">
        <h2 className="font-medium">Datasets</h2>
        {datasets.map((db) => (
          <Checkbox
            key={db}
            checked={datasetsForUse[db] ?? false}
            onCheckedChange={(v) =>
              setDatasetsForUse({
                ...datasetsForUse,
                [db]: v,
              })
            }
          >
            {db}
          </Checkbox>
        ))}
      </PopoverContent>
    </Popover>
  )
}
