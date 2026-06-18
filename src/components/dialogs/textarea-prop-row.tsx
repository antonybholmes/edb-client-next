import { type ReactNode } from 'react'

import { VCenterRow } from '../layout/v-center-row'
import { Textarea, type ITextAreaProps } from '../shadcn/ui/themed/textarea'
import { PropRow } from './prop-row'

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
    <PropRow title={title}>
      {children && <VCenterRow className="gap-x-2">{children}</VCenterRow>}

      <Textarea textareaCls={textareaCls} {...props} />
    </PropRow>
  )
}
