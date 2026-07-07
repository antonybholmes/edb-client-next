import { VCenterRow } from '@/layout/v-center-row'

import {
  addAlphaToHex,
  COLOR_BLACK,
  hexToRgba,
  hexColorWithoutAlpha as removeAlphaFromHex,
  rgba2hex,
  type IRGBA,
} from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'

import { FOCUS_RING_CLS } from '@/theme'

import { TEXT_OK } from '@/consts'
import { useEffect, useState } from 'react'
import {
  HexAlphaColorPicker,
  HexColorInput,
  HexColorPicker,
} from 'react-colorful'
import { IModalProps, OKCancelDialog } from '../dialogs/ok-cancel-dialog'
import { BaseRow } from '../layout/base-row'
import { NumericalInput } from '../shadcn/ui/themed/numerical-input'
import { inputVariants } from '../shadcn/ui/themed/v2/input'
import { IColorChangeProps, PRESET_COLORS } from './color-picker-popover'

export const SIMPLE_COLOR_EXT_CLS = cn(
  'w-4.5 h-4.5 aspect-square rounded-sm shrink-0',
  FOCUS_RING_CLS
)

export type IProps = IModalProps<IColorChangeProps> & {
  color: IColorChangeProps
  keepAlphaChannel?: boolean
  showRgb?: boolean
  showPresets?: boolean
}

export function ColorPickerDialog({
  color,
  keepAlphaChannel = false,
  showRgb = false,
  showPresets = true,
  onResponse,
}: IProps) {
  const [_colorWithAlpha, setColorWithAlpha] = useState(
    addAlphaToHex(color.color, color.opacity ?? 1)
  )
  const [_opacity, setOpacity] = useState(color.opacity ?? 1)

  useEffect(() => {
    setColorWithAlpha(addAlphaToHex(color.color, color.opacity ?? 1))
  }, [color.color, color.opacity])

  useEffect(() => {
    setOpacity(color.opacity ?? 1)
  }, [color.opacity])

  const _rgba = hexToRgba(_colorWithAlpha)

  return (
    <OKCancelDialog
      title="Color Picker"

      onResponse={(r) => {
        if (r === TEXT_OK) {
          onResponse?.(r, {
            color: removeAlphaFromHex(_colorWithAlpha),
            opacity: _opacity,
            width: color.width,
            dasharray: color.dasharray,
            show: color.show,
          })
        } else {
          onResponse?.(r, undefined)
        }
      }}
      bodyCls="gap-y-4 color-picker"
    >
      {color.opacity !== undefined ? (
        <HexAlphaColorPicker
          color={_colorWithAlpha}
          onChange={(v) => {
            const opacity = hexToRgba(v)[3]
            setColorWithAlpha(v)
            setOpacity(opacity)
          }}
        />
      ) : (
        <HexColorPicker
          color={color.color}
          onChange={(v) => {
            setColorWithAlpha(v)
          }}
        />
      )}

      <VCenterRow className="gap-x-3 ">
        <VCenterRow className="gap-x-1.5">
          <span>Hex</span>
          <HexColorInput
            id="hex"
            color={_colorWithAlpha?.toUpperCase() ?? COLOR_BLACK}
            alpha={true}
            prefixed={true}
            onChange={(v) => {
              setColorWithAlpha(v)
            }}
            className={inputVariants({
              variant: 'alt',
              className: 'w-24  ',
            })}
          />
        </VCenterRow>

        {color.opacity !== undefined && (
          <VCenterRow className="gap-x-1.5">
            <span>A</span>
            <NumericalInput
              dp={2}
              value={color.opacity}
              className="w-16"
              onNumChanged={(v) => {
                const a = Math.max(0, Math.min(1, v))

                // if keepAlphaChannel is true, we need to reconstruct the color
                // to include the new alpha, otherwise strip the alpha from the color
                setColorWithAlpha(
                  keepAlphaChannel
                    ? addAlphaToHex(_colorWithAlpha, a)
                    : removeAlphaFromHex(_colorWithAlpha)
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
                setColorWithAlpha(rgba2hex(rgba))
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
                setColorWithAlpha(rgba2hex(rgba))
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
                setColorWithAlpha(rgba2hex(rgba))
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
          <BaseRow className="gap-1 flex-wrap">
            {PRESET_COLORS.map((presetColor) => {
              const prgb = hexToRgba(presetColor)
              const ps = prgb[0] + prgb[1] + prgb[2]

              return (
                <button
                  key={presetColor}
                  className={cn(
                    'w-5.5 aspect-square border hover:scale-125 focus-visible:scale-125 rounded-xs transition-transform duration-300',
                    ps >= 750
                      ? 'border-border'
                      : 'border-transparent hover:border-white'
                  )}
                  style={{ background: presetColor }}
                  onClick={() => setColorWithAlpha(presetColor)}
                  tabIndex={0}
                />
              )
            })}
          </BaseRow>
        </VCenterRow>
      )}

      {/* {(allowNoColor || defaultColor) && <MenuSeparator />} */}

      {/* {allowNoColor && (
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
              */}
    </OKCancelDialog>
  )
}
