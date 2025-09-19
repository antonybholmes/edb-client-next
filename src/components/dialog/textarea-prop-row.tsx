import { type ReactNode } from 'react'

import { cn } from '@lib/shadcn-utils'
import { BaseRow } from '../layout/base-row'
import { VCenterRow } from '../layout/v-center-row'
import { Label } from '../shadcn/ui/themed/label'
import { Textarea, type ITextAreaProps } from '../shadcn/ui/themed/textarea'

interface IProps extends ITextAreaProps {
  title: string
  leftChildren?: ReactNode
  rightChildren?: ReactNode
  textareaCls?: string
}

export function TextareaPropRow({
  title = '',
  disabled = false,
  textareaCls,
  children,
  ...props
}: IProps) {
  return (
    <BaseRow className={cn('gap-x-8 justify-between items-center min-h-8')}>
      <Label>{title}</Label>

      {children && <VCenterRow className="gap-x-2">{children}</VCenterRow>}

      <Textarea textareaCls={textareaCls} {...props} />
    </BaseRow>
  )
}
