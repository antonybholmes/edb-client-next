import { type IModuleInfo } from '@/lib/module-info'

import { APP_NAME } from '@/consts'
import { SignInLayout, type ISignInLayoutProps } from './signin-layout'

export interface IModuleLayoutProps extends ISignInLayoutProps {
  info?: IModuleInfo
}

export function ModuleLayout({
  info,
  className,
  children,
  ...props
}: IModuleLayoutProps) {
  //const path = usePathname()

  //const crumbs = createCrumbs(path)

  return (
    <SignInLayout
      title={info?.name ?? APP_NAME}
      className={className}
      // leftHeaderChildren={
      //   // <BaseButton onClick={() => setModalVisible(true)}>
      //   //   <FontAwesomeIcon
      //   //     icon={faGear}
      //   //     className="text-white/50 trans-300 transition-color group-hover:text-white"
      //   //   />
      //   // </BaseButton>

      //   <ModuleInfoButton info={info} />
      // }
      {...props}
    >
      {children}
    </SignInLayout>
  )
}
