import { APP_NAME } from '@/consts'
import {
  OKCancelDialog,
  type IOKCancelDialogProps,
} from '@dialog/ok-cancel-dialog'

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
      title={title ?? APP_NAME}
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
