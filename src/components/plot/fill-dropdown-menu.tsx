import { type IButtonProps } from '@/themed/v2/button'

import { PaintBucket } from 'lucide-react'
import { ReactNode } from 'react'
import { CenterRow } from '../layout/center-row'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  MenuSeparator,
} from '../shadcn/ui/themed/v2/dropdown-menu'
import { ToolbarIconButton } from '../toolbar/toolbar-icon-button'
import { IColorPickerProps } from './color-picker-popover'
import {
  addStandardDefaultsToColorPickerProps,
  MoreColors,
  StandardColors,
  ThemeColors,
} from './outline-dropdown-menu'

export type IOutlineButtonProps = Omit<IButtonProps, 'font' | 'color'> & {
  colors: IColorPickerProps[]
  align?: 'start' | 'end'
  /**
   * Whether to render as a flat, clickable button, or a simple icon button
   * with no ui effects
   */
  button?: 'flat' | 'simple'
  onCancel?: () => void
  open?: boolean
  onOpenChanged?: (open: boolean) => void
}

export function FillButton({
  colors,
  align = 'start',
  className = '',
  title,
  button = 'flat',
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

  const trigger: ReactNode =
    button === 'flat' ? (
      <DropdownMenuTrigger
        render={
          <ToolbarIconButton title={title}>
            <FillIcon cp={color0} />
          </ToolbarIconButton>
        }
      />
    ) : (
      <DropdownMenuTrigger title={title}>
        <FillIcon cp={color0} />
      </DropdownMenuTrigger>
    )

  return (
    <FillDropdownMenu
      colors={colors}
      align={align}
      className={className}
      {...props}
    >
      {trigger}
    </FillDropdownMenu>
  )
}

export function FillIcon({ cp }: { cp: IColorPickerProps }) {
  return (
    <CenterRow className="flex flex-row items-center justify-center  relative h-6  w-5 grow-0 shrink-0">
      <PaintBucket size={16} strokeWidth={1.5} className="z-10" />

      {(cp.show === undefined || cp.show) && (
        <span
          className="absolute bottom-0 h-1.5 w-full z-0 rounded-xs"
          style={{ backgroundColor: cp.color, opacity: cp.opacity }}
        />
      )}
    </CenterRow>
  )
}

export function FillDropdownMenu({
  colors,
  align = 'start',
  children,
}: IOutlineButtonProps) {
  if (!colors || colors.length === 0) {
    return null
  }

  const color0 = addStandardDefaultsToColorPickerProps(colors[0]!)

  return (
    <DropdownMenu>
      {children}

      <DropdownMenuContent
        align={align}
        //variant="content"
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
            <StandardColors cp={color0} mode="fill" />
            <MenuSeparator />
          </>
        )}

        <MoreColors cp={color0} />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
