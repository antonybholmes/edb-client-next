import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'

export function TriangleRightIcon({
  w = 'w-4 h-4',
  stroke = 'stroke-foreground',
  fill = 'fill-foreground',
  className,
  strokeWidth = 0,
  ...props
}: IIconProps) {
  return (
    // <svg
    //   xmlns="http://www.w3.org/2000/svg"
    //   viewBox="0 0 24 24"
    //   className={cn(ICON_CLS, fill, stroke, w, className)}
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
      className={cn(ICON_CLS, stroke, fill, w, className)}
      style={{
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth,
      }}
    >
      <polygon points="7,4 15,12 7,20" />
    </svg>
  )
}
