import { type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import { Copy, CopyCheck } from 'lucide-react'

export function MultiSelectIcon({
  w = 'w-4.5',
  checked = false,
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1.5,
}: IIconProps & { checked?: boolean }) {
  return checked ? (
    <CopyCheck
      className={cn(stroke, w, className)}
      stroke=""
      strokeWidth={strokeWidth}
    />
  ) : (
    <Copy
      className={cn(stroke, w, className)}
      stroke=""
      strokeWidth={strokeWidth}
    />
  )
}
