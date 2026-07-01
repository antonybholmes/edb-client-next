'use client'

import { CoreProviders } from '@/providers/core-providers'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'

import {} from '@/components/edb/auth/edb-signin'
import { useEdbSession } from '@/components/edb/auth/session'
import { APP_ACCOUNT_AUTH_SIGNED_OUT_URL } from '@/components/edb/edb'
import { AuthProvider } from '@/providers/auth-provider'
import { BaseSignOutPage } from '../../sign-out-page'

export function SignOutPage() {
  const { logout } = useAuth0()

  const { redirectTarget } = useEdbSession()

  useEffect(() => {
    logout({
      logoutParams: {
        returnTo: APP_ACCOUNT_AUTH_SIGNED_OUT_URL,
        // state
      },
    })
  }, [])

  // useEffect(() => {
  //   if (logoutState && logoutState.target.path) {
  //     setState(logoutState)
  //   }
  // }, [logoutState])

  return <BaseSignOutPage target={redirectTarget} allowRedirect={false} />
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
      <AuthProvider>
        <SignOutPage />
      </AuthProvider>
    </CoreProviders>
  )
}
