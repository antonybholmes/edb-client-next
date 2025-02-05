import { type AnchorHTMLAttributes, type PropsWithoutRef } from 'react'

export interface ILinkProps
  extends PropsWithoutRef<AnchorHTMLAttributes<HTMLAnchorElement>> {
  href: string
  'aria-label': string
  selected?: boolean
}
