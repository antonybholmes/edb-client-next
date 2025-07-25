import type { IClassProps } from '@interfaces/class-props'
import { COLOR_TRANSPARENT } from '@lib/color/color'
import { ColorPickerButton } from './color/color-picker-button'

export interface IProps extends IClassProps {
  color2: string
  color3?: string
  color1?: string
  onColor2Change?: (color: string) => void
  onColor3Change?: (color: string) => void
  onColor1Change?: (color: string) => void

  showColor1?: boolean
  showColor2?: boolean
  showColor3?: boolean

  onShowColor1?: (show: boolean) => void
  onShowColor2?: (show: boolean) => void
  onShowColor3?: (show: boolean) => void

  onCancel?: () => void
  allowNoColor?: boolean

  tooltips?: string[]
}

/**
 * Allow for easy selection of foreground and background colors in a compact component
 * @param param0
 * @returns
 */
export function ThreeColorPicker({
  color2 = COLOR_TRANSPARENT,
  color3 = COLOR_TRANSPARENT,
  color1 = COLOR_TRANSPARENT,
  onColor1Change,
  onColor2Change,
  onColor3Change,

  showColor1 = true,
  showColor2 = true,
  showColor3 = true,

  onShowColor1,
  onShowColor2,
  onShowColor3,

  onCancel = () => {},
  allowNoColor = false,

  tooltips = [],
}: IProps) {
  //console.log(fgColor, bgColor)
  return (
    <div className="h-8 w-10 shrink-0 relative">
      <div className="absolute bg-background aspect-square w-5 h-5 p-px z-20 overflow-hidden rounded-xs">
        <ColorPickerButton
          color={color1}
          onColorChange={color => onColor1Change?.(color)}
          onCancel={onCancel}
          className="w-full aspect-square rounded-xs"
          allowNoColor={allowNoColor}
          showColor={showColor1}
          onShowColor={show => onShowColor1?.(show)}
          title={tooltips.length > 0 ? tooltips[0] : 'Text Color'}
        />
      </div>
      <div className="absolute bg-background aspect-square w-5 h-5 p-px left-2.5 top-1.5 z-10 overflow-hidden rounded-xs">
        <ColorPickerButton
          color={color2}
          onColorChange={color => onColor2Change?.(color)}
          onCancel={onCancel}
          className="w-full rounded-xs aspect-square"
          allowNoColor={allowNoColor}
          showColor={showColor2}
          onShowColor={show => onShowColor2?.(show)}
          title={tooltips.length > 1 ? tooltips[1] : 'Foreground Color'}
        />
      </div>
      <div className="absolute bg-background aspect-square w-5 h-5 p-px left-5 top-3 overflow-hidden rounded-xs">
        <ColorPickerButton
          color={color3}
          onColorChange={color => onColor3Change?.(color)}
          onCancel={onCancel}
          className="w-full aspect-square rounded-xs"
          allowNoColor={allowNoColor}
          showColor={showColor3}
          onShowColor={show => onShowColor3?.(show)}
          title={tooltips.length > 2 ? tooltips[2] : 'Background Color'}
        />
      </div>
    </div>
  )
}
