import { ContentDiv } from '@layout/content-div'
import { SignInLayout, type ISignInLayoutProps } from './signin-layout'

export function ContentLayout({ children, ...props }: ISignInLayoutProps) {
  return (
    <SignInLayout {...props}>
      <ContentDiv>{children}</ContentDiv>
    </SignInLayout>
  )
}
