import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'

export interface ICheckProps extends IIconProps {
  checked?: boolean
}

export function CheckIcon({
  checked = true,
  w = 'w-4 h-4',
  stroke = 'stroke-foreground',
  style,
  className,
  ...props
}: ICheckProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className={cn(ICON_CLS, stroke, w, className)}
      style={{
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        fill: 'none',
        strokeWidth: 2.5,
        ...style,
      }}
      {...props}
    >
      {checked && <path d="M 4,14 L 10,19 L 21,4" />}
    </svg>
  )
}
