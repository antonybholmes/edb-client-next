import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import { BaseCol } from '@/layout/base-col'
import { VCenterRow } from '@/layout/v-center-row'
import { Button, type IButtonProps } from '@/themed/v2/button'

import {
  addAlphaToHex,
  COLOR_BLACK,
  COLOR_TRANSPARENT,
  hexToRgba,
  removeAlphaFromHex,
  rgba2hex,
  textColorShouldBeDark,
  type IRGBA,
} from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'

import { FOCUS_RING_CLS } from '@/theme'

import type { UndefStr } from '@/lib/text/text'
import { useState } from 'react'
import {
  HexAlphaColorPicker,
  HexColorInput,
  HexColorPicker,
} from 'react-colorful'
import { CheckPropRow } from '../dialogs/check-prop-row'
import { NumericalInput } from '../shadcn/ui/themed/numerical-input'
import { inputVariants } from '../shadcn/ui/themed/v2/input'
import { FontUI } from './font/font-ui'
import { type ITextProps } from './svg-props'

// export const PRESET_COLORS = [
//   COLOR_WHITE,
//   '#ff0000',
//   '#3cb371',
//   '#6495ed',
//   '#FFA500',
//   '#8a2be2',
//   '#0000ff',
//   '#FFD700',
//   //"#800080",
//   '#a9a9a9',
//   COLOR_BLACK,
// ]

// export const PRESET_COLORS = [
//   '#000000', // Black
//   '#FFFFFF', // White
//   '#808080', // Gray
//   '#C0C0C0', // Silver
//   '#FF0000', // Red
//   '#800000', // Maroon
//   '#FFA500', // Orange
//   '#FFFF00', // Yellow
//   //'#808000', // Olive
//   '#00FF00', // Lime
//   '#008000', // Green
//   '#00FFFF', // Cyan / Aqua
//   '#008080', // Teal
//   '#0000FF', // Blue
//   '#000080', // Navy
//   '#FF00FF', // Magenta / Fuchsia
//   '#800080', // Purple
//   '#FFC0CB', // Pink
//   //'#D2691E', // Chocolate / Brown
//   //'#F5F5DC', // Beige
//   //'#A52A2A', // Brown
//   '#87CEEB', // Sky Blue
//   '#FFD700', // Gold
//   '#4B0082', // Indigo
// ]

export const PRESET_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#1E88E5', // blue
  '#009688', // teal
  '#43A047', // green
  '#C0CA33', // lime
  '#FFB300', // amber
  '#FB8C00', // orange
  '#E53935', // red
  '#D81B60', // pink
  '#8E24AA', // purple
  '#3949AB', // indigo
  '#607D8B', // gray
  '#263238', // charcoal
  '#00B8D4', // bright cyan
  '#FF6D00', // vivid orange
  '#AD1457', // deep magenta
  '#6D4C41', // brown
  '#2E7D32', // forest green
  '#FDD835', // golden yellow
  //'#3F51B5', // denim blue
  //'#00897B', // emerald teal
]

// export const SIMPLE_COLOR_EXT_CLS = cn(
//   FOCUS_RING_CLS,
//   ICON_BUTTON_CLS,
//   "rounded-full",
// )

//export const BASE_SIMPLE_COLOR_EXT_CLS = cn(XS_ICON_BUTTON_CLS, FOCUS_RING_CLS)

export const SIMPLE_COLOR_EXT_CLS = cn(
  'w-4.5 h-4.5 aspect-square rounded-full shrink-0',
  FOCUS_RING_CLS
)

export interface IColorChangeProps {
  /**
   * The selected color in hexadecimal format (e.g., #RRGGBB or #RRGGBBAA). You
   * can leave the alpha channel in the hex color if you want, but it will typically
   * be stripped out and returned via the separate opacity parameter.
   * This is because this control is typically used for setting colors
   * that will be used in SVG components and to play nicely, we use colors
   * without the alpha channel and instead use fillOpacity and strokeOpacity to set
   * the color opacity on the svg element.
   */
  color: string

  /**
   * The opacity of the color, represented as a number between 0 and 1,
   * where 0 is fully transparent and 1 is fully opaque.
   * This parameter is especially relevant when the color includes an alpha channel
   * or when the color picker allows users to adjust the opacity of the selected color.
   * By providing the opacity as a separate parameter, it allows for more flexible handling of
   * colors in the application, such as applying the opacity to SVG elements
   * or CSS styles without needing to parse the alpha channel from the hex color string.
   */
  opacity?: number | undefined
  width?: number
  dasharray?: string
  show?: boolean
}

export interface IColorPickerProps extends IColorChangeProps {
  title?: UndefStr

  defaultColor?: UndefStr
  autoBorder?: boolean | undefined
  defaultBorderColor?: UndefStr

  /**
   * Whether to allow user to select "no color" option, which typically sets the color to
   * transparent or doesn't render the element at all. When using this option,
   * it's important to ensure that your UI properly indicates when an element has no color,
   * as this can sometimes be confused with a very light color or transparency.
   */
  allowNoColor?: boolean | undefined

  /**
   * Whether to show theme colors in the color picker. Theme colors are 6x10 grid
   * of colors similar to those in MS Office.
   */
  showThemeColors?: boolean | undefined

  /**
   * Whether to show the preset colors in the color picker.
   * These are typically shown below the main color picker UI and allow users to quickly select from a set of
   * commonly used colors.
   */
  showPresets?: boolean | undefined

  /**
   * Whether to allow user to select a color with an alpha channel (i.e. semi-transparency).
   * When this option is enabled, the color picker will typically provide a way for users to
   * adjust the opacity of the color, and the onColorChange callback will receive the selected color
   * with its alpha channel intact.
   */
  allowAlpha?: boolean

  /**
   * Whether to keep the alpha channel in the hex color returned by onColorChange.
   * By default, the alpha channel is removed from the hex color and instead returned via the opacity parameter.
   * This is because this control is typically used for setting colors that will be used in SVG components
   * and to play nicely, we use colors without the alpha channel and instead use fillOpacity and strokeOpacity
   * to set the color opacity on the svg element. However, if keepAlphaChannel is true,
   * the onColorChange callback will receive the full hex color with the alpha channel included.
   */
  keepAlphaChannel?: boolean | undefined
  showColor?: boolean
  showRgb?: boolean | undefined
  font?: ITextProps | undefined

  onColorChange?: ((props: IColorChangeProps) => void) | undefined

  onShowColor?: ((show: boolean) => void) | undefined

  fontUpdate?: ((props: ITextProps) => void) | undefined
}

export type IColorPickerButtonProps = Omit<IButtonProps, 'font' | 'color'> & {
  colors: IColorPickerProps[]
  align?: 'start' | 'end'
  onCancel?: () => void
  open?: boolean
  onOpenChanged?: (open: boolean) => void
}

export function ColorPickerButton({
  colors,

  align = 'start',
  className = '',
  title,
  'aria-label': ariaLabel,
  children,
  ...props
}: IColorPickerButtonProps) {
  if (!colors || colors.length === 0) {
    return null
  }

  const color = colors[0]!

  const lightMode = textColorShouldBeDark(color.color)

  // ensure alpha is maintained
  const _color = color.keepAlphaChannel
    ? color.color
    : addAlphaToHex(color.color, color.opacity ?? 1)

  const border =
    (color.autoBorder && lightMode) || _color === COLOR_TRANSPARENT
      ? 'border-border'
      : (color.defaultBorderColor ?? 'border-foreground')

  const textColor = lightMode
    ? 'text-foreground stroke-foreground'
    : 'text-background stroke-background'

  // if (!ariaLabel) {
  //   ariaLabel = tooltip
  // }

  if (!ariaLabel) {
    ariaLabel = 'Choose color'
  }

  // if (tooltip) {
  //   button = <Tooltip content={tooltip}>{button}</Tooltip>
  // }

  return (
    <ColorPickerPopover
      colors={colors}
      align={align}
      className={className}
      {...props}
    >
      <PopoverTrigger
        className={cn(
          'relative overflow-hidden border flex flex-row items-center justify-center bg-background',
          textColor,
          border,
          className
        )}
        aria-label={ariaLabel}
        title={title}
        style={{ backgroundColor: _color }}
      >
        {_color === COLOR_TRANSPARENT && (
          <span className="absolute left-0 w-full bg-red-400 h-px top-1/2 -translate-y-1/2 -rotate-45" />
        )}
      </PopoverTrigger>

      {/* <PopoverTrigger
        className={cn(
          'relative overflow-hidden flex flex-row items-center justify-center',
          textColor,

          className
        )}
        aria-label={ariaLabel}
        title={title}
      >
        <Palette
          size={20}
          fill={_color}
          className="stroke-foreground"
          strokeWidth={1}
        />
        {_color === COLOR_TRANSPARENT && (
          <span className="absolute left-0 w-full bg-red-400 h-px top-1/2 -translate-y-1/2 -rotate-45" />
        )}
      </PopoverTrigger> */}
    </ColorPickerPopover>
  )
}

export function ColorPickerPopover({
  colors,

  align = 'start',
  open,
  onOpenChanged,

  children,
  ...props
}: IColorPickerButtonProps) {
  const [_open, setOpen] = useState(false)
  const o = open ?? _open

  if (!colors || colors.length === 0) {
    return null
  }
  //const [_show, setShow] = useState(showColor)

  // function _onColorChange(color: string) {
  //   const rgba = hexToRgba(color)

  //   onColorChange?.(keepAlphaChannel ? color : color.slice(0, 7), rgba[3])
  // }

  function _openChanged(open: boolean) {
    setOpen(open)
    onOpenChanged?.(open)
  }

  // if (tooltip) {
  //   button = <Tooltip content={tooltip}>{button}</Tooltip>
  // }

  return (
    <Popover open={o} onOpenChange={(v) => _openChanged(v)}>
      {children}

      <PopoverContent
        //onEscapeKeyDown={() => setOpen(false)}
        //onInteractOutside={() => setOpen(false)}
        align={align}
        //className="text-xs flex flex-col gap-y-3"
        variant="content"
        className="flex flex-row gap-x-4"
      >
        {colors.map((color, ci) => (
          <ColorPickerUI
            key={ci}
            title={color.title}
            color={color.color}
            opacity={color.opacity}
            defaultColor={color.defaultColor}
            //onColorChange={_onColorChange}
            width={color.width}
            //onWidthChange={onWidthChange}
            keepAlphaChannel={color.keepAlphaChannel}
            onColorChange={color.onColorChange}
            onShowColor={color.onShowColor}
            fontUpdate={color.fontUpdate}
            {...props}
          />
        ))}
      </PopoverContent>
    </Popover>
  )
}

export function ColorPickerUI({
  title,
  color,
  opacity,
  defaultColor,
  onColorChange,
  autoBorder = true,
  allowNoColor = false,
  showPresets = true,
  showColor = true,
  showRgb = false,
  onShowColor,
  width,

  font,
  fontUpdate,

  // we default to removing the alpha channel from the hex color
  // itself and instead returning it via the alpha parameter. This
  // is because this control is typically used for setting colors
  // that will be used in SVG components and to play nicely, we use
  // colors without the alpha channel and instead use fillOpacity and
  // strokeOpacity to set the color opacity on the svg element.
  keepAlphaChannel = false,
}: IColorPickerProps) {
  const _width = width ?? 1
  const _opacity = opacity ?? 1

  const [_show, setShow] = useState(showColor)

  const _colorWithAlpha = addAlphaToHex(color, _opacity)

  const _rgba = hexToRgba(_colorWithAlpha)

  function _onColorChange(
    color: string,
    opacity: number = 1,
    width: number = 1,
    dasharray: string = '0'
  ) {
    color = addAlphaToHex(color, opacity)

    const rgba = hexToRgba(color)

    onColorChange?.({
      color: keepAlphaChannel ? color : removeAlphaFromHex(color),
      opacity: rgba[3],
      width,
      dasharray,
    })
  }

  return (
    <BaseCol className="color-picker gap-y-2">
      {title && <span className="text-xs font-bold">{title}</span>}
      {font && (
        <FontUI
          title=""
          textProps={font}
          update={fontUpdate}
          showColor={false}
        />
      )}

      {opacity !== undefined ? (
        <HexAlphaColorPicker
          color={_colorWithAlpha ?? COLOR_BLACK}
          onChange={(v) => {
            const a = hexToRgba(v)[3]

            _onColorChange(v, a, width ?? 1)
          }}
        />
      ) : (
        <HexColorPicker
          color={color ?? COLOR_BLACK}
          onChange={_onColorChange}
        />
      )}

      <VCenterRow className="gap-x-3 ">
        <VCenterRow className="gap-x-1.5">
          <span>Hex</span>
          <HexColorInput
            id="hex"
            color={color?.toUpperCase() ?? COLOR_BLACK}
            alpha={true}
            prefixed={true}
            onChange={_onColorChange}
            className={inputVariants({
              variant: 'alt',
              className: 'w-20 h-9',
            })}
          />
        </VCenterRow>

        {opacity !== undefined && (
          <VCenterRow className="gap-x-1.5">
            <span>A</span>
            <NumericalInput
              dp={2}
              value={opacity}
              className="w-16"
              onNumChanged={(v) => {
                const a = Math.max(0, Math.min(1, v))

                // if keepAlphaChannel is true, we need to reconstruct the color
                // to include the new alpha, otherwise strip the alpha from the color
                _onColorChange(
                  keepAlphaChannel
                    ? addAlphaToHex(color, a)
                    : removeAlphaFromHex(color),
                  a,
                  _width
                )
              }}
              limit={[0, 1]}
              step={0.1}
              variant="alt"
            />
          </VCenterRow>
        )}
      </VCenterRow>
      {showRgb && (
        <VCenterRow className="gap-x-3">
          <VCenterRow className="gap-x-1.5">
            <span>R</span>
            <NumericalInput
              value={_rgba[0]}
              onNumChange={(v) => {
                const rgba: IRGBA = [..._rgba]
                rgba[0] = v
                _onColorChange(rgba2hex(rgba), rgba[3], _width)
              }}
              min={0}
              max={255}
              step={1}
              variant="alt"
              className="w-14"
            />
          </VCenterRow>
          <VCenterRow className="gap-x-1.5">
            <span>G</span>
            <NumericalInput
              value={_rgba[1]}
              onNumChange={(v) => {
                const rgba: IRGBA = [..._rgba]
                rgba[1] = v
                _onColorChange(rgba2hex(rgba), rgba[3], _width)
              }}
              min={0}
              max={255}
              step={1}
              variant="alt"
              className="w-14"
            />
          </VCenterRow>
          <VCenterRow className="gap-x-1.5">
            <span>B</span>
            <NumericalInput
              value={_rgba[2]}
              onNumChange={(v) => {
                const rgba: IRGBA = [..._rgba]
                rgba[2] = v
                _onColorChange(rgba2hex(rgba), rgba[3], _width)
              }}
              min={0}
              max={255}
              step={1}
              variant="alt"
              className="w-14"
            />
          </VCenterRow>
        </VCenterRow>
      )}

      {showPresets && (
        <VCenterRow className="gap-x-2">
          <div className="grid grid-cols-10 gap-1 items-center justify-center">
            {PRESET_COLORS.map((presetColor) => {
              const prgb = hexToRgba(presetColor)
              const ps = prgb[0] + prgb[1] + prgb[2]

              return (
                <button
                  key={presetColor}
                  className={cn(
                    'w-5.5 aspect-square border hover:scale-125 focus-visible:scale-125 rounded-xs transition-transform duration-300',
                    autoBorder && ps >= 750 && 'border-border',
                    !autoBorder ||
                      (ps < 750 && 'border-transparent hover:border-white')
                  )}
                  style={{ background: presetColor }}
                  onClick={() => _onColorChange(presetColor, _opacity, _width)}
                  tabIndex={0}
                />
              )
            })}
          </div>
        </VCenterRow>
      )}

      {/* {(allowNoColor || defaultColor) && <MenuSeparator />} */}

      {allowNoColor && (
        <Button
          variant="flat"
          className="w-full"
          justify="start"
          rounded="md"
          onClick={() => _onColorChange(COLOR_TRANSPARENT)}
        >
          <span className="relative aspect-square w-5 border border-border bg-background rounded-xs">
            <span className="absolute left-0 w-full bg-red-400 h-px top-1/2 -translate-y-1/2 -rotate-45" />
          </span>

          <span>No color</span>
        </Button>
      )}

      {width !== undefined && (
        <VCenterRow className="gap-x-2">
          <span className="w-10">Width</span>
          <NumericalInput
            value={width}
            onNumChange={(v) => _onColorChange(color, _opacity, v)}
            min={0}
            step={1}
            max={1000}
            placeholder="Width"
          />
        </VCenterRow>
      )}

      {onShowColor && (
        <CheckPropRow
          title="Show"
          checked={_show}
          onCheckedChange={(v) => {
            setShow(v)
            onShowColor?.(v)
          }}
        />
      )}

      {defaultColor && (
        <Button
          variant="flat"
          className="w-full"
          justify="start"
          rounded="md"
          onClick={() => _onColorChange(defaultColor)}
        >
          <span
            className="aspect-square w-5 border border-border rounded-xs"
            style={{ backgroundColor: defaultColor }}
          />
          <span>Reset color</span>
        </Button>
      )}
    </BaseCol>
  )
}
