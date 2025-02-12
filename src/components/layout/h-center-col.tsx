import { type IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'

import { forwardRef, type ForwardedRef } from 'react'
import { BaseCol } from './base-col'

export const HCenterCol = forwardRef(function HCenterCol(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <BaseCol ref={ref} className={cn('items-center', className)} {...props}>
      {children}
    </BaseCol>
  )
})
