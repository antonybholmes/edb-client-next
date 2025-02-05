import { type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import { CircleHelp } from 'lucide-react'

export function HelpIcon({
  w = 'w-5',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1.5,
}: IIconProps) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 20 20"
    //   className={cn(ICON_CLS, w, fill, className)}
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

    <CircleHelp
      className={cn(stroke, w, className)}
      stroke=""
      strokeWidth={strokeWidth}
    />
  )
}
