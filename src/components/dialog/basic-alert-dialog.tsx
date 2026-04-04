import {
  OKCancelDialog,
  type IOKCancelDialogProps,
} from '@/dialog/ok-cancel-dialog'

import { config } from '@/config'

export interface IProps extends IOKCancelDialogProps {
  open?: boolean
  title?: string
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
      title={title ?? config.appName}
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
