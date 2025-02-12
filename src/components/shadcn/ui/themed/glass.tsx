import { forwardRef, type ForwardedRef } from 'react'

import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'

export const BASE_GLASS_CLS = 'backdrop-blur-md'
export const GLASS_CLS = cn(
  'shadow-glass dark:shadow-dark-glass',
  BASE_GLASS_CLS
)

export const Glass = forwardRef(function Glass(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div ref={ref} className={cn(GLASS_CLS, className)} {...props}>
      {children}
    </div>
  )
})
