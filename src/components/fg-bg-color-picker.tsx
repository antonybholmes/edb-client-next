import { COLOR_TRANSPARENT } from '@/consts'
import type { IClassProps } from '@interfaces/class-props'
import { ColorPickerButton } from './color-picker-button'

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
    <div className="shrink-0 relative h-8 w-8.5">
      <div className="absolute bg-background aspect-square w-5 h-5 p-px left-0 top-0 z-10 overflow-hidden rounded-sm">
        <ColorPickerButton
          color={fgColor}
          onColorChange={color => onFgColorChange?.(color)}
          defaultColor={defaultFgColor}
          onCancel={onCancel}
          className="w-full rounded-sm aspect-square"
          allowNoColor={allowNoColor}
        />
      </div>
      <div className="absolute bg-background aspect-square w-5 h-5 p-px left-3 top-2.5 overflow-hidden rounded-sm">
        <ColorPickerButton
          color={bgColor}
          onColorChange={color => onBgColorChange?.(color)}
          defaultColor={defaultBgColor}
          onCancel={onCancel}
          className="w-full aspect-square rounded-sm"
          allowNoColor={allowNoColor}
        />
      </div>
    </div>
  )
}
