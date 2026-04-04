import { cn } from '@/lib/shadcn-utils'
import type { ComponentProps } from 'react'
import { VCenterRow } from '../layout/v-center-row'
import { RadioGroup, RadioGroupItem } from '../shadcn/ui/themed/v2/radio-group'
import { H_CLS } from './prop-row'

export function RadioPropRow({
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
}) {
  return (
    <VCenterRow className={cn('gap-x-2 justify-between w-full', h)}>
      <RadioGroupItem
        id={id}
        value={value}
        disabled={disabled}
        data-enabled={!disabled}
      >
        {title}
      </RadioGroupItem>

      {children && children}
    </VCenterRow>
  )
}
