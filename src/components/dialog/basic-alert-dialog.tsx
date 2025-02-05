import { APP_NAME } from '@/consts'
import {
  OKCancelDialog,
  type IOKCancelDialogProps,
} from '@components/dialog/ok-cancel-dialog'

export interface IProps extends IOKCancelDialogProps {
  open?: boolean
  title?: string
  buttons?: string[]
}

export function BasicAlertDialog({
  open = true,
  title,
  buttons = ['OK'],
  onReponse = () => {},
  bodyCls,
  className,
  children,
  ...props
}: IProps) {
  // useEffect(() => {
  //   console.log(osName)
  // }, [])

  return (
    <OKCancelDialog
      open={open}
      title={title ?? APP_NAME}
      onReponse={onReponse}
      buttons={buttons}
      bodyCls={bodyCls}
      className={className}
      {...props}
    >
      {children}
    </OKCancelDialog>
  )
}
