import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import { Grid3X3 } from 'lucide-react'

export function HeatmapChartIcon({
  w = 'w-5 h-5',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1.5,
}: IIconProps) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 24 24"
    //   className={cn(ICON_CLS, stroke, fill, w, className)}
    //   style={{
    //     strokeLinecap: 'round',
    //     strokeLinejoin: 'round',
    //     fill: 'none',
    //     ...style,
    //   }}
    //   {...props}
    // >
    //   <path d="M 12 2 L 12 14" />
    //   <path d="M 6 10 L 12 16 L 18 10" />
    //   <path d="M 2 20 L 22 20" />
    // </svg>

    <Grid3X3
      className={cn(ICON_CLS, stroke, w, className)}
      strokeWidth={strokeWidth}
      stroke=""
    />
  )
}
