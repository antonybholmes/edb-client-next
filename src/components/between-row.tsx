import { forwardRef, type ForwardedRef } from 'react'

import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'

export const BETWEEN_ROW_CLS =
  'flex flex-row items-center justify-between gap-x-2'

export const BetweenRow = forwardRef(function BetweenRow(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div ref={ref} className={cn(BETWEEN_ROW_CLS, className)} {...props}>
      {children}
    </div>
  )
})
