'use client'

import { useEdbAuth } from '@/lib/edb/edb-auth'

import { signinStateAtom } from '@/lib/edb/signin/edb-signin'
import { CoreProviders } from '@/providers/core-provider'
import { useAuth } from '@clerk/react'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { BaseSignInCallbackPage } from '../../signin-callback-page'

const TEMPLATE = 'jwt-experiments'

export function SignInCallbackPage() {
  //const { user } = useUser()
  const { getToken, isSignedIn } = useAuth()
  const { signInWithClerk } = useEdbAuth()

  const [signinState] = useAtom(signinStateAtom)
  const [state, setState] = useState<typeof signinState | null>(null)
  const [allowRedirect, setAllowRedirect] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken({ template: TEMPLATE })

        console.log('token', token)

        if (token) {
          // create session with token
          await signInWithClerk(token)
        }

        console.log('Redirect state from Clerk signin:', signinState)

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

  useEffect(() => {
    if (signinState.target.path) {
      setState(signinState)
    }
  }, [signinState])

  return <BaseSignInCallbackPage state={state} allowRedirect={allowRedirect} />
}

export function SignInCallbackQueryPage() {
  return (
    <CoreProviders>
      <SignInCallbackPage />
    </CoreProviders>
  )
}
