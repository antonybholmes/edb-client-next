import { SignInPage } from '@/components/pages/account/auth/otp/signin-page'
import { TEXT_SIGN_IN } from '@/consts'
import { makeMetaData } from '@lib/metadata'
import { Suspense } from 'react'

export const metadata = makeMetaData(TEXT_SIGN_IN)

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage />
    </Suspense>
  )
}
