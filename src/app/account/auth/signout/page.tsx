import { SignOutPage } from '@/components/pages/account/auth/oauth2/signout-page'
import { makeMetaData } from '@lib/metadata'
import { Suspense } from 'react'

export const metadata = makeMetaData('Sign Out')

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignOutPage />
    </Suspense>
  )
}
