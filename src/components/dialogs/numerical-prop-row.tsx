import { type ReactNode } from 'react'

import { cn } from '@/lib/shadcn-utils'
import { H2_CLS } from '@/theme'
import {
  NumericalInput,
  type INumericalInputProps,
} from '../shadcn/ui/themed/numerical-input'
import { PropRow } from './prop-row'

export const PROPS_TITLE_CLS = cn(H2_CLS, 'py-2')

interface IProps extends INumericalInputProps {
  title: string
  labelClassName?: string
  leftChildren?: ReactNode
  rightChildren?: ReactNode
  breakpoint?: number
}

export function NumericalPropRow({
  title = '',
  labelClassName,

  breakpoint = 200,

  children,
  className,
  ...props
}: IProps) {
  //const id = useStableId('text-prop-row')

  return (
    <PropRow title={title}>
      <NumericalInput className={cn('rounded-theme', className)} {...props} />
    </PropRow>
  )
}
