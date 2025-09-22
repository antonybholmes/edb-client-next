import { COLOR_BLACK, COLOR_RED, COLOR_WHITE } from '@lib/color/color'

export type ColorBarPos = 'bottom' | 'right' | 'upper-right'

export type TopBottomPos = 'top' | 'bottom'
export type LegendPos = 'right' | 'upper-right' | 'bottom'

export interface IColorProps {
  show: boolean
  color: string
  opacity: number
}

export interface ILabelProps extends IColorProps {
  width: number
}

export const DEFAULT_LABEL_PROPS: ILabelProps = {
  show: true,
  width: 100,
  color: COLOR_BLACK,
  opacity: 1,
}

export const DEFAULT_FILL_PROPS: IColorProps = {
  show: true,
  opacity: 0.2,
  color: COLOR_RED,
}

export const OPAQUE_FILL_PROPS: IColorProps = {
  show: true,
  opacity: 1,
  color: COLOR_BLACK,
}

export const WHITE_FILL_PROPS: IColorProps = {
  show: true,
  opacity: 1,
  color: COLOR_WHITE,
}

export const NO_FILL_PROPS: IColorProps = { ...DEFAULT_FILL_PROPS, show: false }

export interface IStrokeProps {
  show: boolean
  width: number
  color: string
  alpha: number
}

export const DEFAULT_STROKE_PROPS: IStrokeProps = {
  show: true,
  width: 1,
  color: COLOR_BLACK,
  alpha: 1,
}

export const NO_STROKE_PROPS: IStrokeProps = {
  ...DEFAULT_STROKE_PROPS,
  show: false,
}

export interface IFontProps {
  //show: boolean
  color: string
  size: string
  opacity: number
}

export const DEFAULT_FONT_PROPS: IFontProps = {
  //show: true,
  color: COLOR_BLACK,
  size: 'small',
  opacity: 1,
}

export interface IMarginProps {
  top: number
  left: number
  bottom: number
  right: number
}

export const DEFAULT_MARGIN: IMarginProps = {
  top: 100,
  left: 100,
  bottom: 100,
  right: 100,
}
