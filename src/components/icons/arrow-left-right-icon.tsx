import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { ArrowLeftRight } from 'lucide-react'

export function ArrowLeftRightIcon({
  size = 'w-5 h-5',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1.5,
}: IIconProps) {
  return (
    <ArrowLeftRight
      className={cn(ICON_CLS, stroke, size, className)}
      strokeWidth={strokeWidth}
      stroke=""
    />
  )
}
