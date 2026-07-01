'use client'

import { useEdbAuth } from '@/components/edb/auth/edb-auth'

import { useEdbSession } from '@/components/edb/auth/session'
import { CoreProviders } from '@/providers/core-providers'
import { useAuth } from '@clerk/react'
import { useEffect, useState } from 'react'
import { BaseSignInCallbackPage } from '../../signin-callback-page'

const TEMPLATE = 'jwt-experiments'

export function SignInCallbackPage() {
  //const { user } = useUser()
  const { getToken, isSignedIn } = useAuth()
  const { signInWithClerk } = useEdbAuth()

  const { redirectTarget } = useEdbSession()

  const [allowRedirect, setAllowRedirect] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken({ template: TEMPLATE })

        if (token) {
          // create session with token
          await signInWithClerk(token)
        }

        // force user to be refreshed
        //setUser(await refreshEdbUser())

        setAllowRedirect(true)
      } catch (error) {
        console.error(error)
      }
    }

    if (isSignedIn) {
      load()
    }
  }, [isSignedIn])

  return (
    <BaseSignInCallbackPage
      target={redirectTarget}
      allowRedirect={allowRedirect}
    />
  )
}

export function SignInCallbackQueryPage() {
  return (
    <CoreProviders>
      <SignInCallbackPage />
    </CoreProviders>
  )
}
