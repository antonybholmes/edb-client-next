import { BaseCol } from '@/layout/base-col'
import { type IButtonProps } from '@/themed/v2/button'

import { hexToRgba } from '@/lib/color/color'
import { cn } from '@/lib/shadcn-utils'

import { FOCUS_RING_CLS } from '@/theme'

import { CircleSlash, Palette, SquarePen } from 'lucide-react'
import { useDialogs } from '../dialogs/dialogs'
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
import { IColorPickerProps } from './color-picker-popover'
import { THEME_COLOR_GRID } from './theme'

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
  'w-4.5 h-4.5 aspect-square rounded-sm shrink-0',
  FOCUS_RING_CLS
)

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

  // if (tooltip) {
  //   button = <Tooltip content={tooltip}>{button}</Tooltip>
  // }

  return (
    <OutlinePopover
      colors={colors}
      align={align}
      className={className}
      {...props}
    >
      <DropdownMenuTrigger>
        <SquarePen size={20} strokeWidth={1.5} />
      </DropdownMenuTrigger>
    </OutlinePopover>
  )
}

export function OutlinePopover({
  colors,

  align = 'start',
  //open,
  onOpenChanged,

  children,
  ...props
}: IOutlineButtonProps) {
  //const [_open, setOpen] = useState(false)
  //const o = open ?? _open

  const { open: openDialog } = useDialogs()

  if (!colors || colors.length === 0) {
    return null
  }

  // function _openChanged(open: boolean) {
  //  setOpen(open)
  //   onOpenChanged?.(open)
  //}

  // if (tooltip) {
  //   button = <Tooltip content={tooltip}>{button}</Tooltip>
  // }

  const color0 = colors[0]!
  const opacity = color0.opacity ?? 1

  return (
    <DropdownMenu>
      {children}

      <DropdownMenuContent
        //onEscapeKeyDown={() => setOpen(false)}
        //onInteractOutside={() => setOpen(false)}
        align={align}
        //className="text-xs flex flex-col gap-y-3"
        variant="content"
        className="flex flex-col"
      >
        <BaseCol className="gap-y-2 mb-2 mx-1.5">
          <span className="text-xs font-semibold">Theme Colors</span>
          <div className="grid grid-cols-10 items-center gap-x-2">
            {THEME_COLOR_GRID.map((group, gi) => (
              <BaseCol key={gi} className="gap-y-1">
                {group.colors.map((presetColor) => {
                  const prgb = hexToRgba(presetColor)
                  const ps = prgb[0] + prgb[1] + prgb[2]

                  return (
                    <button
                      key={presetColor}
                      className={cn(
                        'w-4.5 rounded-full aspect-square border hover:scale-125 focus-visible:scale-125 transition-transform duration-300',
                        color0.autoBorder && ps >= 750 && 'border-border',
                        !color0.autoBorder ||
                          (ps < 750 && 'border-transparent hover:border-white')
                      )}
                      style={{ background: presetColor }}
                      onClick={() =>
                        color0.onColorChange?.({
                          color: presetColor,
                          opacity,
                        })
                      }
                      tabIndex={0}
                    />
                  )
                })}
              </BaseCol>
            ))}
          </div>
        </BaseCol>

        <MenuSeparator />
        <BaseCol className="gap-y-2 mb-2 mx-1.5">
          <span className="text-xs font-semibold">Standard Colors</span>
          <div className="grid grid-cols-10 items-center gap-x-2 gap-y-1">
            {[...PRESET_COLORS.slice(0, 10), color0.color].map(
              (presetColor, pi) => {
                const prgb = hexToRgba(presetColor)
                const ps = prgb[0] + prgb[1] + prgb[2]

                return (
                  <button
                    key={`${presetColor}-${pi}`}
                    className={cn(
                      'w-4.5 rounded-full aspect-square border hover:scale-125 focus-visible:scale-125 transition-transform duration-300',
                      color0.autoBorder && ps >= 750 && 'border-border',
                      !color0.autoBorder ||
                        (ps < 750 && 'border-transparent hover:border-white')
                    )}
                    style={{ background: presetColor }}
                    onClick={() =>
                      color0.onColorChange?.({
                        color: presetColor,
                        opacity,
                      })
                    }
                    tabIndex={0}
                  />
                )
              }
            )}
          </div>
        </BaseCol>

        <DropdownMenuItem
          onClick={() => {
            color0.onColorChange?.({
              color: color0.color,
              opacity,
              show: false,
            })
          }}
        >
          <CircleSlash size={20} strokeWidth={1.5} />
          <span>No Outline</span>
        </DropdownMenuItem>
        <MenuSeparator />

        <DropdownMenuItem
          onClick={() => {
            openDialog({
              type: 'color',
              payload: {
                color: color0,

                callback: (color) => {
                  color0.onColorChange?.({
                    color: color.color,
                    opacity: color.opacity,
                  })
                },
              },
            })
          }}
        >
          <Palette size={20} strokeWidth={1.5} />
          <span>More Colors...</span>
        </DropdownMenuItem>
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
