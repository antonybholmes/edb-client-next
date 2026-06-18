import { type ReactNode } from 'react'

import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'
import type { VariantProps } from 'class-variance-authority'
import { VCenterRow } from '../layout/v-center-row'
import { Input, type IInputProps } from '../shadcn/ui/themed/v2/input'
import { labelVariants, PropRow } from './prop-row'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

interface IProps
  extends IInputProps, Omit<VariantProps<typeof labelVariants>, 'h'> {
  title: string
  leftChildren?: ReactNode
  rightChildren?: ReactNode
}

export function TextPropRow({
  title = '',
  checked = false,
  disabled = false,

  labelW,
  children,
  ...props
}: IProps) {
  return (
    <PropRow title={title} labelW={labelW} gap="lg">
      {children && <VCenterRow className="gap-x-4">{children}</VCenterRow>}

      <Input {...props} />
    </PropRow>
  )
}
