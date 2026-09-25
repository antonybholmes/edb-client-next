import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { RadiusScaleMode } from '../svg/cell-svg'

const ITEMS = [
  { label: 'Linear', value: 'linear' },
  { label: 'Area', value: 'area' },
]

export function RadiusScaleModeSelectList({
  value,
  onValueChange,
}: {
  value: RadiusScaleMode
  onValueChange: (value: RadiusScaleMode) => void
}) {
  return (
    <SelectList
      items={ITEMS}
      value={value}
      onValueChange={onValueChange}
      w="xs"
    >
      <SelectItem value="linear">Linear</SelectItem>
      <SelectItem value="area">Area</SelectItem>
    </SelectList>
  )
}
