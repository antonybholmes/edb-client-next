import { type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import { Info } from 'lucide-react'

export function InfoIcon({
  w = 'w-5 h-5',
  stroke = 'stroke-foreground',
  fill,
  className,
  strokeWidth = 2,
  iconMode,
}: IIconProps) {
  if (iconMode === 'colorful') {
    stroke = 'stroke-theme/50'
    fill = 'fill-white'
  }

  if (iconMode === 'bw') {
    stroke = 'stroke-foreground'
    fill = 'fill-background'
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
    //     className="font-bold stroke-none"
    //   >
    //     i
    //   </text>
    //   <circle cx="10" cy="10" r="9" className="stroke-2 fill-none" />
    // </svg>

    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 512 512"
    //   className={cn(ICON_CLS, w, fill, className)}
    // >
    //   <path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zM216 336l24 0 0-64-24 0c-13.3 0-24-10.7-24-24s10.7-24 24-24l48 0c13.3 0 24 10.7 24 24l0 88 8 0c13.3 0 24 10.7 24 24s-10.7 24-24 24l-80 0c-13.3 0-24-10.7-24-24s10.7-24 24-24zm40-208a32 32 0 1 1 0 64 32 32 0 1 1 0-64z" />
    // </svg>

    <Info
      className={cn(stroke, fill, w, className)}
      stroke=""
      strokeWidth={strokeWidth}
    />
  )
}
