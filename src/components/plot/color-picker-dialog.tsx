import { VCenterRow } from '@/layout/v-center-row'

import { addAlphaToHex, COLOR_BLACK } from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'

import { FOCUS_RING_CLS } from '@/theme'

import { TEXT_OK } from '@/consts'
import { useEffect, useMemo, useState } from 'react'
import {
  HexAlphaColorPicker,
  HexColorInput,
  HexColorPicker,
} from 'react-colorful'
import tinycolor from 'tinycolor2'
import { IModalProps, OKCancelDialog } from '../dialogs/ok-cancel-dialog'
import { useEdbSettings } from '../edb/edb-settings'
import { BaseCol } from '../layout/base-col'
import { BaseRow } from '../layout/base-row'
import { NumericalInput } from '../shadcn/ui/themed/numerical-input'
import { inputVariants } from '../shadcn/ui/themed/v2/input'
import { ColorButton, ColorIcon } from './color-picker-button'
import {
  IColorChangeProps,
  IColorPickerProps,
  PRESET_COLORS,
} from './color-picker-popover'

export const SIMPLE_COLOR_EXT_CLS = cn(
  'w-4.5 h-4.5 aspect-square rounded-sm shrink-0',
  FOCUS_RING_CLS
)

const DEFAULT_COLOR: tinycolor.Instance = tinycolor(COLOR_BLACK)

export type IProps = IModalProps<IColorChangeProps> & {
  cp: IColorPickerProps
  keepAlphaChannel?: boolean
  showRgb?: boolean
}

export function ColorPickerDialog({
  title = 'Custom Colors',
  cp,
  keepAlphaChannel = false,
  showRgb = true,

  onResponse,
}: IProps) {
  const { settings, addCustomColor } = useEdbSettings()

  const [color, setColor] = useState(DEFAULT_COLOR)
  const [opacity, setOpacity] = useState(1)

  useEffect(() => {
    setColor(tinycolor(cp.color).setAlpha(cp.opacity ?? 1))
  }, [cp.color, cp.opacity])

  useEffect(() => {
    setOpacity(cp.opacity ?? 1)
  }, [cp.opacity])

  const rgba = useMemo(() => color.toRgb(), [color])

  console.log(rgba)

  function handleColorChange(newColor: string, newOpacity: number = 1) {
    setColor(tinycolor(newColor).setAlpha(newOpacity))
    setOpacity(newOpacity)
  }

  return (
    <OKCancelDialog
      title={
        <VCenterRow className="gap-x-2">
          <ColorIcon presetColor={color.toHex8String()} size="w-5" />
          <span>{title}</span>
        </VCenterRow>
      }
      w="w-110"
      onResponse={(r) => {
        if (r === TEXT_OK) {
          addCustomColor(color.toHexString(), opacity)
          onResponse?.(r, {
            color:
              cp.allowAlpha && keepAlphaChannel
                ? color.toHex8String()
                : color.toHexString(),
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
          color={color.toHex8String()}
          onChange={(v) => {
            const newColor = tinycolor(v)
            setColor(newColor)
            setOpacity(newColor.getAlpha())
          }}
          style={{ height: '15rem' }}
        />
      ) : (
        <HexColorPicker
          color={color.toHexString()}
          onChange={(v) => {
            setColor(tinycolor(v))
          }}
          style={{ height: '15rem' }}
        />
      )}

      <VCenterRow className="gap-x-2.5">
        <BaseCol className="gap-0.5">
          <span className="text-xs font-medium">Hex</span>
          <HexColorInput
            id="hex"
            color={color.toHexString() ?? COLOR_BLACK}
            //alpha={true}
            prefixed={true}
            onChange={(v) => {
              setColor(tinycolor(v))
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
                setColor(color.setAlpha(a))
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
                value={rgba.r}
                onNumChange={(v) => {
                  const newRgba = { ...rgba }
                  newRgba.r = v
                  setColor(tinycolor(newRgba))
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
                value={rgba.g}
                onNumChange={(v) => {
                  const newRgba = { ...rgba }
                  newRgba.g = v
                  setColor(tinycolor(newRgba))
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
                value={rgba.b}
                onNumChange={(v) => {
                  const newRgba = { ...rgba }
                  newRgba.b = v
                  setColor(tinycolor(newRgba))
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
      {cp.showPresets && (
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
