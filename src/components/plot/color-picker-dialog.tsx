import { VCenterRow } from '@/layout/v-center-row'

import {
  addAlphaToHex,
  COLOR_BLACK,
  hexToRgba,
  removeAlphaFromHex,
  rgba2hex,
  type IRGBA,
} from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'

import { FOCUS_RING_CLS } from '@/theme'

import { TEXT_OK } from '@/consts'
import { ComponentProps, useEffect, useMemo, useState } from 'react'
import {
  HexAlphaColorPicker,
  HexColorInput,
  HexColorPicker,
} from 'react-colorful'
import { IModalProps, OKCancelDialog } from '../dialogs/ok-cancel-dialog'
import { useEdbSettings } from '../edb/edb-settings'
import { BaseCol } from '../layout/base-col'
import { BaseRow } from '../layout/base-row'
import { NumericalInput } from '../shadcn/ui/themed/numerical-input'
import { inputVariants } from '../shadcn/ui/themed/v2/input'
import {
  IColorChangeProps,
  IColorPickerProps,
  PRESET_COLORS,
} from './color-picker-popover'

export const SIMPLE_COLOR_EXT_CLS = cn(
  'w-4.5 h-4.5 aspect-square rounded-sm shrink-0',
  FOCUS_RING_CLS
)

export type IProps = IModalProps<IColorChangeProps> & {
  cp: IColorPickerProps
  keepAlphaChannel?: boolean
  showRgb?: boolean
  showPresets?: boolean
}

export function ColorPickerDialog({
  title = 'Custom Colors',
  cp,
  keepAlphaChannel = false,
  showRgb = true,
  showPresets = true,
  onResponse,
}: IProps) {
  const { settings, addCustomColor } = useEdbSettings()

  const [color, setColor] = useState(COLOR_BLACK)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    setColor(removeAlphaFromHex(cp.color))
  }, [cp.color])

  useEffect(() => {
    setOpacity(cp.opacity ?? 1)
  }, [cp.opacity])

  const colorWithAlpha = useMemo(
    () => addAlphaToHex(color, opacity),
    [color, opacity]
  )

  const rgba = useMemo(() => hexToRgba(color), [color])

  function handleColorChange(newColor: string, newOpacity: number = 1) {
    setColor(newColor)
    setOpacity(newOpacity)
  }

  return (
    <OKCancelDialog
      title={
        <VCenterRow className="gap-x-2">
          <span
            className="border border-border h-6 w-6 rounded-full"
            style={{ background: colorWithAlpha }}
          />
          <span>{title}</span>
        </VCenterRow>
      }
      w="w-110"
      onResponse={(r) => {
        if (r === TEXT_OK) {
          addCustomColor(color, opacity)
          onResponse?.(r, {
            color: cp.allowAlpha && keepAlphaChannel ? colorWithAlpha : color,
            opacity: opacity,
            width: cp.width,
            dasharray: cp.dasharray,
            show: true,
          })
        } else {
          onResponse?.(r, undefined)
        }
      }}
      bodyCls="gap-y-4 color-picker"
    >
      {cp.allowAlpha ? (
        <HexAlphaColorPicker
          color={colorWithAlpha}
          onChange={(v) => {
            const opacity = hexToRgba(v)[3]
            setColor(removeAlphaFromHex(v))
            setOpacity(opacity)
          }}
        />
      ) : (
        <HexColorPicker
          color={color}
          onChange={(v) => {
            setColor(removeAlphaFromHex(v))
          }}
        />
      )}

      <VCenterRow className="gap-x-2.5">
        <BaseCol className="gap-0.5">
          <span className="text-xs font-medium">Hex</span>
          <HexColorInput
            id="hex"
            color={color?.toUpperCase() ?? COLOR_BLACK}
            //alpha={true}
            prefixed={true}
            onChange={(v) => {
              setColor(v)
            }}
            className={inputVariants({
              variant: 'alt',
              className: 'w-20',
            })}
          />
        </BaseCol>

        {cp.allowAlpha && (
          <BaseCol className="gap-0.5">
            <span className="text-xs font-medium">Alpha</span>
            <NumericalInput
              dp={2}
              value={opacity}
              w="xs"
              onNumChanged={(v) => {
                const a = Math.max(0, Math.min(1, v))

                // if keepAlphaChannel is true, we need to reconstruct the color
                // to include the new alpha, otherwise strip the alpha from the color
                setOpacity(a)
              }}
              limit={[0, 1]}
              step={0.1}
              variant="alt"
            />
          </BaseCol>
        )}

        {showRgb && (
          <>
            <BaseCol className="gap-0.5">
              <span className="text-xs font-medium">Red</span>
              <NumericalInput
                value={rgba[0]}
                onNumChange={(v) => {
                  const newRgba: IRGBA = [...rgba]
                  newRgba[0] = v
                  setColor(rgba2hex(newRgba))
                }}
                min={0}
                max={255}
                step={1}
                variant="alt"
                w="xxs"
              />
            </BaseCol>
            <BaseCol className="gap-0.5">
              <span className="text-xs font-medium">Green</span>
              <NumericalInput
                value={rgba[1]}
                onNumChange={(v) => {
                  const newRgba: IRGBA = [...rgba]
                  newRgba[1] = v
                  setColor(rgba2hex(newRgba))
                }}
                min={0}
                max={255}
                step={1}
                variant="alt"
                w="xxs"
              />
            </BaseCol>
            <BaseCol className="gap-0.5">
              <span className="text-xs font-medium">Blue</span>
              <NumericalInput
                value={rgba[2]}
                onNumChange={(v) => {
                  const newRgba: IRGBA = [...rgba]
                  newRgba[2] = v
                  setColor(rgba2hex(newRgba))
                }}
                min={0}
                max={255}
                step={1}
                variant="alt"
                w="xxs"
              />
            </BaseCol>
          </>
        )}
      </VCenterRow>
      {showPresets && (
        <>
          <BaseRow className="gap-1 flex-wrap">
            {PRESET_COLORS.map((presetColor) => {
              return (
                <ColorButton
                  key={presetColor}
                  presetColor={presetColor}
                  onClick={() => handleColorChange(presetColor)}
                />
              )
            })}
          </BaseRow>

          <BaseRow className="gap-1 flex-wrap">
            {settings.plots.colors.custom.map((c) => {
              return (
                <ColorButton
                  key={c.id}
                  presetColor={addAlphaToHex(c.color, c.opacity)}

                  onClick={() => handleColorChange(c.color, c.opacity ?? 1)}
                />
              )
            })}
          </BaseRow>
        </>
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

export function ColorButton({
  size = 'w-5',
  presetColor,
  ...props
}: ComponentProps<'button'> & {
  presetColor: string
  size?: string
}) {
  const prgb = hexToRgba(presetColor)
  const ps = prgb[0] + prgb[1] + prgb[2]

  return (
    <button
      className={cn(
        'rounded-full aspect-square border hover:scale-125 focus-visible:scale-125 transition-transform duration-300',
        size,
        ps >= 750 ? 'border-border' : 'border-transparent hover:border-white'
      )}
      style={{ background: presetColor }}
      {...props}
    />
  )
}
