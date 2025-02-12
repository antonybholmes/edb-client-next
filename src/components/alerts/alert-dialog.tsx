import { VCenterRow } from '@/components/layout/v-center-row'
import { TEXT_OK } from '@/consts'
import {
  OKCancelDialog,
  type IModalProps,
} from '@components/dialog/ok-cancel-dialog'
import { InfoIcon } from '@components/icons/info-icon'
import { WarningIcon } from '@components/icons/warning-icon'

import { type IAlert } from '@components/alerts/alerts-provider'

import { useEffect, useState, type ReactElement } from 'react'

export interface IAlertDialogProps extends IModalProps {
  alert: IAlert
}

export function AlertDialog({
  alert,
  onOpenChange = () => {},
}: IAlertDialogProps) {
  // const [passwords, passwordDispatch] = useReducer(passwordReducer, {
  //   password: "",
  //   password1: "",
  //   password2: "",
  // })

  //const { password, password1, password2 } = passwords

  const [show, setShow] = useState(true)
  //const [account, accountDispatch] = useContext(AccountContext)

  useEffect(() => {
    setShow(true)
  }, [alert])

  let icon: ReactElement = (
    <InfoIcon w="w-10" fill="stroke-emerald-500 fill-emerald-500" />
  )
  let mainVariant: string = 'theme'

  switch (alert.type) {
    case 'error':
      icon = <WarningIcon w="w-10" />
      mainVariant = 'destructive'
      break
    case 'warning':
      icon = <WarningIcon fill="fill-yellow-400" w="w-10" />
      break
    default:
      break
  }

  return (
    <OKCancelDialog
      title={alert.title}
      mainVariant={mainVariant}
      open={show}
      showClose={true}
      onOpenChange={onOpenChange}
      buttons={[TEXT_OK]}
      onReponse={() => {
        setShow(false)
      }}
    >
      <VCenterRow className="gap-4">
        {icon}
        <span>{alert.content}</span>
      </VCenterRow>
    </OKCancelDialog>
  )
}
