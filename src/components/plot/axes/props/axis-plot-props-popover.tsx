import { VCenterRow } from '@/components/layout/v-center-row'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/baseui/popover'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { Move3d } from 'lucide-react'
import { ReactNode, useState } from 'react'
import { IAxis } from '../axis'
import { IPlotAddress } from '../plot-axes'
import { AxisPlotPropsPanel } from './axis-plot-props-panel'

export function AxisPlotPropsPopover({
  title,
  button = 'simple',
  plotAddress,
  callback,
}: {
  title: string
  button?: 'flat' | 'simple'
  plotAddress: IPlotAddress
  callback?: (axis: IAxis) => void
}) {
  const [open, setOpen] = useState(false)

  const shortTitle = title.at(0).toUpperCase()

  const icon: ReactNode = (
    <VCenterRow
      className="relative aspect-square w-5 h-5 group"
      data-open={open}
    >
      <Move3d
        size={18}
        strokeWidth={1.5}
        className="relative z-0 opacity-50 group-data-[open=true]:opacity-100 group-hover:opacity-100 trans-opacity"
      />
      <span className="absolute z-10 right-0 font-bold top-0">
        {shortTitle}
      </span>
    </VCenterRow>
  )

  const trigger: ReactNode =
    button === 'flat' ? (
      <PopoverTrigger
        render={
          <ToolbarIconButton title={title} className="group">
            {icon}
          </ToolbarIconButton>
        }
      />
    ) : (
      <PopoverTrigger title={title} className="group">
        {icon}
      </PopoverTrigger>
    )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {trigger}

      <PopoverContent className="gap-y-1 w-60">
        <AxisPlotPropsPanel
          title={title}
          plotAddress={plotAddress}
          callback={callback}
        />
      </PopoverContent>
    </Popover>
  )
}
