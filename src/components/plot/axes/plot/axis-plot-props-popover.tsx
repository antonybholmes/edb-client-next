import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { Move3d } from 'lucide-react'
import { useState } from 'react'
import { AxisPlotPropsPanel } from './axis-plot-props-panel'

export function AxisPlotPropsPopover({
  title,
  axis,
  plotId,
  axisId,
}: {
  title: string
  axis: 'x' | 'y'
  plotId: string
  axisId: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="text-foreground/70 hover:text-foreground data-pressed:text-foreground"
        title={`${title}-Axis Properties`}
        render={
          <ToolbarIconButton className="relative">
            <Move3d
              size={18}
              strokeWidth={1.5}
              className="relative z-0 opacity-50"
            />
            <span className="absolute z-10 right-1.5 top-1 font-bold">
              {axis.at(0).toUpperCase()}
            </span>
          </ToolbarIconButton>
        }
      />

      <PopoverContent className="gap-y-1 w-60">
        <AxisPlotPropsPanel title={title} plotId={plotId} axisId={axisId} />
      </PopoverContent>
    </Popover>
  )
}
