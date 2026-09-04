import { PropRow } from '@/components/dialogs/prop-row'
import { SwitchPropRow } from '@/components/dialogs/switch-prop-row'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { AxisType } from '@/components/plot/axes/svg-axis-props'
import { FontPopover } from '@/components/plot/font/font-popover'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
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

export function TickSettingsPropsPopover({
  axis,
  which,
}: {
  axis: AxisType
  which: 'major' | 'minor'
}) {
  const { settings, updateSettings } = useEdbSettings()
  const [open, setOpen] = useState(false)

  const title = `${capitalCase(axis)}-Axis ${capitalCase(which)} Ticks`

  const icon =
    axis === 'x' ? (
      <MoveRight size={which === 'major' ? 18 : 14} strokeWidth={1.5} />
    ) : (
      <MoveUp size={which === 'major' ? 18 : 14} strokeWidth={1.5} />
    )

  console.log(settings.plots, axis, which)

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
          checked={settings.plots.axes[axis].ticks[which].show}
          onCheckedChange={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plots.axes[axis].ticks[which].show = v
              })
            )
          }}
        >
          <FontPopover
            fonts={[
              {
                title: `${capitalCase(axis)}-Axis ${capitalCase(which)} Tick Labels`,
                textProps: settings.plots.axes[axis].ticks[which].labels,
                showRotation: true,
                update: (f) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plots.axes[axis].ticks[which].labels =
                        Object.assign(
                          draft.plots.axes[axis].ticks[which].labels,
                          f
                        )
                    })
                  ),
              },
            ]}
          />
        </SwitchPropRow>

        <PropRow title="Size / Offset">
          <NumericalInput
            title="Size"

            value={settings.plots.axes[axis].ticks[which].style.line.size}

            limit={[1, 1000]}
            dp={0}
            onNumChanged={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.plots.axes[axis].ticks[which].style.line.size = v
                })
              )
            }}
          />

          <NumericalInput
            value={settings.plots.axes[axis].ticks[which].style.line.offset}
            title="Offset"
            onNumChanged={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.plots.axes[axis].ticks[which].style.line.offset = v
                })
              )
            }}
          />
        </PropRow>
        <PropRow title="Label Offset">
          <NumericalInput
            value={settings.plots.axes[axis].ticks[which].style.labels.offset}
            title="Label Offset"
            onNumChanged={(v) => {
              updateSettings(
                produce(settings, (draft) => {
                  draft.plots.axes[axis].ticks[which].style.labels.offset = v
                })
              )
            }}
          />
        </PropRow>
      </PopoverContent>
    </Popover>
  )
}
