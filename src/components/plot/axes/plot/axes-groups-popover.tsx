import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { Move3d } from 'lucide-react'
import { useState } from 'react'
import { AxisPlotPropsPopover } from './axis-plot-props-popover'

export function AxesDisplayPropsPopover({
  plots,
}: {
  plots: {
    id: string
    title: string
    groups: {
      id: string
      title: string
      axes: { id: string; title: string }[]
    }[]
  }[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="text-foreground/70 hover:text-foreground data-pressed:text-foreground"
        title="Axes Properties"
        render={
          <ToolbarIconButton className="relative">
            <Move3d
              size={18}
              strokeWidth={1.5}
              className="relative z-0 opacity-50"
            />
          </ToolbarIconButton>
        }
      />

      <PopoverContent className="gap-y-1 w-60 flex flex-col">
        {plots.map(({ id: plotId, groups: groups }) => {
          return (
            <BaseCol key={plotId} className="grow">
              {groups.map(({ id: groupId, title: groupTitle, axes: axes }) => (
                <VCenterRow key={groupId} className="justify-between">
                  <strong>{groupTitle}</strong>
                  <VCenterRow>
                    {axes.map(({ id: axisId, title }) => (
                      <AxisPlotPropsPopover
                        key={axisId}
                        //axis={axis}
                        title={title}
                        plotAddress={{ plotId, groupId, axisId }}
                      />
                    ))}
                  </VCenterRow>
                </VCenterRow>
              ))}
            </BaseCol>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
