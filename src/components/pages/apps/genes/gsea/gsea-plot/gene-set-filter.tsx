import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/baseui/popover'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { produce } from 'immer'
import { ListFilter } from 'lucide-react'
import { useState } from 'react'
import { useGseaSettings } from './gsea-settings'
import { useGsea } from './gsea-store'

export function GeneSetFilter() {
  const { settings, updateSettings } = useGseaSettings()
  const { phenotypes, phenotypesFilter, setPhenotypesFilter } = useGsea()

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
        className="px-3 py-3 gap-y-1"
      >
        <h2 className="font-bold">Phenotypes</h2>

        {phenotypes.map((p, pi) => (
          <CheckPropRow
            key={pi}
            title={p}
            checked={phenotypesFilter[p]}
            onCheckedChange={(v) => {
              console.log('Setting phenotype filter for', p, 'to', v)
              setPhenotypesFilter({ ...phenotypesFilter, [p]: v })
            }}
          />
        ))}

        <h2 className="font-bold">Statistics</h2>

        <CheckPropRow
          gap="gap-x-8"
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
            h="toolbar"
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
            w="xs"
          />
        </CheckPropRow>
        <CheckPropRow
          gap="gap-x-8"
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
            h="toolbar"
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
            w="xs"
          />
        </CheckPropRow>
      </PopoverContent>
    </Popover>
  )
}
