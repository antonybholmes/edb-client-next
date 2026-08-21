import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { produce } from 'immer'
import { ListFilter } from 'lucide-react'
import { useState } from 'react'
import { useGseaSettings } from './gsea-settings-store'

export function GeneSetFilter() {
  const { settings, updateSettings } = useGseaSettings()

  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <ToolbarIconButton checked={open} title="Filter Gene Sets">
            <ListFilter size={14} />
          </ToolbarIconButton>
        }
      />

      <PopoverContent
        //onEscapeKeyDown={() => setOpen(false)}
        //onInteractOutside={() => setOpen(false)}
        //align="end"
        className="px-3 py-3 gap-y-2"
      >
        <h2 className="font-bold">Gene Set Filters</h2>
        <CheckPropRow
          title={<span>NES &ge;</span>}
          checked={settings.genesets.filters.nes.on}
          onCheckedChange={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.genesets.filters.nes.on = v
              })
            )
          }}
        >
          <NumericalInput
            value={settings.genesets.filters.nes.value}
            h="md"
            placeholder="NES"
            limit={[0, 100]}
            step={0.01}
            dp={2}
            onNumChanged={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.genesets.filters.nes.value = v
                })
              )
            }}
            w="sm"
          />
        </CheckPropRow>
        <CheckPropRow
          title={<span>FDR q-value &le;</span>}
          checked={settings.genesets.filters.q.on}
          onCheckedChange={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.genesets.filters.q.on = v
              })
            )
          }}
        >
          <NumericalInput
            value={settings.genesets.filters.q.value}
            h="md"
            placeholder="FDR q-value"
            limit={[0, 1]}
            step={0.0001}
            dp={4}
            onNumChanged={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.genesets.filters.q.value = v
                })
              )
            }}
            w="sm"
          />
        </CheckPropRow>
      </PopoverContent>
    </Popover>
  )
}
