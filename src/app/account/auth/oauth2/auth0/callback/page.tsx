import { CallbackQueryPage } from '@/components/pages/account/auth/oauth2/auth0/callback-page'
import { makeMetaData } from '@lib/metadata'

export const metadata = makeMetaData('Auth0 Callback')

export default function Page() {
  return <CallbackQueryPage />
}
