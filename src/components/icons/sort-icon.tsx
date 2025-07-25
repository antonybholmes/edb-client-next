import { type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import { ArrowDownNarrowWide, ArrowUpWideNarrow } from 'lucide-react'

export function SortIcon({
  w = 'w-4.5',
  reverse = false,
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1.5,
}: IIconProps & { reverse?: boolean }) {
  return reverse ? (
    <ArrowUpWideNarrow
      className={cn(stroke, w, className)}
      stroke=""
      strokeWidth={strokeWidth}
    />
  ) : (
    <ArrowDownNarrowWide
      className={cn(stroke, w, className)}
      stroke=""
      strokeWidth={strokeWidth}
    />
  )
}
