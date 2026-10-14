import { MenuSeparator } from '@/components/shadcn/ui/themed/baseui/dropdown-menu'
import {
  SelectItem,
  SelectList,
} from '@/components/shadcn/ui/themed/baseui/select'
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

      //format={(label) => capitalCase(label as string)}
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
        ID
      </SelectItem>
      <SelectItem key="nodeId" value="nodeId">
        Node ID
      </SelectItem>
    </SelectList>
  )
}
