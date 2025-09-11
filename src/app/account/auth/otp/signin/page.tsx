import { SignInPage } from '@/components/pages/account/auth/otp/signin-page'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('One-Time Password Sign In')

export default function Page() {
  return <SignInPage />
}
