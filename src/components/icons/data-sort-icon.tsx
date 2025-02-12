import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import { ArrowUpWideNarrow } from 'lucide-react'

export function DataSortIcon({
  w = 'w-5 h-5',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 2,
}: IIconProps) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 24 24"
    //   className={cn(ICON_CLS, 'stroke-3', stroke, w, className)}
    //   style={{ strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' }}
    // >
    //   <path d="M 6,7 L 12,1 L 18,7" />

    //   <path d="M 6,17 L 12,23 L 18,17" />
    // </svg>

    <ArrowUpWideNarrow
      className={cn(ICON_CLS, stroke, w, className)}
      stroke=""
      strokeWidth={strokeWidth}
    />
  )
}
