import { BaseCol } from '@/layout/base-col'
import { type IButtonProps } from '@/themed/v2/button'

import { addAlphaToHex } from '@/lib/color/color'
import { CircleSlash, Palette, Pencil } from 'lucide-react'
import { useDialogs } from '../dialogs/dialogs'
import { useEdbSettings } from '../edb/edb-settings'
import { CenterRow } from '../layout/center-row'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  MenuSeparator,
} from '../shadcn/ui/themed/v2/dropdown-menu'
import { ToolbarIconButton } from '../toolbar/toolbar-icon-button'

import { ColorButton } from './color-picker-button'
import { IColorPickerProps, PRESET_COLORS } from './color-picker-popover'
import { THEME_COLOR_GRID } from './theme'

export type IOutlineButtonProps = Omit<IButtonProps, 'font' | 'color'> & {
  colors: IColorPickerProps[]
  align?: 'start' | 'end'
  onCancel?: () => void
  open?: boolean
  onOpenChanged?: (open: boolean) => void
}

export function OutlineButton({
  colors,

  align = 'start',
  className = '',
  title,
  'aria-label': ariaLabel,
  children,
  ...props
}: IOutlineButtonProps) {
  if (!colors || colors.length === 0) {
    return null
  }

  // if (!ariaLabel) {
  //   ariaLabel = tooltip
  // }

  if (!ariaLabel) {
    ariaLabel = 'Choose color'
  }

  const color0 = addStandardDefaultsToColorPickerProps(colors[0]!)

  return (
    <OutlineDropdownMenu
      colors={colors}
      align={align}
      className={className}
      {...props}
    >
      <DropdownMenuTrigger
        render={
          <ToolbarIconButton title={title}>
            <OutlineIcon cp={color0} />
          </ToolbarIconButton>
        }
      />
    </OutlineDropdownMenu>
  )
}

function OutlineIcon({ cp }: { cp: IColorPickerProps }) {
  return (
    <CenterRow className="flex flex-row items-center justify-center  relative h-5  w-5 grow-0 shrink-0">
      <Pencil size={16} strokeWidth={1.5} className="z-10 fill-white" />
      <span className="absolute top-0.5 left-0 h-2.5 w-3/5 z-0 border border-foreground rounded-xs" />
      <span
        className="absolute bottom-0 h-1.5 w-full z-0 rounded-xs"
        style={{ backgroundColor: cp.color, opacity: cp.opacity }}
      />
    </CenterRow>
  )
}

/**
 * Set defaults most UI systems will use. This is useful to avoid having to specify these options
 * repeatedly for different plot types. Note defaults assume opacity support so you will need to
 * set allowAlpha to false if your plot type does not support opacity.
 *
 * @param cp
 * @param options
 * @returns
 */
export function addStandardDefaultsToColorPickerProps(
  cp: IColorPickerProps,
  options?: {
    showThemeColors?: boolean
    allowAlpha?: boolean
    allowNoColor?: boolean
    showPresets?: boolean
  }
): IColorPickerProps {
  return {
    showThemeColors: true,
    allowAlpha: true,
    allowNoColor: true,
    showPresets: true,
    ...options,
    ...cp,
  }
}

export function OutlineDropdownMenu({
  colors,
  align = 'start',
  children,
}: IOutlineButtonProps) {
  if (!colors || colors.length === 0) {
    return null
  }

  const color0 = addStandardDefaultsToColorPickerProps(colors[0]!)
  const opacity = color0.opacity ?? 1

  return (
    <DropdownMenu>
      {children}

      <DropdownMenuContent
        align={align}
        variant="content"
        className="flex flex-col"
      >
        {color0.showThemeColors && (
          <>
            <ThemeColors cp={color0} />
            <MenuSeparator />
          </>
        )}

        {color0.showPresets && (
          <>
            <StandardColors cp={color0} mode="outline" />
            <MenuSeparator />
          </>
        )}

        <MoreColors cp={color0} />
        <MenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Weight</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => {
                  color0.onColorChange?.({
                    color: color0.color,
                    opacity,
                    width: 0.5,
                    show: true,
                  })
                }}
              >
                <span>0.5 pt</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  color0.onColorChange?.({
                    color: color0.color,
                    opacity,
                    width: 1,
                    show: true,
                  })
                }}
              >
                <span>1 pt</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  color0.onColorChange?.({
                    color: color0.color,
                    opacity,
                    width: 2,
                    show: true,
                  })
                }}
              >
                <span>2 pt</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Dashes</DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                onClick={() => {
                  color0.onColorChange?.({
                    color: color0.color,
                    opacity,
                    dasharray: '0',
                    show: true,
                  })
                }}
              >
                <span className="w-3/5 h-0.5 bg-foreground" />
                <span>Solid</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  color0.onColorChange?.({
                    color: color0.color,
                    opacity,
                    dasharray: '2',
                    show: true,
                  })
                }}
              >
                <span className="w-3/5 h-0 border-t-2 border-foreground border-dotted" />
                <span>Round Dot</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  color0.onColorChange?.({
                    color: color0.color,
                    opacity,
                    dasharray: '8',
                    show: true,
                  })
                }}
              >
                <span className="w-3/5 h-0 border-t-2 border-foreground border-dashed" />
                <span>Dash</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function ThemeColors({ cp }: { cp: IColorPickerProps }) {
  return (
    <BaseCol className="gap-y-2 mb-2 mx-1.5">
      <span className="text-xs font-semibold">Theme Colors</span>
      <div className="grid grid-cols-10 items-center gap-x-2">
        {THEME_COLOR_GRID.map((group, gi) => (
          <BaseCol key={gi} className="gap-y-1">
            {group.colors.map((presetColor) => {
              return (
                <ColorButton
                  key={presetColor}

                  presetColor={presetColor}
                  onClick={() => {
                    cp.onColorChange?.({
                      color: presetColor,
                      opacity: 1,
                      show: true,
                    })
                  }}
                />
              )
            })}
          </BaseCol>
        ))}
      </div>
    </BaseCol>
  )
}

export function StandardColors({
  cp,
  mode = 'outline',
}: {
  cp: IColorPickerProps
  mode?: 'outline' | 'fill'
}) {
  const { settings } = useEdbSettings()

  return (
    <>
      <BaseCol className="gap-y-2 mb-2 mx-1.5">
        <span className="text-xs font-semibold">Standard Colors</span>
        <div className="grid grid-cols-10 items-center gap-x-2 gap-y-1">
          {PRESET_COLORS.slice(0, 10).map((presetColor, pi) => {
            return (
              <ColorButton
                key={`${presetColor}-${pi}`}

                presetColor={presetColor}
                onClick={() => {
                  cp.onColorChange?.({
                    color: presetColor,
                    opacity: 1,
                    show: true,
                  })
                }}
              />
            )
          })}
        </div>
        {settings.plots.colors.custom.length > 0 && (
          <div className="grid grid-cols-10 items-center gap-x-2 gap-y-1">
            {settings.plots.colors.custom.map((c) => {
              return (
                <ColorButton
                  key={c.id}

                  presetColor={addAlphaToHex(c.color, c.opacity)}

                  onClick={() => {
                    cp.onColorChange?.({
                      color: c.color,
                      opacity: cp.opacity ?? 1,
                      show: true,
                    })
                  }}
                />
              )
            })}
          </div>
        )}
      </BaseCol>

      {/* Optionally allow no color, which can be interpreted as to not show outline/fill. 
      This is useful for some plot types like scatter where users may want to only show markers without outline. */}
      {cp.allowNoColor && (
        <DropdownMenuItem
          onClick={() => {
            cp.onColorChange?.({
              color: cp.color,
              opacity: cp.opacity,
              show: false,
            })
          }}
        >
          <CircleSlash size={20} strokeWidth={1.5} />
          <span>No {mode === 'outline' ? 'Outline' : 'Fill'}</span>
        </DropdownMenuItem>
      )}
    </>
  )
}

export function MoreColors({ cp }: { cp: IColorPickerProps }) {
  const { open: openDialog } = useDialogs()
  const { addCustomColor } = useEdbSettings()

  return (
    <DropdownMenuItem
      onClick={() => {
        openDialog({
          type: 'color',
          payload: {
            cp,

            callback: (color) => {
              addCustomColor(color.color, color.opacity ?? 1)
              cp.onColorChange?.({
                ...color,
                show: true,
              })
            },
          },
        })
      }}
    >
      <Palette size={20} strokeWidth={1.5} />
      <span>More Colors...</span>
    </DropdownMenuItem>
  )
}
