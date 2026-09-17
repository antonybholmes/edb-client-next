import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { produce } from 'immer'
import { ComponentProps } from 'react'
import { useGseaSettings } from '../gsea-settings-store'

export function PhenotypeModeList({
  variant = 'toolbar',
  w = 'sm',
  ...props
}: ComponentProps<typeof SelectList>) {
  const { settings, updateSettings } = useGseaSettings()

  return (
    <SelectList
      items={[
        { label: 'Normal', value: 'normal' },
        //{ label: 'Reversed', value: 'reversed' },
        { label: 'Inverted', value: 'inverted' },
      ]}
      value={settings.phenotypes.mode}
      onValueChange={(value) => {
        updateSettings(
          produce(settings, (draft) => {
            draft.phenotypes.mode = value as 'normal' | 'inverted'
          })
        )
      }}
      w={w}
      title="Phenotype Mode"
      variant={variant}
      {...props}
    >
      <SelectItem value="normal">Normal</SelectItem>
      {/* <SelectItem value="reversed">Reversed</SelectItem> */}
      <SelectItem value="inverted">Inverted</SelectItem>
    </SelectList>
  )
}
