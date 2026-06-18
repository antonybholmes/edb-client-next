import {
  OKCancelDialog,
  type IOKCancelDialogProps,
} from '@/dialogs/ok-cancel-dialog'

import { config } from '@/config'
import type { UndefStr } from '@/lib/text/text'

export interface IProps extends IOKCancelDialogProps {
  open?: boolean
  title?: UndefStr
  buttons?: string[]
}

export function BasicAlertDialog({
  open = true,
  title,
  buttons = ['OK'],
  onResponse = () => {},
  bodyCls,
  className,
  children,
  ...props
}: IProps) {
  return (
    <OKCancelDialog
      open={open}
      title={title ?? config.name}
      onResponse={onResponse}
      buttons={buttons}
      bodyCls={bodyCls}
      className={className}
      {...props}
    >
      {children}
    </OKCancelDialog>
  )
}
