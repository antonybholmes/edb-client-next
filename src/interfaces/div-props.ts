import { type ComponentProps } from 'react'

export interface IDivProps extends ComponentProps<'div'> {
  selected?: boolean
  //title?: string
  tooltip?: string
}
