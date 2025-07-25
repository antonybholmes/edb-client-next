import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'

export function LollipopStackIcon({
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
      <circle
        cx="4"
        cy="20"
        r="3"
        strokeWidth="1.5"
        className={cn(fill, stroke)}
      />

      <circle
        cx="4"
        cy="12"
        r="3"
        className={cn(fill, stroke)}
        strokeWidth="1.5"
      />

      <circle
        cx="12"
        cy="4"
        r="3"
        className={cn(fill, stroke)}
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="12"
        r="3"
        className={cn(fill, stroke)}
        strokeWidth="1.5"
      />
      <circle
        cx="12"
        cy="20"
        r="3"
        className={cn(fill, stroke)}
        strokeWidth="1.5"
      />

      <circle
        cx="20"
        cy="12"
        r="3"
        className={cn(fill, stroke)}
        strokeWidth="1.5"
      />

      <circle
        cx="20"
        cy="20"
        r="3"
        className={cn(fill, stroke)}
        strokeWidth="1.5"
      />
    </svg>
  )
}
