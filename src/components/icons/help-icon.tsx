import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import { CircleHelp } from 'lucide-react'

export function HelpIcon({
  w = 'h-5 w-5',
  stroke = 'stroke-foreground',
  fill,
  className,
  strokeWidth = 1.5,
  iconMode,
}: IIconProps) {
  if (iconMode === 'colorful') {
    stroke = 'stroke-theme/75'
    fill = 'fill-white'
  }

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
      className={cn(ICON_CLS, stroke, w, fill, className)}
      stroke=""
      strokeWidth={strokeWidth}
    />
  )
}
