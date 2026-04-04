import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

export function CompactLayoutIcon({
  w = 'w-4 h-4',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 2,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
      className={cn(ICON_CLS, stroke, w, className)}
    >
      <line x1="3" y1="5" x2="10" y2="5" />
      <line x1="14" y1="5" x2="21" y2="5" />

      <line x1="3" y1="12" x2="10" y2="12" />
      <line x1="14" y1="12" x2="21" y2="12" />

      <line x1="3" y1="19" x2="10" y2="19" />
      <line x1="14" y1="19" x2="21" y2="19" />
    </svg>
  )
}
