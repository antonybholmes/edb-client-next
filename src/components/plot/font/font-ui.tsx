import { FontColorIcon } from '@/components/icons/font-color-icon'
import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  ColorPickerPopover,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import type { IFontProps, ITextProps } from '@/components/plot/svg-props'
import { PopoverTrigger } from '@/components/shadcn/ui/themed/v2/popover'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ToolbarIconButton } from '@/components/toolbar/toolbar-icon-button'
import { TEXT_SHOW } from '@/consts'
import type { UndefStr } from '@/lib/text/text'
import { produce } from 'immer'
import {
  AArrowDown,
  AArrowUp,
  Bold,
  Italic,
  TextAlignCenter,
  TextAlignEnd,
  TextAlignStart,
  Underline,
} from 'lucide-react'
import { SwitchPropRow } from '../../dialogs/switch-prop-row'
import { Switch } from '../../shadcn/ui/themed/v2/switch'
import {
  GroupToggle,
  ToggleGroup,
} from '../../shadcn/ui/themed/v2/toggle-group'
import { ToolbarSeparator } from '../../toolbar/toolbar-separator'
import { FONTS } from '../svg-base'

const FONT_SIZES = [
  //{ label: '8', value: 8 },
  // { label: '9', value: 9 },
  { label: '10', value: 10 },
  // { label: '11', value: 11 },
  { label: '12', value: 12 },
  { label: '14', value: 14 },
  { label: '16', value: 16 },
  { label: '18', value: 18 },
  { label: '20', value: 20 },
  { label: '24', value: 24 },
  { label: '28', value: 28 },
  { label: '32', value: 32 },
  { label: '36', value: 36 },
  { label: '48', value: 48 },
  { label: '72', value: 72 },
]

// Extracted alignment toggles
function FontAlignToggles({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <>
      <ToolbarSeparator />
      <ToggleGroup
        value={[value]}
        onValueChange={v => onChange(v[0]!)}
        size="toolbar"
        aspect="icon"
      >
        <GroupToggle value="start" title="Align Left" aria-label="Align Left">
          <TextAlignStart size={16} strokeWidth={1.5} />
        </GroupToggle>
        <GroupToggle
          value="middle"
          title="Align Center"
          aria-label="Align Center"
        >
          <TextAlignCenter size={16} strokeWidth={1.5} />
        </GroupToggle>
        <GroupToggle value="end" title="Align Right" aria-label="Align Right">
          <TextAlignEnd size={16} strokeWidth={1.5} />
        </GroupToggle>
      </ToggleGroup>
    </>
  )
}
// Extracted font family select
function FontFamilySelect({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  return (
    <SelectList value={value} onValueChange={v => onChange(v as string)} w="md">
      {FONTS.map(font => (
        <SelectItem key={font.label} value={font.label}>
          {font.label}
        </SelectItem>
      ))}
    </SelectList>
  )
}

// Extracted font size select
function FontSizeSelect({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const idx = Math.max(
    0,
    FONT_SIZES.findIndex(s => s.value === value)
  )
  return (
    <VCenterRow className="gap-x-1">
      <SelectList
        w="xxxs"
        value={value}
        onValueChange={v => {
          let val = v
          if (!isNaN(Number(val))) val = Number(val)
          onChange(val as number)
        }}
      >
        {FONT_SIZES.map(size => (
          <SelectItem key={size.value} value={size.value}>
            {size.label}
          </SelectItem>
        ))}
      </SelectList>
      <VCenterRow>
        <ToolbarIconButton
          title="Grow Font"
          onClick={() =>
            onChange(
              idx < FONT_SIZES.length - 1 ? FONT_SIZES[idx + 1]!.value : value
            )
          }
        >
          <AArrowUp size={18} strokeWidth={1.5} />
        </ToolbarIconButton>
        <ToolbarIconButton
          title="Shrink Font"
          onClick={() => onChange(idx > 0 ? FONT_SIZES[idx - 1]!.value : value)}
        >
          <AArrowDown size={18} strokeWidth={1.5} />
        </ToolbarIconButton>
      </VCenterRow>
    </VCenterRow>
  )
}

// Extracted style toggle buttons for clarity and reuse
function FontStyleToggles({
  font,
  update,
  showColor,
}: {
  font: IFontProps
  update?: (font: IFontProps) => void
  showColor?: boolean
}) {
  return (
    <VCenterRow>
      <ToolbarIconButton
        checked={font.fontWeight === 'bold' || font.fontWeight === 700}
        title="Bold"
        onClick={() =>
          update?.({
            ...font,
            fontWeight: font.fontWeight === 'bold' ? 'normal' : 'bold',
          })
        }
      >
        <Bold size={16} />
      </ToolbarIconButton>
      <ToolbarIconButton
        checked={font.fontStyle === 'italic'}
        title="Italic"
        onClick={() =>
          update?.({
            ...font,
            fontStyle: font.fontStyle === 'italic' ? 'normal' : 'italic',
          })
        }
      >
        <Italic size={16} />
      </ToolbarIconButton>
      <ToolbarIconButton
        checked={font.decoration === 'underline'}
        title="Underline"
        onClick={() =>
          update?.({
            ...font,
            decoration: font.decoration === 'underline' ? 'none' : 'underline',
          })
        }
      >
        <Underline size={16} />
      </ToolbarIconButton>
      {showColor && (
        <ColorPickerPopover
          colors={[
            {
              color: font.fill.value,
              onColorChange: color =>
                update?.({ ...font, fill: { ...font.fill, value: color } }),
            },
          ]}
          className={SIMPLE_COLOR_EXT_CLS}
        >
          <PopoverTrigger
            render={
              <ToolbarIconButton title="Font Color">
                <FontColorIcon color={font.fill.value} />
              </ToolbarIconButton>
            }
          />
        </ColorPickerPopover>
      )}
    </VCenterRow>
  )
}

interface FontUIProps {
  title?: UndefStr
  textProps: ITextProps
  update?: ((textProps: ITextProps) => void) | undefined
  showEnabled?: boolean
  showColor?: boolean
  showAlign?: boolean
  showFontFamily?: boolean
  showFontSize?: boolean
  showStyle?: boolean
  view?: 'compact' | 'multi-line'
}

export function FontUI({
  title,
  textProps,
  update,
  showEnabled = true,
  showFontFamily = true,
  showFontSize = true,
  showStyle = true,
  showColor = true,
  showAlign = true,
  view = 'multi-line',
}: FontUIProps) {
  //let titleNode: ReactNode | null = null

  if (view === 'multi-line' && showEnabled && !title) {
    title = TEXT_SHOW
  }

  // if (showEnabled) {
  //   if (view === 'multi-line' && title) {
  //     titleNode = (
  //       <SwitchPropRow
  //         title={title}
  //         checked={textProps.show}
  //         onCheckedChange={state => update?.({ ...textProps, show: state })}
  //         className="font-bold"
  //       />
  //     )
  //   } else {
  //     titleNode = (
  //       <Switch
  //         checked={textProps.show}
  //         onCheckedChange={state => update?.({ ...textProps, show: state })}
  //         className="font-bold"
  //       />
  //     )
  //   }
  // } else {
  //   titleNode = <PropRow title={title} className="font-bold" />
  // }

  const fontFamilyNode = (
    <VCenterRow className="gap-x-1">
      {showFontFamily && (
        <FontFamilySelect
          value={textProps.font.fontFamily}
          onChange={v =>
            update?.(
              produce(textProps, draft => {
                draft.font.fontFamily = v as IFontProps['fontFamily']
              })
            )
          }
        />
      )}

      {showFontSize && (
        <FontSizeSelect
          value={textProps.font.fontSize}
          onChange={v =>
            update?.(
              produce(textProps, draft => {
                draft.font.fontSize = v as IFontProps['fontSize']
              })
            )
          }
        />
      )}
    </VCenterRow>
  )

  return (
    <BaseCol className="gap-y-1">
      {view === 'multi-line' && showEnabled && (
        <SwitchPropRow
          title={title}
          checked={textProps.show}
          onCheckedChange={state => update?.({ ...textProps, show: state })}
          className="font-bold"
        />
      )}

      {view === 'multi-line' && title && !showEnabled && (
        <span className="font-bold">{title}</span>
      )}

      {view === 'multi-line' && (
        <VCenterRow className="gap-x-1.5 justify-between">
          {fontFamilyNode}
          {/* {showEnabled && (
            <Switch
              checked={textProps.show}
              onCheckedChange={state => update?.({ ...textProps, show: state })}
              className="font-bold"
            />
          )} */}
        </VCenterRow>
      )}

      <VCenterRow className="gap-x-1">
        {view === 'compact' && fontFamilyNode}

        {showStyle && (
          <FontStyleToggles
            font={textProps.font}
            update={font =>
              update?.(
                produce(textProps, draft => {
                  draft.font = font
                })
              )
            }
            showColor={showColor}
          />
        )}

        {showAlign && (
          <FontAlignToggles
            value={textProps.font.textAnchor}
            onChange={v =>
              update?.(
                produce(textProps, draft => {
                  draft.font.textAnchor = v as IFontProps['textAnchor']
                })
              )
            }
          />
        )}

        {view === 'compact' && showEnabled && (
          <Switch
            checked={textProps.show}
            onCheckedChange={state => update?.({ ...textProps, show: state })}
            className="font-bold"
          />
        )}
      </VCenterRow>
    </BaseCol>
  )
}
