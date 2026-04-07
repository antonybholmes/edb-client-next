import { SignInCallbackQueryPage } from '@/components/pages/account/auth/oauth2/auth0/auth0-signin-callback-page'
import { makeMetaData } from '@/lib/metadata'

export const metadata = makeMetaData('Auth0 Callback')

export default function Page() {
  return <SignInCallbackQueryPage />
}
