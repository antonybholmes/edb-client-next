import {
  SelectItem,
  SelectLabel,
  SelectList,
} from '@/components/shadcn/ui/themed/v2/select'

import { useLollipopStore } from './lollipop-store'

export function DatasetSelect() {
  const {
    datasets,
    datasetsForUse,

    setDatasetsForUse,
  } = useLollipopStore()

  return (
    <SelectList
      variant="header"
      w="md"
      className="text-xs"
      multiple={true}
      value={datasets.filter((db) => datasetsForUse[db] ?? false)}
      //items={items}
      onValueChange={(v) => {
        console.log('AssemblySelect onValueChange', v)

        setDatasetsForUse(
          Object.fromEntries((v as string[]).map((db) => [db, true]))
        )
      }}
    >
      <SelectLabel>Datasets</SelectLabel>
      {datasets.map((db) => (
        <SelectItem key={db} value={db}>
          {db}
        </SelectItem>
      ))}
    </SelectList>
  )
}
