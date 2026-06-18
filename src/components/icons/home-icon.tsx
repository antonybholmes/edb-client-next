import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { House } from 'lucide-react'

export function HomeIcon({
  size = 'h-5 w-5',

  className,
  strokeWidth = 1.5,
  style,
}: IIconProps) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 20 20"
    //   className={cn(ICON_CLS, size, fill, className)}
    // >
    //   <text
    //     textAnchor="middle"
    //     dominantBaseline="central"
    //     x="10"
    //     y="10"
    //     fontSize="small"
    //     className="font-medium stroke-none"
    //   >
    //     ?
    //   </text>
    //   <circle cx="10" cy="10" r="9" className="stroke-2 fill-none" />
    // </svg>

    <House
      className={cn(ICON_CLS, size, className)}
      strokeWidth={strokeWidth}
      style={style}
    />
  )
}
