import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'

interface IProps extends IIconProps {
  showSide?: boolean
}

export function RightSideIcon({
  w = 'w-5',
  showSide = true,
  className,
}: IProps) {
  return (
    <div
      className={cn(
        ICON_CLS,
        'aspect-square rounded-xs border border-foreground',
        [showSide, 'border-r-[5px]'],
        w,
        className
      )}
    />
  )
}
