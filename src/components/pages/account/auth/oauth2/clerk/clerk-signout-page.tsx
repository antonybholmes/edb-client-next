import { CoreProviders } from '@/providers/core-providers'

import { APP_ACCOUNT_AUTH_SIGNED_OUT_URL } from '@/components/edb/edb'
import { useClerk } from '@clerk/react'
import { useEffect } from 'react'

import {} from '@/components/edb/auth/edb-signin'
import { useEdbSession } from '@/components/edb/auth/session'
import { BaseSignOutPage } from '../../sign-out-page'

export function SignOutPage() {
  const { signOut } = useClerk()

  const { redirectTarget } = useEdbSession()

  useEffect(() => {
    signOut({
      redirectUrl: APP_ACCOUNT_AUTH_SIGNED_OUT_URL,
    })
  }, [])

  return <BaseSignOutPage target={redirectTarget} allowRedirect={false} />
}

export function SignOutQueryPage() {
  return (
    <CoreProviders>
      <SignOutPage />
    </CoreProviders>
  )
}
