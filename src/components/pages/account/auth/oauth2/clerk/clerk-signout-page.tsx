import { CoreProviders } from '@/providers/core-providers'

import { APP_ACCOUNT_AUTH_SIGNED_OUT_URL } from '@/lib/edb/edb'
import { useClerk } from '@clerk/react'
import { useEffect, useState } from 'react'

import {
    signOutStateAtom,
    type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { useAtom } from 'jotai'
import { BaseSignOutPage } from '../../sign-out-page'

export function SignOutPage() {
  const { signOut } = useClerk()
  const [logoutState] = useAtom(signOutStateAtom)

  const [state, setState] = useState<IRedirectState | null>(null)

  useEffect(() => {
    signOut({
      redirectUrl: APP_ACCOUNT_AUTH_SIGNED_OUT_URL,
    })
  }, [])

  useEffect(() => {
    if (logoutState && logoutState.target.path) {
      setState(logoutState)
    }
  }, [logoutState])

  return <BaseSignOutPage state={state} allowRedirect={false} />
}

export function SignOutQueryPage() {
  return (
    <CoreProviders>
      <SignOutPage />
    </CoreProviders>
  )
}
