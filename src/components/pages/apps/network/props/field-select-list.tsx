import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import type { ComponentProps } from 'react'
import { useNetwork } from '../network-store'

export function FieldSelectList({
  variant = 'toolbar',
  ...props
}: ComponentProps<typeof SelectList>) {
  const { nodes, setNodeLabelField } = useNetwork() // Assuming you have a context to provide these values
  return (
    <SelectList
      {...props}
      //items={LABEL_TYPES}
      value={nodes.label.field}
      onValueChange={(value) => {
        setNodeLabelField(value as string)
      }}
      w="md"
      variant={variant}
    >
      {nodes.label.fields.map((field) => (
        <SelectItem key={field} value={field}>
          {field}
        </SelectItem>
      ))}
      <SelectItem key="id" value="id">
        id
      </SelectItem>
      <SelectItem key="id2" value="id2">
        id2
      </SelectItem>
    </SelectList>
  )
}
