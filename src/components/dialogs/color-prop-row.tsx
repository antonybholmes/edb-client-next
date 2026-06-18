import { type ReactNode } from 'react'

import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
  type IColorPickerButtonProps,
} from '../plot/color-picker-popover'
import { PropRow } from './prop-row'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

interface IProps extends Omit<IColorPickerButtonProps, 'title'> {
  title: ReactNode

  side?: 'left' | 'right'
}

export function ColorPropRow({ title, side = 'right', ...props }: IProps) {
  return (
    <PropRow title={title} side={side}>
      <ColorPickerButton className={SIMPLE_COLOR_EXT_CLS} {...props} />
    </PropRow>
  )
}
