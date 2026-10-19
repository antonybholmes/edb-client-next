import { cn } from '@/lib/shadcn-utils'
import { type IButtonProps } from '@/themed/baseui/button'

import { useAppInfo } from '@/components/edb/edb-settings'
import { IS_DEV_MODE } from '@/consts'
import { HeaderButton } from '@/layouts/header-button'
import { present } from '@/lib/dom-utils'
import { capitalCase } from '@/lib/text/capital-case'
import { formatString } from '@/lib/text/format-string'
import { format } from 'date-fns'
import { useState } from 'react'
import { useDialogs } from '../dialogs/dialogs'
import { AppIcon } from '../icons/app-icon'
import { VCenterRow } from '../layout/v-center-row'

export function AppInfoContent() {
  const { appInfo } = useAppInfo()

  if (!appInfo) {
    return null
  }

  return (
    <>
      <VCenterRow className="gap-x-1 mb-2">
        <AppIcon appInfo={appInfo} />
        <span className="ml-2 font-medium text-lg">{appInfo?.name}</span>
      </VCenterRow>
      {appInfo?.description && (
        <span className="font-medium">{capitalCase(appInfo.description)}</span>
      )}

      <span>
        Build {appInfo?.version}.{appInfo?.build}
      </span>
      {IS_DEV_MODE && <span>Snapshot {appInfo.hash.slice(0, 12)}</span>}
      <span>Updated {format(appInfo?.modified, 'MMM dd, yyyy')}</span>

      <span>{formatString(appInfo?.copyright)}</span>
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
      data-checked={present(modalVisible)}
      className={cn('hidden md:flex font-medium text-sm', className)}
      onClick={() => {
        setModalVisible(true)
        openDialog({
          type: 'alert',

          payload: {
            type: 'default',
            title: `About ${appInfo?.name}`,
            component: AppInfoContent,
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
