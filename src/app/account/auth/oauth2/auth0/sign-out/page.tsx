import { SignOutQueryPage } from '@/components/pages/account/auth/oauth2/auth0/auth0-sign-out-page'
import { makeMetaData } from '@/lib/metadata'

export const metadata = makeMetaData('Auth0 Sign Out')

export default function Page() {
  return <SignOutQueryPage />
}
