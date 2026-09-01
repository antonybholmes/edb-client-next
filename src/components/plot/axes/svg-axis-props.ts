import { IDBEntity } from '@/interfaces/db-entity'
import { ILim } from '@/lib/math/math'
import {
  DEFAULT_BOLD_TEXT_PROPS,
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  IStrokeProps,
  ITextProps,
} from '../svg-props'

import { TEXT_DEFAULT } from '@/consts'
import { makeUuid } from '@/lib/id'
import { DeepPartial } from '@/lib/utils'
import { deepmerge } from 'deepmerge-ts'

export type TickLabel = string | number

const MINOR_TICK_DIVISIONS = 5

export interface ITickItem {
  v: number
  label?: string | undefined
}

export type WhichTick = 'major' | 'minor'

export type AxisType = 'x' | 'y' | 'z' | 'colorbar'

export interface IAxisLabelProps extends ITextProps {
  offset: number
}

export interface IAxisLineProps extends IStrokeProps {
  size: number
  offset: number
}

export interface IAxisTickStyle {
  line: IAxisLineProps
  labels: IAxisLabelProps
}

export interface ITickParamProps {
  show: boolean
  style: IAxisTickStyle
  which: WhichTick | 'both'
}

export interface IAxisTicks extends IDBEntity {
  show: boolean
  style: IAxisTickStyle
  items?: ITickItem[]
}

export interface IMajorAxisTicks extends IAxisTicks {
  numTicks: number
}

export interface IMinorAxisTicks extends IAxisTicks {
  divisions: number
}

export interface IMajorMinorTicks {
  major: IMajorAxisTicks
  minor: IMinorAxisTicks
}

export interface IAxisConfig extends IDBEntity {
  show: boolean
  clip?: boolean
  domain: ILim
  range: ILim
  style: {
    title: IAxisLabelProps
    line: IStrokeProps
  }
  ticks: IMajorMinorTicks
  direction: 'x' | 'y'
  scale?: 'linear' | 'log'
}

export interface IXYAxisDisplayProps {
  x: IAxisConfig
  y: IAxisConfig
  colorbar: IAxisConfig
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

export const DEFAULT_AXIS_TICK_PROPS: IMajorAxisTicks = {
  id: '01a0588c-3169-752f-a52b-3f356b24f0df',
  name: 'Major Axis Ticks',
  show: true,
  style: {
    labels: { ...DEFAULT_AXIS_LABEL_PROPS },
    line: { ...DEFAULT_AXIS_LINE_PROPS },
  },
  numTicks: 5,
}

export const DEFAULT_MINOR_AXIS_TICK_PROPS: IMinorAxisTicks = {
  ...DEFAULT_AXIS_TICK_PROPS,
  id: '01a0588c-675d-704f-a91f-2f596b6cb4d4',
  name: 'Minor Axis Ticks',
  divisions: 5,
  style: {
    labels: { ...DEFAULT_AXIS_LABEL_PROPS, show: false },
    line: { ...DEFAULT_AXIS_TICK_PROPS.style.line, size: 3 },
  },
}

export const DEFAULT_AXIS_CONFIG: IAxisConfig = {
  id: '01a058c3-e469-728e-9836-193a7704c8b8',
  name: '',
  show: true,
  clip: true,
  domain: [0, 1],
  range: [0, 1],
  style: {
    title: { ...DEFAULT_BOLD_TEXT_PROPS, offset: 30 },
    line: { ...DEFAULT_STROKE_PROPS },
  },
  ticks: {
    major: { ...DEFAULT_AXIS_TICK_PROPS },
    minor: { ...DEFAULT_MINOR_AXIS_TICK_PROPS },
  },
  direction: 'x',
}

export function newAxisConfig(
  config: DeepPartial<IAxisConfig> = {}
): IAxisConfig {
  return deepmerge({ ...DEFAULT_AXIS_CONFIG, id: makeUuid() }, config)
}

export interface IAxisCollection extends IDBEntity {
  x?: IAxisConfig
  y?: IAxisConfig
  z?: IAxisConfig
  colorbar?: IAxisConfig
}

export type AxisRecord = Record<string, IAxisConfig>

export const DEFAULT_AXIS_CONFIG_COLLECTION_ID =
  '01a044ae-c19a-75dd-a8b0-090308912c17'

export const DEFAULT_AXIS_COLLECTION: IAxisCollection = Object.freeze({
  id: DEFAULT_AXIS_CONFIG_COLLECTION_ID,
  name: TEXT_DEFAULT,
})

export type AxesCollection = Record<string, IAxisCollection>

export interface IAxesCollection extends IDBEntity {
  axes: Record<string, IAxisCollection>
}

export const DEFAULT_AXES_COLLECTION_ID = '01a044b2-fb5b-75bd-ac38-d2291aed3ff6'

export const DEFAULT_AXES_COLLECTION: IAxesCollection = Object.freeze({
  id: DEFAULT_AXES_COLLECTION_ID,
  name: TEXT_DEFAULT,
  axes: {},
})

export function createNewAxisConfig(
  axis: DeepPartial<IAxisConfig>
): IAxisConfig {
  return deepmerge(DEFAULT_AXIS_CONFIG, axis) as IAxisConfig
}
