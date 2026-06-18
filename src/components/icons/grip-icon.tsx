import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

const R = 2

export function GripIcon({
  size = 'h-5 w-5',
  fill = 'fill-foreground/50 stroke-none',
  className,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn(ICON_CLS, size, fill, className)}
    >
      <circle cx="4" cy="4" r={R} />
      <circle cx="16" cy="4" r={R} />
      <circle cx="28" cy="4" r={R} />

      <circle cx="4" cy="16" r={R} />
      <circle cx="16" cy="16" r={R} />
      <circle cx="28" cy="16" r={R} />

      <circle cx="4" cy="28" r={R} />
      <circle cx="16" cy="28" r={R} />
      <circle cx="28" cy="28" r={R} />
    </svg>

    // <Grip className={cn(ICON_CLS, stroke, size, className)} />
  )
}
