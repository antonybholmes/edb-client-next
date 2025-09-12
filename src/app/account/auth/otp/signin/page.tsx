import { SignInPage } from '@/components/pages/account/auth/otp/signin-page'
import { TEXT_SIGN_IN } from '@/consts'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData(TEXT_SIGN_IN)

export default function Page() {
  return <SignInPage />
}
