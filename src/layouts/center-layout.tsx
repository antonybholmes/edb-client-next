import { CenterCol } from '@layout/center-col'
import { SignInLayout, type ISignInLayoutProps } from './signin-layout'

export function CenterLayout({
  innerCls,
  children,
  ...props
}: ISignInLayoutProps & { innerCls?: string }) {
  return (
    <SignInLayout {...props}>
      <CenterCol className={innerCls}>{children}</CenterCol>
    </SignInLayout>
  )
}
