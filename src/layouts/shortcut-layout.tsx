import { ISignInLayoutProps, SignInLayout } from './signin-layout'

export interface IShortcutLayoutProps extends ISignInLayoutProps {
  mainClassName?: string
}

export function ShortcutLayout({
  children,
  className = 'gap-y-2',
  ...props
}: IShortcutLayoutProps) {
  return (
    <SignInLayout className={className} {...props}>
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
