import { type IModuleInfo } from '@interfaces/module-info'

import { ModuleInfoButton } from '@components/header/module-info-button'

import { BasicAlertDialog } from '@components/dialog/basic-alert-dialog'
import { useState } from 'react'

import { BaseCol } from '@/components/layout/base-col'
import { formatString } from '@lib/text/format-string'
import { format } from 'date-fns'
import { SignInLayout, type ISignInLayoutProps } from './signin-layout'

export interface IModuleLayoutProps extends ISignInLayoutProps {
  info: IModuleInfo
}

export function ModuleLayout({
  info,
  className,
  children,
  ...props
}: IModuleLayoutProps) {
  //const path = usePathname()

  //const crumbs = createCrumbs(path)

  const [modalVisible, setModalVisible] = useState(false)

  return (
    <SignInLayout
      className={className}
      leftHeaderChildren={
        // <BaseButton onClick={() => setModalVisible(true)}>
        //   <FontAwesomeIcon
        //     icon={faGear}
        //     className="text-white/50 trans-300 transition-color group-hover:text-white"
        //   />
        // </BaseButton>

        <ModuleInfoButton
          onClick={() => setModalVisible(true)}
          selected={modalVisible}
        >
          {info.name}
        </ModuleInfoButton>
      }
      {...props}
    >
      {modalVisible && (
        <BasicAlertDialog
          title={info.name}
          open={modalVisible}
          onOpenChange={setModalVisible}
          onReponse={() => setModalVisible(false)}
          //className="w-3/4 md:w-1/2 lg:w-1/3 xl:w-1/4"
          bodyCls="gap-y-4 text-xs"
          //contentVariant="glass"
        >
          {info.description && (
            <p className="text-xs font-medium">{info.description}</p>
          )}
          {/* <Card className="text-xs" gap="sm"> */}
          <BaseCol className="gap-y-1">
            <span>Version {info.version}</span>
            <span>Updated {format(info.modified, 'MMM dd, yyyy')}</span>
            <span>{formatString(info.copyright)}</span>
          </BaseCol>
          {/* </Card> */}
        </BasicAlertDialog>
      )}

      {children}
    </SignInLayout>
  )
}
