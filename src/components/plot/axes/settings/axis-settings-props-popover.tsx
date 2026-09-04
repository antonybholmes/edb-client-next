import { AxisType } from '@/components/plot/axes/svg-axis-props'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { capitalCase } from '@/lib/text/capital-case'
import { Move3d } from 'lucide-react'
import { useState } from 'react'
import { AxisSettingsPropsPanel } from './axis-settings-props-panel'

export function AxisSettingsPropsPopover({ axis }: { axis: AxisType }) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="text-foreground/70 hover:text-foreground data-pressed:text-foreground"
        title={`${capitalCase(axis)}-Axis Properties`}
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
        <AxisSettingsPropsPanel axis={axis} />
      </PopoverContent>
    </Popover>
  )
}
