import { SignOutQueryPage } from '@/components/pages/account/auth/oauth2/auth0/signout-page'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Sign Out')

export default function Page() {
  return <SignOutQueryPage />
}
