import { type ReactNode } from 'react'

import { H2_CLS } from '@/theme'
import { cn } from '@lib/shadcn-utils'
import { BaseRow } from '../layout/base-row'
import { VCenterRow } from '../layout/v-center-row'
import { Label } from '../shadcn/ui/themed/label'
import {
  NumericalInput,
  type INumericalInputProps,
} from '../shadcn/ui/themed/numerical-input'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

interface IProps extends INumericalInputProps {
  title: string
  labelClassName?: string
  leftChildren?: ReactNode
  rightChildren?: ReactNode
}

export function NumericalPropRow({
  title = '',
  labelClassName,
  checked = false,

  disabled = false,
  w = 'w-16',
  leftChildren,
  rightChildren,
  className,
  children,
  ...props
}: IProps) {
  return (
    <BaseRow
      className={cn('gap-x-2 justify-between items-center min-h-8', className)}
    >
      <Label className={labelClassName}>{title}</Label>

      {children && <VCenterRow className="gap-x-2">{children}</VCenterRow>}

      <NumericalInput {...props} w={w} className="rounded-theme" />
    </BaseRow>
  )
}
