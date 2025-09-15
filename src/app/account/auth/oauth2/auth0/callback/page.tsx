import { CallbackPage } from '@/components/pages/account/auth/oauth2/auth0/callback-page'
import { makeMetaData } from '@lib/metadata'
import { Suspense } from 'react'

export const metadata = makeMetaData('Auth0 Callback')

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CallbackPage />
    </Suspense>
  )
}
