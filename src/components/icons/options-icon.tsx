import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'

export function OptionsIcon({
  w = 'w-5 h-5',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1,
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
      <line x1="1" y1="6" x2="23" y2="6" />
      <circle cx="16" cy="6" r="3.5" fill="white" />
      <line x1="1" y1="18" x2="23" y2="18" />
      <circle cx="8" cy="18" r="3.5" fill="white" />
    </svg>
  )
}
