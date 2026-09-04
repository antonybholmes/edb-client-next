import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { Move3d } from 'lucide-react'
import { Fragment, useState } from 'react'
import { AxisPlotPropsPopover } from './axis-plot-props-popover'

export function AxesDisplayPropsPopover({
  plotIds,
  axesGroups,
}: {
  plotIds: { id: string; title: string }[]
  axesGroups: {
    id: string
    title: string
    axesIds: { id: string; axis: 'x' | 'y'; title: string }[]
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
        {plotIds.map(({ id: plotId, title }, pi) => {
          return (
            <BaseCol key={plotId} className="grow">
              {axesGroups.map(({ id: groupId, title: groupTitle, axesIds }) => (
                <Fragment key={groupId}>
                  {axesGroups.map(
                    ({ id: groupId, title: groupTitle, axesIds }) => (
                      <VCenterRow key={groupId} className="justify-between">
                        <strong>{groupTitle}</strong>
                        <VCenterRow>
                          {axesIds.map(({ id: axisId, axis, title }) => (
                            <AxisPlotPropsPopover
                              key={axisId}
                              axis={axis}
                              title={title}
                              plotId={plotId}
                              axisId={axisId}
                            />
                          ))}
                        </VCenterRow>
                      </VCenterRow>
                    )
                  )}
                </Fragment>
              ))}
            </BaseCol>
          )
        })}
      </PopoverContent>
    </Popover>
  )
}
