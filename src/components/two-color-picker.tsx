import { ICON_BUTTON_CLS } from '@/theme'
import type { IClassProps } from '@interfaces/class-props'
import { COLOR_TRANSPARENT } from '@lib/color/color'
import { cn } from '@lib/shadcn-utils'
import { ColorPickerButton } from './color/color-picker-button'

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
  //console.log(fgColor, bgColor)
  return (
    <div className={cn(ICON_BUTTON_CLS, 'shrink-0 relative')}>
      <div className="absolute bg-background aspect-square w-5 h-5 p-px left-0 top-0 z-10 overflow-hidden rounded-xs">
        <ColorPickerButton
          color={fgColor}
          onColorChange={color => onFgColorChange?.(color)}
          defaultColor={defaultFgColor}
          onCancel={onCancel}
          className="w-full rounded-xs aspect-square"
          allowNoColor={allowNoColor}
        />
      </div>
      <div className="absolute bg-background aspect-square w-5 h-5 p-px left-2.5 top-2.5 overflow-hidden rounded-xs">
        <ColorPickerButton
          color={bgColor}
          onColorChange={color => onBgColorChange?.(color)}
          defaultColor={defaultBgColor}
          onCancel={onCancel}
          className="w-full aspect-square rounded-xs"
          allowNoColor={allowNoColor}
        />
      </div>
    </div>
  )
}
