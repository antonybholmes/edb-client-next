import { IDim } from '@/interfaces/dim'
import { IPos } from '@/interfaces/pos'
import { COLOR_BLACK, COLOR_WHITE } from '@/lib/color/color'
import { Axis } from './axis'

export const FONT_SIZE_SMALL = 12
export const FONT_SIZE_MEDIUM = 14
export const FONT_SIZE_LARGE = 16

export type ColorBarPos = 'bottom' | 'right' | 'upper-right'

export type TopBottomPos = 'top' | 'bottom'
export type LegendPos = 'right' | 'upper-right' | 'bottom'

export interface IPaintProps {
  show: boolean
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
  rotation?: number
}

export const DEFAULT_TEXT_PROPS: ITextProps = {
  show: true,
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

/**
 * A default dashed line stroke
 */
export const DEFAULT_DASH_PROPS: IStrokeProps = {
  ...DEFAULT_STROKE_PROPS,
  dasharray: '5',
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

interface IAxisLabel extends ITextProps {
  offset: number
}

interface IAxisLineProps extends IStrokeProps {
  size: number
  offset: number
}

interface IAxisTickProps {
  labels: IAxisLabel
  line: IAxisLineProps
}

export interface IAxisDisplayProps {
  title: IAxisLabel
  line: IStrokeProps
  ticks: {
    major: IAxisTickProps
    minor: IAxisTickProps
  }
}

export const DEFAULT_AXIS_LABEL_PROPS: IAxisLabel = {
  ...DEFAULT_TEXT_PROPS,
  offset: 5,
}

export const DEFAULT_AXIS_LINE_PROPS: IAxisLineProps = {
  ...DEFAULT_STROKE_PROPS,
  size: 6,
  offset: 1,
}

export const DEFAULT_AXIS_TICK_PROPS: IAxisTickProps = {
  labels: { ...DEFAULT_AXIS_LABEL_PROPS },
  line: { ...DEFAULT_AXIS_LINE_PROPS },
}

export const DEFAULT_MINOR_AXIS_TICK_PROPS: IAxisTickProps = {
  ...DEFAULT_AXIS_TICK_PROPS,
  labels: { ...DEFAULT_AXIS_LABEL_PROPS, show: false },
  line: { ...DEFAULT_AXIS_TICK_PROPS.line, size: 3 },
}

export const DEFAULT_AXIS_DISPLAY_PROPS: IAxisDisplayProps = {
  title: { ...DEFAULT_BOLD_TEXT_PROPS, offset: 25 },
  line: { ...DEFAULT_STROKE_PROPS },
  ticks: {
    major: { ...DEFAULT_AXIS_TICK_PROPS },
    minor: { ...DEFAULT_MINOR_AXIS_TICK_PROPS },
  },
}

export interface IColorBarProps {
  show: boolean
  stroke: IStrokeProps
  size: IDim
  //axis: IAxisDisplayProps
}

export const DEFAULT_COLORBAR_PROPS: IColorBarProps = {
  show: true,
  stroke: { ...DEFAULT_STROKE_PROPS },
  size: { w: 150, h: 12 },
  //axis: { ...DEFAULT_AXIS_DISPLAY_PROPS },
}

export interface IAxisProps {
  ax: Axis
  pos?: IPos
  font?: ITextProps
  labelFont?: ITextProps
  showTicks?: boolean
  showTickLabels?: boolean
  tickSize?: number
  strokeWidth?: number
  title?: string
  titleOffset?: number
  color?: string
  /**
   * Whether to show the axis line. Default is true.
   */
  showLine?: boolean
}
