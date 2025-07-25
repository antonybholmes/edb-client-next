import { type IModuleLayoutProps } from './module-layout'

import { APP_NAME } from '@/consts'
import type { ReactNode } from 'react'
import { SignInLayout } from './signin-layout'

export interface IShortcutLayoutProps extends IModuleLayoutProps {
  mainClassName?: string
  shortcuts?: ReactNode
}

export function ShortcutLayout({
  info,
  shortcuts,
  children,
  className = 'gap-y-2',
  ...props
}: IShortcutLayoutProps) {
  return (
    <SignInLayout
      title={info?.name ?? APP_NAME}
      className={className}
      {...props}
    >
      {children}
    </SignInLayout>

    // <ModuleLayout info={info} {...props}>
    //   <BaseRow
    //     className="min-h-0 grow overflow-hidden"
    //     id="shortcuts-layout-row"
    //   >
    //     {shortcuts && <BaseCol className="w-header">{shortcuts}</BaseCol>}

    //     <BaseCol
    //       className={cn('min-h-0 grow overflow-hidden', mainClassName)}
    //       id="shortcuts-layout-col"
    //     >
    //       {children}
    //     </BaseCol>
    //   </BaseRow>
    // </ModuleLayout>
  )
}
