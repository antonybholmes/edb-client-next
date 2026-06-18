import type { SortOrder } from '@/consts'
import { type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { ArrowDownNarrowWide, ArrowUpWideNarrow } from 'lucide-react'

export function SortIcon({
  size = 'w-4.5',
  sortOrder = 'asc',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1.5,
}: IIconProps & { sortOrder: SortOrder }) {
  return sortOrder === 'asc' ? (
    <ArrowUpWideNarrow
      className={cn(stroke, size, className)}
      stroke=""
      strokeWidth={strokeWidth}
    />
  ) : (
    <ArrowDownNarrowWide
      className={cn(stroke, size, className)}
      stroke=""
      strokeWidth={strokeWidth}
    />
  )
}
