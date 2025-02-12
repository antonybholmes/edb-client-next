import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'
import { forwardRef, type ForwardedRef } from 'react'

export const ROW_CLS = 'flex flex-row min-w-0 min-h-0'

export const BaseRow = forwardRef(function BaseRow(
  { selected, className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <div
      ref={ref}
      className={cn(ROW_CLS, className)}
      data-selected={selected}
      {...props}
    >
      {children}
    </div>
  )
})
