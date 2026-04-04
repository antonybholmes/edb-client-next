import { CoreProviders } from '@/providers/core-providers'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useState } from 'react'

import { APP_ACCOUNT_AUTH_SIGNED_OUT_URL } from '@/lib/edb/edb'
import {
  signOutStateAtom,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { useAtom } from 'jotai'
import { BaseSignOutPage } from '../../sign-out-page'

export function SignOutPage() {
  const { logout } = useAuth0()
  const [logoutState] = useAtom(signOutStateAtom)

  const [state, setState] = useState<IRedirectState | null>(null)

  useEffect(() => {
    console.log('Auth0 logout redirect URL:', APP_ACCOUNT_AUTH_SIGNED_OUT_URL)

    logout({
      logoutParams: {
        returnTo: APP_ACCOUNT_AUTH_SIGNED_OUT_URL,
        // state
      },
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
  // const [url, setUrl] = useState('')

  // useEffect(() => {
  //   setUrl(window.location.href)
  // }, [])

  // if (!url) {
  //   return null
  // }

  return (
    <CoreProviders>
      <SignOutPage />
    </CoreProviders>
  )
}
