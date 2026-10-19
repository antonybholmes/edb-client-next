import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/baseui/popover'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { Move3d } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { AxisPlotPropsPopover } from './axis-plot-props-popover'

export interface IDisplayAxis {
  id: string
  title: string
}

export interface IDisplayPlot extends IDisplayAxis {
  groups: (IDisplayAxis & {
    axes: IDisplayAxis[]
  })[]
}

export function AxesDisplayPropsPopover({
  plots,
  button = 'simple',
}: {
  plots: IDisplayPlot[]
  button?: 'flat' | 'simple'
}) {
  const [open, setOpen] = useState(false)

  const trigger: ReactNode =
    button === 'flat' ? (
      <PopoverTrigger
        render={
          <ToolbarIconButton
            title="Axes Properties"
            className="group"
            data-open={open}
          >
            <Move3d
              size={18}
              strokeWidth={1.5}
              className="relative z-0 opacity-70 group-hover:opacity-100 group-data-[open=true]:opacity-100 trans-opacity"
            />
          </ToolbarIconButton>
        }
      />
    ) : (
      <PopoverTrigger
        title="Axes Properties"
        className="group"
        data-open={open}
      >
        <Move3d
          size={18}
          strokeWidth={1.5}

          className="relative z-0 opacity-70 group-hover:opacity-100 group-data-[open=true]:opacity-100 trans-opacity"
        />
      </PopoverTrigger>
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {trigger}

      <PopoverContent className="gap-y-1 w-60 flex flex-col">
        {plots.map(({ id: plotId, groups: groups }) => {
          return (
            <BaseCol key={plotId} className="grow">
              {groups.map(({ id: groupId, title: groupTitle, axes: axes }) => (
                <VCenterRow key={groupId} className="justify-between">
                  <strong>{groupTitle}</strong>
                  <VCenterRow className="gap-x-1">
                    {axes.map(({ id: axisId, title }) => (
                      <AxisPlotPropsPopover
                        key={axisId}
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
