import { forwardRef, type ForwardedRef } from 'react'

import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'

export const BaseGrid = forwardRef(function BaseGrid(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div ref={ref} className={cn('grid', className)} {...props}>
      {children}
    </div>
  )
})
