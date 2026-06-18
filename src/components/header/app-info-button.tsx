import { cn } from '@/lib/shadcn-utils'
import { type IButtonProps } from '@/themed/v2/button'

import { IS_DEV_MODE } from '@/consts'
import { HeaderButton } from '@/layouts/header-button'
import { useAppInfo } from '@/lib/edb/edb-settings'
import { formatString } from '@/lib/text/format-string'
import { format } from 'date-fns'
import { useState } from 'react'
import { useDialogs } from '../dialogs/dialogs'

export function AppInfoContent() {
  const { appInfo } = useAppInfo()

  if (!appInfo) {
    return null
  }

  return (
    <>
      {appInfo?.description && (
        <p className="font-medium">{appInfo.description}</p>
      )}

      <p>
        Build {appInfo?.version}.{appInfo?.build}
      </p>
      {IS_DEV_MODE && <p>Snapshot {appInfo.hash.slice(0, 12)}</p>}
      <p>Updated {format(appInfo?.modified, 'MMM dd, yyyy')}</p>

      <p>{formatString(appInfo?.copyright)}</p>
    </>
  )
}

export function AppInfoButton({
  ref,

  className,
  ...props
}: IButtonProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const { appInfo } = useAppInfo()
  const { open: openDialog } = useDialogs()

  if (!appInfo) {
    return null
  }

  return (
    <HeaderButton
      ref={ref}
      data-checked={modalVisible}
      className={cn('hidden md:flex font-semibold text-sm', className)}
      onClick={() => {
        setModalVisible(true)
        openDialog({
          type: 'alert',

          payload: {
            type: 'default',
            title: `About ${appInfo?.name}`,
            content: <AppInfoContent />,
            callback: () => setModalVisible(false),
          },
        })
      }}
      {...props}
    >
      {appInfo?.name}
    </HeaderButton>
  )
}
