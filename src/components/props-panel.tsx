import { forwardRef, type ForwardedRef } from 'react'

import { H2_CLS } from '@/theme'
import type { IDivProps } from '@interfaces/div-props'
import { BaseCol } from '@layout/base-col'
import { cn } from '@lib/shadcn-utils'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

export const PropsPanel = forwardRef(function PropsPanel(
  { className, children, ...props }: IDivProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <BaseCol
      //id={randId('props-panel')}
      ref={ref}
      className={cn('min-h-0 overflow-hidden text-xs grow h-full', className)}
      {...props}
    >
      {children}
    </BaseCol>
  )
})
