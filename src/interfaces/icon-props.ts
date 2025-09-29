import { type ISVGProps } from './svg-props'

export const BASE_ICON_CLS = 'shrink-0 pointer-events-none relative'

export const ICON_CLS = 'shrink-0 aspect-square pointer-events-none relative'

export const ICON_TRANSITION_FROM_CLS = `group-hover:opacity-0 group-focus-visible:opacity-0 
  group-hover:scale-70 group-focus-visible:scale-70
  group-data-[checked=true]:opacity-0 group-data-[checked=true]:scale-70
  transition-all duration-400 ease-out`

export const ICON_TRANSITION_TO_CLS = `absolute opacity-0 scale-70 
  group-focus-visible:opacity-100 group-focus-visible:scale-100
  group-hover:opacity-100 group-hover:scale-100
  group-data-[checked=true]:opacity-100 group-data-[checked=true]:scale-100
  left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
  transition-all duration-400 ease-out`

export interface IIconProps extends ISVGProps {
  w?: string | number
  stroke?: string
  accentStroke?: string
  accentFill?: string
  selected?: boolean
  hover?: boolean
  iconMode?: 'default' | 'colorful' | 'bw'
}
