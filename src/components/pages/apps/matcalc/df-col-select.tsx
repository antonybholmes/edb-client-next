import {
  SelectItem,
  SelectList,
  triggerVariants,
} from '@/components/shadcn/ui/themed/v2/select'
import type { BaseDataFrame } from '@/lib/dataframe/base-dataframe'
import type { VariantProps } from 'class-variance-authority'

/**
 * Select a column from the given DataFrame.
 *
 * @param param0
 * @returns
 */
export function DFColSelect({
  df,
  value,
  variant = 'default',
  limit = 10,
  onChange,
}: {
  df: BaseDataFrame
  value?: number
  limit?: number
  onChange?: (value: number) => void
} & VariantProps<typeof triggerVariants>) {
  const cols = limit > -1 ? df.columns.slice(0, limit) : df.columns

  const items = cols.map((c, ci) => ({ label: c, value: ci }))
  return (
    <SelectList
      variant={variant}
      w="md"
      className="text-xs"
      value={value}
      items={items}
      onValueChange={v => {
        onChange?.(Number(v))
      }}
    >
      {items.map(v => (
        <SelectItem key={v.value} value={v.value}>
          {v.label}
        </SelectItem>
      ))}
    </SelectList>
  )
}
