import { MenuSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
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

      value={nodes.label.field}
      onValueChange={(value) => {
        setNodeLabelField(value as string)
      }}
      w="sm"
      variant={variant}
      title="Text That Appears in Node Labels"
      items={[
        ...nodes.label.fields.map((field) => {
          return { value: field, label: field }
        }),
        { value: 'group', label: 'Group' },
        { value: 'id', label: 'id' },
        { value: 'id2', label: 'id2' },
      ]}
    >
      {nodes.label.fields.map((field) => (
        <SelectItem key={field} value={field}>
          {field}
        </SelectItem>
      ))}
      <MenuSeparator />
      <SelectItem key="group" value="group">
        Group
      </SelectItem>
      <SelectItem key="id" value="id">
        id
      </SelectItem>
      <SelectItem key="id2" value="id2">
        id2
      </SelectItem>
    </SelectList>
  )
}
