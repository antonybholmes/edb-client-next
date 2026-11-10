import { cn } from '@/lib/shadcn-utils'
import type { ComponentProps } from 'react'
import { VCenterRow } from '../layout/v-center-row'
import {
  RadioGroup,
  RadioGroupItem,
} from '../shadcn/ui/themed/baseui/radio-group'
import { H_CLS } from './prop-row'

export function RadioPropRow({
  icon,
  title = '',
  id,
  value,

  disabled = false,
  h = H_CLS,
  children,
}: ComponentProps<typeof RadioGroup> & {
  title: string
  labelClassName?: string
  h?: string
  icon?: React.ReactNode
}) {
  return (
    <VCenterRow className={cn('gap-x-2 justify-between w-full', h)}>
      <RadioGroupItem id={id} value={value} disabled={disabled}>
        {icon && icon}
        {title}
      </RadioGroupItem>

      {children && children}
    </VCenterRow>
  )
}
