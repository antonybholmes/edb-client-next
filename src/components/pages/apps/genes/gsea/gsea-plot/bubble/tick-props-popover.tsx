import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { NumericalPropRow } from '@/components/dialogs/numerical-prop-row'
import { PropRow } from '@/components/dialogs/prop-row'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { produce } from 'immer'
import { Move3d } from 'lucide-react'
import { useState } from 'react'

export function TickPropsPopover() {
  const { settings, updateSettings } = useEdbSettings()
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="text-foreground/70 hover:text-foreground data-pressed:text-foreground"
        title="Tick Properties"
      >
        <Move3d size={18} strokeWidth={1.5} />
      </PopoverTrigger>
      <PopoverContent className="gap-y-1">
        <CheckPropRow
          className="font-bold"
          title="Major"
          checked={settings.plots.axes.ticks.major.show}
          onCheckedChange={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plots.axes.ticks.major.show = v
              })
            )
          }}
        />
        <PropRow title="Size / Offset">
          <NumericalInput
            title="Size"

            value={settings.plots.axes.ticks.major.line.size}

            limit={[1, 1000]}
            dp={0}
            onNumChanged={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.plots.axes.ticks.major.line.size = v
                })
              )
            }}
          />

          <NumericalInput
            value={settings.plots.axes.ticks.major.line.offset}
            title="Offset"
            onNumChanged={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.plots.axes.ticks.major.line.offset = v
                })
              )
            }}
          />
        </PropRow>

        <NumericalPropRow
          value={settings.plots.axes.ticks.major.labels.offset}
          title="Label Offset"
          onNumChanged={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plots.axes.ticks.major.labels.offset = v
              })
            )
          }}
        />

        <LineSeparator />

        <CheckPropRow
          title="Minor"
          className="font-bold"
          checked={settings.plots.axes.ticks.minor.show}
          onCheckedChange={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                console.log('mmmm2', v)
                draft.plots.axes.ticks.minor.show = v
              })
            )
          }}
        />

        <PropRow title="Size / Offset">
          <NumericalInput
            title="Size"

            value={settings.plots.axes.ticks.minor.line.size}

            limit={[1, 1000]}
            dp={0}
            onNumChanged={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.plots.axes.ticks.minor.line.size = v
                })
              )
            }}
          />

          <NumericalInput
            value={settings.plots.axes.ticks.minor.line.offset}
            title="Offset"
            onNumChanged={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.plots.axes.ticks.minor.line.offset = v
                })
              )
            }}
          />
        </PropRow>

        <NumericalPropRow
          value={settings.plots.axes.ticks.minor.labels.offset}
          title="Label Offset"
          onNumChanged={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plots.axes.ticks.minor.labels.offset = v
              })
            )
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
