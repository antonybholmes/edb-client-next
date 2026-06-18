import { COLOR_BLACK, COLOR_WHITE } from '@/lib/color/color'

export const FONT_SIZE_SMALL = 12
export const FONT_SIZE_MEDIUM = 14
export const FONT_SIZE_LARGE = 16

export type ColorBarPos = 'bottom' | 'right' | 'upper-right'

export type TopBottomPos = 'top' | 'bottom'
export type LegendPos = 'right' | 'upper-right' | 'bottom'

export interface IPaintProps {
  show?: boolean | undefined
  value: string
  opacity: number
}

export const DEFAULT_COLOR_PROPS: IPaintProps = {
  show: true,
  opacity: 1,
  value: COLOR_BLACK,
}

export const DEFAULT_FILL_PROPS: IPaintProps = {
  ...DEFAULT_COLOR_PROPS,
  opacity: 0.2,
}

//

export const WHITE_FILL_PROPS: IPaintProps = {
  show: true,
  opacity: 1,
  value: COLOR_WHITE,
}

export interface IFontProps {
  //show: boolean
  fill: IPaintProps
  fontSize: number // | 'x-small' | 'small' | 'medium' | 'large'

  fontWeight: number | 'normal' | 'bold'
  fontStyle: 'normal' | 'italic'
  fontFamily: string
  decoration: 'none' | 'underline'
  textAnchor: 'start' | 'middle' | 'end'
}

export const DEFAULT_FONT_PROPS: IFontProps = {
  //show: true,
  fill: { ...DEFAULT_COLOR_PROPS },
  fontSize: FONT_SIZE_SMALL,

  fontWeight: 'normal',
  fontStyle: 'normal',
  decoration: 'none',
  textAnchor: 'start',
  fontFamily: 'Arial',
}

export const DEFAULT_BOLD_FONT_PROPS: IFontProps = {
  ...DEFAULT_FONT_PROPS,
  fontWeight: 'bold',
}

export const DEFAULT_MEDIUM_FONT_PROPS: IFontProps = {
  ...DEFAULT_FONT_PROPS,
  fontWeight: 500,
}

export interface ITextProps {
  show: boolean
  //text: string
  font: IFontProps
}

export const DEFAULT_TEXT_PROPS: ITextProps = {
  show: true,
  //text: '',
  font: { ...DEFAULT_FONT_PROPS },
}

export const DEFAULT_CENTERD_FONT_PROPS: IFontProps = {
  ...DEFAULT_FONT_PROPS,
  textAnchor: 'middle',
}

export const DEFAULT_CENTERED_TEXT_PROPS: ITextProps = {
  ...DEFAULT_TEXT_PROPS,
  font: { ...DEFAULT_CENTERD_FONT_PROPS },
}

export const DEFAULT_BOLD_TEXT_PROPS: ITextProps = {
  ...DEFAULT_TEXT_PROPS,
  font: { ...DEFAULT_BOLD_FONT_PROPS },
}

export const DEFAULT_MEDIUM_TEXT_PROPS: ITextProps = {
  ...DEFAULT_TEXT_PROPS,
  font: { ...DEFAULT_MEDIUM_FONT_PROPS },
}

export interface ILabelProps extends ITextProps {
  width: number
}

export const DEFAULT_LABEL_PROPS: ILabelProps = {
  ...DEFAULT_TEXT_PROPS,
  width: 100,
}

export const NO_FILL_PROPS: IPaintProps = {
  ...DEFAULT_COLOR_PROPS,
  show: false,
  value: 'none',
}

export interface IStrokeProps extends IPaintProps {
  width: number
  dasharray: string
}

export const DEFAULT_STROKE_PROPS: IStrokeProps = {
  ...DEFAULT_COLOR_PROPS,
  width: 1,
  dasharray: '0',
}

export const NO_STROKE_PROPS: IStrokeProps = {
  ...DEFAULT_STROKE_PROPS,
  show: false,
}

export const SMALL_FONT_PROPS: IFontProps = {
  ...DEFAULT_FONT_PROPS,
  fontSize: FONT_SIZE_SMALL,
}
export const MEDIUM_FONT_PROPS: IFontProps = {
  ...DEFAULT_FONT_PROPS,
  fontSize: FONT_SIZE_MEDIUM,
}
export const LARGE_FONT_PROPS: IFontProps = {
  ...DEFAULT_FONT_PROPS,
  fontSize: FONT_SIZE_LARGE,
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
