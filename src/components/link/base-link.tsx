import { BASE_COMPONENT_CLS } from '@/theme'
import { type ILinkProps } from '@interfaces/link-props'

import { cn } from '@lib/class-names'

import { forwardRef, type ForwardedRef } from 'react'

export const UNDERLINE_CLS =
  'data-[underline=true]:underline data-[underline=hover]:hover:underline data-[underline=false]:decoration-transparent'

const LINK_CLS = cn(BASE_COMPONENT_CLS, UNDERLINE_CLS)

export const BLANK_TARGET = '_blank'

export const BaseLink = forwardRef(function BaseLink(
  { href, selected = false, target, className, children, ...props }: ILinkProps,
  ref: ForwardedRef<HTMLAnchorElement>
) {
  if (!props['aria-label']) {
    props['aria-label'] = `Click to visit ${href}`
  }

  // Test if we use the NextJS router link or a regular a for external urls
  const isExt = href.startsWith('http') || href.startsWith('www')

  if (isExt && !target) {
    target = BLANK_TARGET
  }

  return (
    <a
      ref={ref}
      href={href}
      data-selected={selected}
      className={cn(LINK_CLS, className)}
      target={target}
      {...props}
    >
      {children}
    </a>
  )
})
