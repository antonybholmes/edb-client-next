import {
  SelectItem,
  SelectLabel,
  SelectList,
  triggerVariants,
} from '@/components/shadcn/ui/themed/v2/select'
import type { VariantProps } from 'class-variance-authority'
import { produce } from 'immer'
import { useEdbSettings } from './edb-settings'
import { DEFAULT_ASSEMBLIES } from './genome'

export function AssemblySelect({
  value,
  variant = 'header',
  items = DEFAULT_ASSEMBLIES,
  onChange,
}: {
  value?: string
  items?: { label: string; value: string }[]
  onChange?: (value: string) => void
} & VariantProps<typeof triggerVariants>) {
  const { settings, updateSettings } = useEdbSettings()

  return (
    <SelectList
      variant={variant}
      w="md"
      className="text-xs"
      value={value ?? settings.genomic.assembly}
      items={items}
      onValueChange={v => {
        updateSettings(
          produce(settings, draft => {
            draft.genomic.assembly = (v as string).toLowerCase()
          })
        )

        onChange?.((v as string).toLowerCase())
      }}
    >
      {/* <SelectGroup>
        <SelectLabel>Genome Assembly</SelectLabel> */}

      <SelectLabel>Genome Assembly</SelectLabel>
      {items.map(db => (
        <SelectItem key={db.value} value={db.value}>
          {db.label}
        </SelectItem>
      ))}
      {/* </SelectGroup> */}
    </SelectList>
  )
}
