import { ICON_CLS, type IIconProps } from '@interfaces/icon-props'
import { cn } from '@lib/class-names'
import { Settings2 } from 'lucide-react'

export function SettingsIcon({
  w = 'w-5 h-5',
  stroke = 'stroke-foreground',
  className,
  strokeWidth = 1.5,
  style,
}: IIconProps) {
  return (
    <Settings2
      className={cn(ICON_CLS, stroke, w, className)}
      strokeWidth={strokeWidth}
      style={style}
      stroke=""
    />
  )
}
