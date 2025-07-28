import { SignedOutQueryPage } from '@/components/pages/account/auth/oauth2/signedout-page'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Signed Out')

export default function Page() {
  return <SignedOutQueryPage />
}
