import { PropRow } from '@/components/dialogs/prop-row'
import { SwitchPropRow } from '@/components/dialogs/switch-prop-row'
import { FontPopover } from '@/components/plot/font/font-popover'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { capitalCase } from '@/lib/text/capital-case'
import { produce } from 'immer'
import { MoveRight, MoveUp } from 'lucide-react'
import { useState } from 'react'
import { useAxes } from '../axes-provider'
import { getAxisFormatter, getAxisTicks } from '../axis'

export function TickPlotPropsPopover({
  title,
  plotId,
  axesId,
  which,
}: {
  title: string
  plotId: string
  axesId: string
  which: 'major' | 'minor'
}) {
  const [open, setOpen] = useState(false)

  const { plots, updateAxis } = useAxes()

  const plot = plots[plotId]
  const axis = plot.axes[axesId]
  const ticks = axis.ticks[which]

  const items = getAxisTicks(axis)
  const format = getAxisFormatter(axis, axis.ticks.major.numTicks)

  const icon = title.toLowerCase().includes('x') ? (
    <MoveRight size={which === 'major' ? 18 : 14} strokeWidth={1.5} />
  ) : (
    <MoveUp size={which === 'major' ? 18 : 14} strokeWidth={1.5} />
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="text-foreground/70 hover:text-foreground data-pressed:text-foreground"
        title={`${title} Properties`}
        render={<ToolbarIconButton>{icon}</ToolbarIconButton>}
      />

      <PopoverContent className="gap-y-1">
        <SwitchPropRow
          title={title}
          className="font-bold"
          checked={ticks.show}
          onCheckedChange={(v) => {
            updateAxis(plotId, axesId, {
              ticks: produce(axis.ticks, (draft) => {
                draft[which].show = v
              }),
            })
          }}
        >
          <FontPopover
            fonts={[
              {
                title: `${title} ${capitalCase(which)} Tick Labels`,
                textProps: ticks.style.labels,
                showRotation: true,
                update: (f) =>
                  updateAxis(plotId, axesId, {
                    ticks: produce(axis.ticks, (draft) => {
                      draft[which].style.labels = Object.assign(
                        {},
                        draft[which].style.labels,
                        f
                      )
                    }),
                  }),
              },
            ]}
          />
        </SwitchPropRow>

        <PropRow title="Ticks">
          <Input
            value={items.map((v) => format(v.v)).join('; ')}
            onTextChanged={(v) => {
              const values = v
                .split(';')
                .map((s) => parseFloat(s.trim().replace(/,/g, '')))
                .filter(Number.isFinite)
              updateAxis(plotId, axesId, {
                ticks: produce(axis.ticks, (draft) => {
                  draft[which].items = values.map((v) => ({
                    v,
                    label: format(v),
                  }))
                }),
              })
            }}
            w="lg"
          />
        </PropRow>

        <PropRow title="Size / Offset">
          <NumericalInput
            title="Size"

            value={ticks.style.line.size}

            limit={[1, 1000]}
            dp={0}
            onNumChanged={(v) => {
              updateAxis(plotId, axesId, {
                ticks: produce(axis.ticks, (draft) => {
                  draft[which].style.line.size = v
                }),
              })
            }}
          />

          <NumericalInput
            value={ticks.style.line.offset}
            title="Offset"
            onNumChanged={(v) => {
              updateAxis(plotId, axesId, {
                ticks: produce(axis.ticks, (draft) => {
                  draft[which].style.line.offset = v
                }),
              })
            }}
          />
        </PropRow>
        <PropRow title="Label Offset">
          <NumericalInput
            value={ticks.style.labels.offset}
            title="Label Offset"
            onNumChanged={(v) => {
              updateAxis(plotId, axesId, {
                ticks: produce(axis.ticks, (draft) => {
                  draft[which].style.labels.offset = v
                }),
              })
            }}
          />
        </PropRow>
      </PopoverContent>
    </Popover>
  )
}
