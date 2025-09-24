import { BaseCol } from '@layout/base-col'
import { VCenterRow } from '@layout/v-center-row'
import { Button, type IButtonProps } from '@themed/button'
import { Popover, PopoverContent, PopoverTrigger } from '@themed/popover'

import {
  addAlphaToHex,
  addAlphaToHexIfNotPresent,
  COLOR_BLACK,
  COLOR_TRANSPARENT,
  hexToRgba,
  hexColorWithoutAlpha as removeAlphaFromHex,
  textColorShouldBeDark,
} from '@lib/color/color'
import { cn } from '@lib/shadcn-utils'

import { FOCUS_RING_CLS } from '@/theme'

import { useState } from 'react'
import {
  HexAlphaColorPicker,
  HexColorInput,
  HexColorPicker,
} from 'react-colorful'
import { PropRow } from '../dialog/prop-row'
import { SwitchPropRow } from '../dialog/switch-prop-row'
import { inputVariants } from '../shadcn/ui/themed/input'
import { NumericalInput } from '../shadcn/ui/themed/numerical-input'

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

export const PRESET_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#808080', // Gray
  '#C0C0C0', // Silver
  '#FF0000', // Red
  '#800000', // Maroon
  '#FFA500', // Orange
  '#FFFF00', // Yellow
  '#808000', // Olive
  '#00FF00', // Lime
  '#008000', // Green
  '#00FFFF', // Cyan / Aqua
  '#008080', // Teal
  '#0000FF', // Blue
  '#000080', // Navy
  '#FF00FF', // Magenta / Fuchsia
  '#800080', // Purple
  '#FFC0CB', // Pink
  '#D2691E', // Chocolate / Brown
  '#F5F5DC', // Beige
  '#A52A2A', // Brown
  '#87CEEB', // Sky Blue
  '#FFD700', // Gold
  '#4B0082', // Indigo
]

// export const SIMPLE_COLOR_EXT_CLS = cn(
//   FOCUS_RING_CLS,
//   ICON_BUTTON_CLS,
//   "rounded-full",
// )

//export const BASE_SIMPLE_COLOR_EXT_CLS = cn(XS_ICON_BUTTON_CLS, FOCUS_RING_CLS)

export const SIMPLE_COLOR_EXT_CLS = cn('w-5 h-5 rounded-full', FOCUS_RING_CLS)

export interface IProps extends IButtonProps {
  color: string
  opacity?: number
  defaultColor?: string | undefined
  autoBorder?: boolean
  defaultBorderColor?: string
  allowNoColor?: boolean | undefined

  allowAlpha?: boolean
  keepAlphaChannel?: boolean
  align?: 'start' | 'end'
  onColorChange?: (color: string, opacity: number) => void
  onCancel?: () => void
  open?: boolean
  onOpenChanged?: (open: boolean) => void
  width?: number
  onWidthChange?: ((width: number) => void) | undefined
  showColor?: boolean | undefined
  onShowColor?: ((show: boolean) => void) | undefined
}

export function ColorPickerButton({
  color,
  opacity = 1,
  defaultColor,
  tooltip = 'Change color',
  autoBorder = true,
  allowNoColor = false,
  allowAlpha = false,
  showColor = false,

  // we default to removing the alpha channel from the hex color
  // itself and instead returning it via the alpha parameter. This
  // is because this control is typically used for setting colors
  // that will be used in SVG components and to play nicely, we use
  // colors without the alpha channel and instead use fillOpacity and
  // strokeOpacity to set the color opacity on the svg element.
  keepAlphaChannel = false,
  defaultBorderColor = 'border-transparent',
  align = 'start',
  className,
  title,
  'aria-label': ariaLabel,
  children,
  ...props
}: IProps) {
  const lightMode = textColorShouldBeDark(color)

  // ensure alpha is maintained
  const _color = keepAlphaChannel ? color : addAlphaToHex(color, opacity)

  const border =
    (autoBorder && lightMode) || _color === COLOR_TRANSPARENT
      ? 'border-border'
      : defaultBorderColor

  const textColor = lightMode ? 'text-black' : 'text-white'

  //console.log('color', color, lightMode, textColor)

  // if (tooltip) {
  //   button = <Tooltip content={tooltip}>{button}</Tooltip>
  // }

  return (
    <ColorPickerPopover
      color={color}
      opacity={opacity}
      defaultColor={defaultColor}
      tooltip={tooltip}
      autoBorder={autoBorder}
      allowNoColor={allowNoColor}
      allowAlpha={allowAlpha}
      showColor={showColor}
      keepAlphaChannel={keepAlphaChannel}
      defaultBorderColor={defaultBorderColor}
      align={align}
      className={className}
      {...props}
    >
      <PopoverTrigger
        className={cn(
          'relative overflow-hidden border',
          textColor,
          border,
          className
        )}
        aria-label={ariaLabel}
        title={title}
        style={{ backgroundColor: _color }}
      >
        {children}

        {_color === COLOR_TRANSPARENT && (
          <span className="absolute left-0 w-full bg-red-400 h-px top-1/2 -translate-y-1/2 -rotate-45" />
        )}
      </PopoverTrigger>
    </ColorPickerPopover>
  )
}

export function ColorPickerPopover({
  color,
  defaultColor,

  width = 1,
  onWidthChange,
  // we default to removing the alpha channel from the hex color
  // itself and instead returning it via the alpha parameter. This
  // is because this control is typically used for setting colors
  // that will be used in SVG components and to play nicely, we use
  // colors without the alpha channel and instead use fillOpacity and
  // strokeOpacity to set the color opacity on the svg element.
  keepAlphaChannel = false,

  align = 'start',
  open,
  onOpenChanged,

  children,
  ...props
}: IProps) {
  const [_open, setOpen] = useState(false)

  //const [_show, setShow] = useState(showColor)

  // function _onColorChange(color: string) {
  //   const rgba = hexToRgba(color)

  //   onColorChange?.(keepAlphaChannel ? color : color.slice(0, 7), rgba[3])
  // }

  function _openChanged(open: boolean) {
    setOpen(open)
    onOpenChanged?.(open)
  }

  const o = open ?? _open

  // if (tooltip) {
  //   button = <Tooltip content={tooltip}>{button}</Tooltip>
  // }

  //console.log(color)

  return (
    <Popover open={o} onOpenChange={(open) => _openChanged(open)}>
      {/* <Tooltip content={tooltip}>
      <DropdownMenuTrigger
        className={cn(
          "relative aspect-square overflow-hidden",
          [autoBorder && s > 750, "border border-border"],
          className,
        )}
        aria-label={ariaLabel ?? tooltip}
        style={{ backgroundColor: color }}
      /></Tooltip> */}

      {children}

      <PopoverContent
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={() => setOpen(false)}
        align={align}
        className="text-xs flex flex-col gap-y-3 w-64"
        variant="content"
      >
        <ColorPickerUI
          color={color ?? COLOR_BLACK}
          defaultColor={defaultColor}
          //onColorChange={_onColorChange}
          width={width}
          onWidthChange={onWidthChange}
          keepAlphaChannel={keepAlphaChannel}
          {...props}
        />
      </PopoverContent>
    </Popover>
  )
}

export function ColorPickerUI({
  color,
  opacity: alpha = 1,
  defaultColor,
  onColorChange,
  autoBorder = true,
  allowNoColor = false,
  allowAlpha = false,
  showColor = true,
  onShowColor,

  width = 1,
  onWidthChange,
  // we default to removing the alpha channel from the hex color
  // itself and instead returning it via the alpha parameter. This
  // is because this control is typically used for setting colors
  // that will be used in SVG components and to play nicely, we use
  // colors without the alpha channel and instead use fillOpacity and
  // strokeOpacity to set the color opacity on the svg element.
  keepAlphaChannel = false,
}: IProps) {
  const [_show, setShow] = useState(showColor)

  const _colorWithAlpha = keepAlphaChannel
    ? addAlphaToHexIfNotPresent(color, alpha)
    : addAlphaToHex(color, alpha)

  // if keepAlphaChannel is true, we use the alpha from the color
  // otherwise we use the alpha prop. Since the color has been reconstructed
  // to ensure it has the alpha channel, we can just extract it from there and
  // it will be either from the color itself or the param depending on the user
  // options.
  alpha = hexToRgba(_colorWithAlpha)[3]

  //console.log('ColorPickerUI', color, alpha, keepAlphaChannel, _colorWithAlpha)

  const _color = keepAlphaChannel ? _colorWithAlpha : removeAlphaFromHex(color)

  function _onColorChange(color: string) {
    const rgba = hexToRgba(color)

    console.log(color, rgba, keepAlphaChannel, rgba[3], onColorChange)

    onColorChange?.(
      keepAlphaChannel ? color : removeAlphaFromHex(color),
      rgba[3]
    )

    // onColorChange?.(
    //   keepAlphaChannel
    //     ? addAlphaToHex(color, alpha)
    //     : removeAlphaFromHex(color),
    //   alpha
    // )
  }

  // if (tooltip) {
  //   button = <Tooltip content={tooltip}>{button}</Tooltip>
  // }

  //console.log(_color, keepAlphaChannel)

  return (
    <>
      <BaseCol className="color-picker gap-y-3">
        {allowAlpha ? (
          <HexAlphaColorPicker
            color={_colorWithAlpha ?? COLOR_BLACK}
            onChange={_onColorChange}
          />
        ) : (
          <HexColorPicker
            color={_color ?? COLOR_BLACK}
            onChange={_onColorChange}
          />
        )}

        <VCenterRow className="gap-x-4">
          <VCenterRow className="gap-x-2">
            <span>Hex</span>
            <HexColorInput
              id="hex"
              color={_color.toUpperCase()}
              alpha={true}
              prefixed={true}
              onChange={_onColorChange}
              className={inputVariants({
                variant: 'alt',
                className: 'w-20',
              })}
            />
          </VCenterRow>

          {allowAlpha && (
            <VCenterRow className="gap-x-2">
              <span>A</span>
              <NumericalInput
                dp={2}
                value={alpha}
                className="w-16"
                onNumChanged={(v) => {
                  const a = Math.max(0, Math.min(1, v))

                  // if keepAlphaChannel is true, we need to reconstruct the color
                  // to include the new alpha, otherwise strip the alpha from the color
                  onColorChange?.(
                    keepAlphaChannel
                      ? addAlphaToHex(_color, a)
                      : removeAlphaFromHex(_color),
                    a
                  )
                }}
                limit={[0, 1]}
                step={0.1}
                variant="alt"
              />
            </VCenterRow>
          )}
        </VCenterRow>
      </BaseCol>
      <VCenterRow className="gap-1 flex-wrap">
        {PRESET_COLORS.map((presetColor) => {
          const prgb = hexToRgba(presetColor)
          const ps = prgb[0] + prgb[1] + prgb[2]

          return (
            <button
              key={presetColor}
              className={cn(
                'w-5.5 aspect-square border hover:scale-125 focus-visible:scale-125 rounded-full transition-transform duration-300',
                autoBorder && ps >= 750 && 'border-border',
                !autoBorder ||
                  (ps < 750 && 'border-transparent hover:border-white')
              )}
              style={{ background: presetColor }}
              onClick={() => _onColorChange(presetColor)}
              tabIndex={0}
            />
          )
        })}
      </VCenterRow>

      {/* {(allowNoColor || defaultColor) && <MenuSeparator />} */}

      {allowNoColor && (
        <Button
          variant="muted"
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

      {onShowColor && (
        <SwitchPropRow
          title="Show"
          checked={_show}
          onCheckedChange={(v) => {
            setShow(v)
            onShowColor?.(v)
          }}
        />
      )}

      {onWidthChange && (
        <PropRow title="Width">
          <NumericalInput
            value={width}
            onNumChange={(v) => onWidthChange?.(v)}
            min={0}
            step={1}
            max={1000}
            placeholder="Width"
          />
        </PropRow>
      )}

      {defaultColor && (
        <Button
          variant="muted"
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
    </>
  )
}
