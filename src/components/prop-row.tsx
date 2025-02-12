import { forwardRef, type ForwardedRef, type ReactNode } from 'react'

import { H2_CLS } from '@/theme'
import type { IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/class-names'
import { BaseRow } from './layout/base-row'
import { VCenterRow } from './layout/v-center-row'
import { Label } from './shadcn/ui/themed/label'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

interface IProps extends IDivProps {
  title: string
  justify?: string
  items?: string
  labelCls?: string
  leftChildren?: ReactNode
  rightChildren?: ReactNode
}

export const PropRow = forwardRef(function PropRow(
  {
    title,
    labelCls,
    justify = 'justify-between',
    items = 'items-center',
    leftChildren,
    className,
    children,
  }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  return (
    <BaseRow className={cn('gap-x-2 h-9', justify, items, className)} ref={ref}>
      <VCenterRow className="gap-x-2">
        {leftChildren && leftChildren}
        <Label className={labelCls}>{title}</Label>
      </VCenterRow>
      <VCenterRow className="gap-x-2">{children}</VCenterRow>
    </BaseRow>
  )
})
