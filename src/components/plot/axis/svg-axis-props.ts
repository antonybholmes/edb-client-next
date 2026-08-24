import {
  DEFAULT_BOLD_TEXT_PROPS,
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  IStrokeProps,
  ITextProps,
} from '../svg-props'

export type AxisType = 'x' | 'y' | 'colorbar'

export interface IAxisLabelProps extends ITextProps {
  offset: number
}

export interface IAxisLineProps extends IStrokeProps {
  size: number
  offset: number
}

export interface IAxisTickProps {
  show: boolean
  labels: IAxisLabelProps
  line: IAxisLineProps
}

export interface IMajorMinorTickProps {
  major: IAxisTickProps
  minor: IAxisTickProps
}

export interface IAxisDisplayProps {
  show: boolean
  title: IAxisLabelProps
  line: IStrokeProps
  ticks: IMajorMinorTickProps
}

export interface IXYAxisDisplayProps {
  x: IAxisDisplayProps
  y: IAxisDisplayProps
  colorbar: IAxisDisplayProps
}

export const DEFAULT_AXIS_LABEL_PROPS: IAxisLabelProps = {
  ...DEFAULT_TEXT_PROPS,
  offset: 4,
}

export const DEFAULT_AXIS_LINE_PROPS: IAxisLineProps = {
  ...DEFAULT_STROKE_PROPS,
  size: 6,
  offset: 1.5,
}

export const DEFAULT_AXIS_TICK_PROPS: IAxisTickProps = {
  show: true,
  labels: { ...DEFAULT_AXIS_LABEL_PROPS },
  line: { ...DEFAULT_AXIS_LINE_PROPS },
}

export const DEFAULT_MINOR_AXIS_TICK_PROPS: IAxisTickProps = {
  ...DEFAULT_AXIS_TICK_PROPS,
  //show: false,
  labels: { ...DEFAULT_AXIS_LABEL_PROPS, show: false },
  line: { ...DEFAULT_AXIS_TICK_PROPS.line, size: 3 },
}

export const DEFAULT_AXIS_DISPLAY_PROPS: IAxisDisplayProps = {
  show: true,
  title: { ...DEFAULT_BOLD_TEXT_PROPS, offset: 30 },
  line: { ...DEFAULT_STROKE_PROPS },
  ticks: {
    major: { ...DEFAULT_AXIS_TICK_PROPS },
    minor: { ...DEFAULT_MINOR_AXIS_TICK_PROPS },
  },
}
