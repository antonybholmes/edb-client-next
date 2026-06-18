import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

export function MarginIcon({
  size = 'w-5 h-5',

  className,
  strokeWidth = 1.5,
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn(ICON_CLS, size, className)}
    >
      <line x1="2" y1="17" x2="22" y2="17" />
      <line x1="5" y1="5" x2="5" y2="20" />
      <line x1="19" y1="5" x2="19" y2="20" />
      <line x1="2" y1="8" x2="22" y2="8" />
      {/* <rect width="18" height="18" x="3" y="3" rx="2" /> */}
    </svg>
  )
}
