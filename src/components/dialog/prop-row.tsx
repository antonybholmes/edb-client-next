import { type ReactNode } from 'react'

import { H2_CLS } from '@/theme'
import type { IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'
import { BaseRow } from '../layout/base-row'
import { VCenterRow } from '../layout/v-center-row'
import { Label } from '../shadcn/ui/themed/label'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

interface IProps extends Omit<IDivProps, 'title'> {
  title: ReactNode
  justify?: string
  items?: string
  leftChildren?: ReactNode
  rightChildren?: ReactNode
}

export function PropRow({
  ref,
  title,
  justify = 'justify-between',
  items = 'items-center',
  leftChildren,
  rightChildren,
  className,
  children,
}: IProps) {
  return (
    <BaseRow
      className={cn('gap-x-2 min-h-8', justify, items, className)}
      ref={ref}
    >
      <VCenterRow className="gap-x-2">
        {leftChildren && leftChildren}
        {typeof title === 'string' ? <Label>{title}</Label> : title}
        {rightChildren && rightChildren}
      </VCenterRow>
      <VCenterRow className="gap-x-2">{children}</VCenterRow>
    </BaseRow>
  )
}
