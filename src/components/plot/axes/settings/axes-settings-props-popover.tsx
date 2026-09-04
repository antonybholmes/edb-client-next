import { AxisType } from '@/components/plot/axes/svg-axis-props'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { Move3d } from 'lucide-react'
import { Fragment, useState } from 'react'
import { AxisSettingsPropsPanel } from './axis-settings-props-panel'

export function AxesSettingsPropsPopover({
  axes = ['x', 'y', 'colorbar'],
}: {
  axes?: AxisType[]
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="text-foreground/70 hover:text-foreground data-pressed:text-foreground"
        title="Axes Properties"
        render={
          <ToolbarIconButton>
            <Move3d size={18} strokeWidth={1.5} />
          </ToolbarIconButton>
        }
      />

      <PopoverContent className="gap-y-1 w-60">
        {axes.map((axis, index) => (
          <Fragment key={axis}>
            <AxisSettingsPropsPanel axis={axis} />
            {index < axes.length - 1 && <LineSeparator />}
          </Fragment>
        ))}
      </PopoverContent>
    </Popover>
  )
}
