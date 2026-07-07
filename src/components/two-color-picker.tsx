import type { IClassProps } from '@/interfaces/class-props'
import { COLOR_TRANSPARENT } from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'
import { ICON_BUTTON_CLS } from '@/theme'
import { ColorPickerButton } from './plot/color-picker-popover'

export interface IProps extends IClassProps {
  fgColor: string
  bgColor?: string
  onFgColorChange?: (color: string) => void
  onBgColorChange?: (color: string) => void
  defaultFgColor?: string
  defaultBgColor?: string
  onCancel?: () => void
  allowNoColor?: boolean
}

/**
 * Allow for easy selection of foreground and background colors in a compact component
 * @param param0
 * @returns
 */
export function FgBgColorPicker({
  fgColor = COLOR_TRANSPARENT,
  bgColor = COLOR_TRANSPARENT,
  onFgColorChange,
  onBgColorChange,
  defaultFgColor = COLOR_TRANSPARENT,
  defaultBgColor = COLOR_TRANSPARENT,
  onCancel = () => {},
  allowNoColor = false,
}: IProps) {
  return (
    <div className={cn(ICON_BUTTON_CLS, 'shrink-0 relative')}>
      <div className="absolute bg-background aspect-square w-5 h-5 p-px left-0 top-0 z-10 overflow-hidden rounded-xs">
        <ColorPickerButton
          colors={[
            {
              color: fgColor,
              defaultColor: defaultFgColor,
              keepAlphaChannel: true,
              onColorChange: ({ color }) => onFgColorChange?.(color),
              allowNoColor: allowNoColor,
            },
          ]}
          onCancel={onCancel}
          className="w-full rounded-xs aspect-square"
        />
      </div>
      <div className="absolute bg-background aspect-square w-5 h-5 p-px left-2.5 top-2.5 overflow-hidden rounded-xs">
        <ColorPickerButton
          colors={[
            {
              color: bgColor,
              defaultColor: defaultBgColor,
              keepAlphaChannel: true,
              onColorChange: ({ color }) => onBgColorChange?.(color),
              allowNoColor: allowNoColor,
            },
          ]}
          onCancel={onCancel}
          className="w-full aspect-square rounded-xs"
        />
      </div>
    </div>
  )
}
