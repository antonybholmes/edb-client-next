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
  value = '',
  variant = 'default',
  limit = 10,
  onChange,
}: {
  df: BaseDataFrame
  value?: string | number
  limit?: number
  onChange?: ({ value, index }: { value: string; index: number }) => void
} & VariantProps<typeof triggerVariants>) {
  const cols = limit > -1 ? df.columns.slice(0, limit) : df.columns

  const colMap = new Map(cols.map((c, i) => [c, i]))

  const items = cols.map((c, ci) => ({ label: c, value: c }))

  const v = typeof value === 'number' ? df.columns[value] : value

  return (
    <SelectList
      variant={variant}
      w="md"
      className="text-xs"
      value={v}
      items={items}
      onValueChange={(v) => {
        onChange?.({ value: v as string, index: colMap.get(v as string) ?? 0 })
      }}
    >
      {items.map((v) => (
        <SelectItem key={v.value} value={v.value}>
          {v.label}
        </SelectItem>
      ))}
    </SelectList>
  )
}
