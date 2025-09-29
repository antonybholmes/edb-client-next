import {
  ICON_CLS,
  ICON_TRANSITION_FROM_CLS,
  ICON_TRANSITION_TO_CLS,
  type IIconProps,
} from '@interfaces/icon-props'
import { cn } from '@lib/shadcn-utils'
import { Cog, Settings } from 'lucide-react'

interface Props extends IIconProps {
  isAnimated?: boolean
}

export function SettingsIcon({
  w = 'w-5 h-5',
  stroke = 'stroke-current',
  isAnimated = true,
  className,
  strokeWidth = 1.5,
  style,
}: Props) {
  return (
    <>
      <Settings
        className={cn(
          ICON_CLS,

          isAnimated && ICON_TRANSITION_FROM_CLS,

          stroke,
          w,
          className
        )}
        strokeWidth={strokeWidth}
        style={style}
        stroke=""
      />

      {isAnimated && (
        <Cog
          className={cn(ICON_CLS, ICON_TRANSITION_TO_CLS, stroke, w, className)}
          strokeWidth={strokeWidth}
          style={style}
          stroke=""
        />
      )}
    </>
  )
}
