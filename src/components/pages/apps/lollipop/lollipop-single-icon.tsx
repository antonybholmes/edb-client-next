import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'

export function LollipopSingleIcon({
  w = 'w-4',
  fill = 'fill-background',
  stroke = 'stroke-foreground',
  className,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(ICON_CLS, w, className)}
    >
      <line
        x1="4"
        x2="4"
        y1="23"
        y2="12"
        className={cn(stroke)}
        strokeWidth="1.5"
      />

      <circle
        cx="4"
        cy="12"
        r="3"
        className={cn(fill, stroke)}
        strokeWidth="1.5"
      />

      <line
        x1="12"
        x2="12"
        y1="23"
        y2="4"
        className={cn(stroke)}
        strokeWidth="1.5"
      />

      <circle
        cx="12"
        cy="4"
        r="3"
        className={cn(fill, stroke)}
        strokeWidth="1.5"
      />

      <line
        x1="20"
        x2="20"
        y1="23"
        y2="12"
        className={cn(stroke)}
        strokeWidth="1.5"
      />

      <circle
        cx="20"
        cy="12"
        r="3"
        className={cn(fill, stroke)}
        strokeWidth="1.5"
      />
    </svg>
  )
}
