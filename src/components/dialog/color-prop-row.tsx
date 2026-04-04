import { type ReactNode } from 'react'

import type { IDivProps } from '@/interfaces/div-props'
import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '../color/color-picker-button'
import { PropRow } from './prop-row'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

interface IProps extends Omit<IDivProps, 'title'> {
  title: ReactNode
  color: string
  onColorChange?: (color: string) => void
  side?: 'left' | 'right'
}

export function ColorPropRow({
  color,
  title,
  side = 'right',
  onColorChange,
}: IProps) {
  return (
    <PropRow title={title} side={side}>
      <ColorPickerButton
        color={color}
        onColorChange={v => onColorChange?.(v)}
        className={SIMPLE_COLOR_EXT_CLS}
        //title={title}
      />
    </PropRow>
  )
}
