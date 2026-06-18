import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

export function OptionsIcon({
  size = 'w-5 h-5',
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
      className={cn(ICON_CLS, stroke, size, className)}
    >
      <line x1="2" y1="6" x2="22" y2="6" />
      <circle cx="15" cy="6" r="3.5" fill="white" />
      <circle cx="15" cy="6" r="3.5" className="fill-theme/50 stroke-theme" />
      <line x1="2" y1="18" x2="22" y2="18" />
      <circle cx="9" cy="18" r="3.5" fill="white" />
      <circle cx="9" cy="18" r="3.5" className="fill-theme/50 stroke-theme" />
    </svg>
  )
}
