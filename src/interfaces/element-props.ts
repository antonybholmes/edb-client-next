import { type HTMLAttributes, type PropsWithoutRef } from 'react'

export interface IElementProps
  extends PropsWithoutRef<HTMLAttributes<HTMLElement>> {
  title?: string
  tooltip?: string
}
