import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'
import { forwardRef, type ForwardedRef } from 'react'
import { BaseRow } from './base-row'

export const HCenterRow = forwardRef(function HCenterRow(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <BaseRow ref={ref} className={cn('justify-center', className)} {...props}>
      {children}
    </BaseRow>
  )
})
