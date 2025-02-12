import { FOCUS_RING_CLS } from '@/theme'
import { type ILinkProps } from '@interfaces/link-props'
import { cn } from '@lib/class-names'
import { forwardRef, type ForwardedRef } from 'react'
import { BaseLink } from './base-link'

export const BASE_THEME_LINK_CLS = cn(FOCUS_RING_CLS, 'text-theme inline-block')

export const ThemeLink = forwardRef(function ThemeLink(
  { className, children, ...props }: ILinkProps,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  return (
    <BaseLink
      ref={ref}
      className={cn(BASE_THEME_LINK_CLS, className)}
      data-underline={'hover'}
      {...props}
    >
      {children}
    </BaseLink>
  )
})
