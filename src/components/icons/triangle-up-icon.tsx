import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

export function TriangleUpIcon({
  size = 'w-4 h-4',
  stroke = 'stroke-foreground',
  fill = 'fill-foreground',
  className,
  strokeWidth = 0,
}: IIconProps) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 24 24"
    //   className={cn(ICON_CLS, fill, stroke, size, className)}
    //   style={{
    //     strokeLinecap: 'round',
    //     strokeLinejoin: 'round',

    //     strokeWidth: 2,
    //     ...style,
    //   }}
    //   {...props}
    // >
    //   <polyline points="8,4 16,12 8,20" />
    // </svg>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(ICON_CLS, stroke, fill, size, className)}
      style={{
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth,
      }}
    >
      <polygon points="4,16 16,8 24,16" />
    </svg>
  )
}
