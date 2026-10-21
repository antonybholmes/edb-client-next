import { ICON_CLS, type IIconProps } from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'

export interface ICheckProps extends IIconProps {
  checked?: boolean
}

export function StraightConnectorIcon({
  size = 'w-4 h-4',
  stroke = 'stroke-foreground',
  style,
  className,
  ...props
}: IIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      className={cn(ICON_CLS, stroke, size, className)}
      style={{
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        fill: 'none',

        ...style,
      }}
      {...props}
    >
      <line x1="6" y1="6" x2="26" y2="26" strokeWidth={2} />
      <circle cx="6" cy="6" r="4" fill="white" strokeWidth={2} />
      <circle cx="26" cy="26" r="4" fill="white" strokeWidth={2} />
    </svg>
  )
}
