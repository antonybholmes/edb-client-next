import { type ISVGProps } from './svg-props'

export const BASE_ICON_CLS = 'shrink-0 pointer-events-none relative'

export const ICON_CLS = 'shrink-0 aspect-square pointer-events-none relative'

export interface IIconProps extends ISVGProps {
  w?: string
  stroke?: string
  selected?: boolean
  hover?: boolean
}
