import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'

export function MinusIcon({
  w = 'w-4',
  stroke = 'stroke-2',
  fill = 'fill-foreground',
  style,
  className,
  ...props
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(ICON_CLS, stroke, fill, w, className)}
      style={{
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        ...style,
      }}
      {...props}
    >
      <path d="M6 12H18 " />
    </svg>
  )
}
