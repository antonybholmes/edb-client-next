import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { Button, type IButtonProps } from '@components/shadcn/ui/themed/button'
import { MenuSeparator } from '@components/shadcn/ui/themed/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@components/shadcn/ui/themed/popover'

import { cn } from '@lib/class-names'
import { hexToRgb } from '@lib/color'

import {
  FOCUS_INSET_RING_CLS,
  FOCUS_RING_CLS,
  INPUT_BORDER_CLS,
  XS_ICON_BUTTON_CLS,
} from '@/theme'

import { COLOR_BLACK, COLOR_TRANSPARENT, COLOR_WHITE } from '@/consts'
import { useState } from 'react'
import {
  HexAlphaColorPicker,
  HexColorInput,
  HexColorPicker,
} from 'react-colorful'

const COLOR_INPUT_CLS = cn(
  INPUT_BORDER_CLS,
  FOCUS_INSET_RING_CLS,
  //INPUT_CLS,
  'p-1 w-24 rounded bg-background'
)

export const PRESET_COLORS = [
  COLOR_WHITE,
  '#ff0000',
  '#3cb371',
  '#6495ed',
  '#FFA500',
  '#8a2be2',
  '#0000ff',
  '#FFD700',
  //"#800080",
  '#a9a9a9',
  COLOR_BLACK,
]

// export const SIMPLE_COLOR_EXT_CLS = cn(
//   FOCUS_RING_CLS,
//   ICON_BUTTON_CLS,
//   "rounded-full",
// )

export const BASE_SIMPLE_COLOR_EXT_CLS = cn(XS_ICON_BUTTON_CLS, FOCUS_RING_CLS)

export const SIMPLE_COLOR_EXT_CLS = cn(
  BASE_SIMPLE_COLOR_EXT_CLS,
  'rounded-full'
)

export interface IProps extends IButtonProps {
  color: string
  defaultColor?: string
  tooltip?: string
  autoBorder?: boolean
  defaultBorderColor?: string
  allowNoColor?: boolean
  allowAlpha?: boolean
  keepAlphaChannel?: boolean
  align?: 'start' | 'end'
  onColorChange: (color: string, alpha: number) => void
  onCancel?: () => void
}

export function ColorPickerButton({
  color,
  defaultColor,
  tooltip = 'Change color',
  onColorChange,
  autoBorder = false,
  allowNoColor = false,
  allowAlpha = false,
  // we default to removing the alpha channel from the hex color
  // itself and instead returning it via the alpha parameter. This
  // is because this control is typically used for setting colors
  // that will be used in SVG components and to play nicely, we use
  // colors without the alpha channel and instead use fillOpacity and
  // strokeOpacity to set the color opacity on the svg element.
  keepAlphaChannel = false,
  defaultBorderColor = 'border-foreground/25',
  align = 'start',
  className,
  children,
  ...props
}: IProps) {
  const [open, setOpen] = useState(false)

  function _onColorChange(color: string) {
    const rgba = hexToRgb(color)

    onColorChange?.(keepAlphaChannel ? color : color.slice(0, 7), rgba.a)
  }

  let border = defaultBorderColor

  if (autoBorder) {
    const rgb = hexToRgb(color)
    const s = rgb.r + rgb.g + rgb.b

    //console.log("s", rgb, s, color)

    if (s > 700) {
      border = 'border-foreground/75'
    }
  }

  if (color === COLOR_TRANSPARENT) {
    border = 'border-foreground'
  }

  const button = (
    <PopoverTrigger
      className={cn(
        'relative aspect-square overflow-hidden border',
        border,
        className
      )}
      aria-label={props['aria-label'] ?? tooltip}
      style={{ backgroundColor: color }}
      {...props}
    >
      {children}

      {color === COLOR_TRANSPARENT && (
        <span className="absolute left-0 w-full bg-red-400 h-px top-1/2 -translate-y-1/2 -rotate-45" />
      )}
    </PopoverTrigger>
  )

  // if (tooltip) {
  //   button = <Tooltip content={tooltip}>{button}</Tooltip>
  // }

  //console.log(color)

  return (
    <Popover open={open} onOpenChange={(open) => setOpen(open)}>
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

      {button}

      <PopoverContent
        onEscapeKeyDown={() => setOpen(false)}
        onInteractOutside={() => setOpen(false)}
        align={align}
        className="text-xs flex flex-col p-3 gap-y-3 w-64"
      >
        <BaseCol className="color-picker gap-y-3">
          {allowAlpha ? (
            <HexAlphaColorPicker
              color={color ?? COLOR_BLACK}
              onChange={_onColorChange}
            />
          ) : (
            <HexColorPicker
              color={color ?? COLOR_BLACK}
              onChange={_onColorChange}
            />
          )}

          <VCenterRow className="gap-x-2">
            <span className="shrink-0">RGB{allowAlpha ? 'A' : ''}</span>
            <HexColorInput
              color={color.toUpperCase()}
              alpha={true}
              prefixed={true}
              onChange={_onColorChange}
              className={COLOR_INPUT_CLS}
            />
            Opacity: {(hexToRgb(color).a * 100).toFixed(0)}%
          </VCenterRow>
        </BaseCol>
        <VCenterRow className="gap-x-[3px]">
          {PRESET_COLORS.map((presetColor) => {
            const prgb = hexToRgb(presetColor)
            const ps = prgb.r + prgb.g + prgb.b

            return (
              <button
                key={presetColor}
                className={cn(
                  'w-5 aspect-square border hover:scale-125 focus-visible:scale-125 rounded-sm',
                  [
                    autoBorder && ps > 750,
                    'border-border',
                    'border-transparent hover:border-white',
                  ]
                )}
                style={{ background: presetColor }}
                onClick={() => _onColorChange(presetColor)}
                tabIndex={0}
              />
            )
          })}
        </VCenterRow>

        {(allowNoColor || defaultColor) && <MenuSeparator />}

        {allowNoColor && (
          <Button
            variant="muted"
            className="w-full"
            justify="start"
            pad="sm"
            rounded="md"
            onClick={() => _onColorChange(COLOR_TRANSPARENT)}
          >
            <span className="relative aspect-square w-5 border border-border bg-background rounded-sm">
              <span className="absolute left-0 w-full bg-red-400 h-px top-1/2 -translate-y-1/2 -rotate-45" />
            </span>

            <span>No color</span>
          </Button>
        )}

        {defaultColor && (
          <Button
            variant="muted"
            className="w-full"
            justify="start"
            pad="sm"
            rounded="md"
            onClick={() => _onColorChange(defaultColor)}
          >
            <span
              className="aspect-square w-5 border border-border rounded-sm"
              style={{ backgroundColor: defaultColor }}
            />
            <span>Reset color</span>
          </Button>
        )}
      </PopoverContent>
    </Popover>
  )
}
