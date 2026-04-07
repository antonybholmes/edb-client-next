import { SignInQueryPage } from '@/components/pages/account/auth/passwordless/signin-page'
import { TEXT_SIGNED_IN } from '@/consts'
import { makeMetaData } from '@/lib/metadata'

export const metadata = makeMetaData(TEXT_SIGNED_IN)

export default function Page() {
  return <SignInQueryPage />
}
