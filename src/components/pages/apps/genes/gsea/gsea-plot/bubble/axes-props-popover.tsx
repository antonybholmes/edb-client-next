import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { Move3d } from 'lucide-react'
import { useState } from 'react'
import { AxisPropsPanel } from './axis-props-panel'

export function AxesPropsPopover() {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="text-foreground/70 hover:text-foreground data-pressed:text-foreground"
        title="Tick Properties"
      >
        <Move3d size={18} strokeWidth={1.5} />
      </PopoverTrigger>

      <PopoverContent className="gap-y-1 w-60">
        <AxisPropsPanel axis="x" />

        <LineSeparator />

        <AxisPropsPanel axis="y" />

        <LineSeparator />

        <AxisPropsPanel axis="colorbar" />
      </PopoverContent>
    </Popover>
  )
}
