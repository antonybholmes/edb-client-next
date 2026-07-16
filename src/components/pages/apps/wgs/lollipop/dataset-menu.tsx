import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { DatabaseCheck } from 'lucide-react'
import { useLollipopStore } from './lollipop-store'

export function DatasetMenu() {
  const {
    datasets,
    datasetsForUse,

    setDatasetsForUse,
  } = useLollipopStore()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger title="Select datasets for use in the lollipop plot">
        <DatabaseCheck strokeWidth={1.5} size={20} />
      </DropdownMenuTrigger>

      <DropdownMenuContent>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Datasets</DropdownMenuLabel>
          {datasets.map((db) => (
            <DropdownMenuCheckboxItem
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
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
