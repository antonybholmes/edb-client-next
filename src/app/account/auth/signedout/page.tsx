import { SignedOutPage } from '@/components/pages/account/auth/oauth2/signedout-page'
import { makeMetaData } from '@lib/metadata'
import { Suspense } from 'react'

export const metadata = makeMetaData('Signed Out')

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignedOutPage />
    </Suspense>
  )
}
