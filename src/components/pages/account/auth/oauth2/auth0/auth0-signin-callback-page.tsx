'use client'

import { useEdbAuth } from '@/lib/edb/edb-auth'

import {
    signinStateAtom,
    type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { AuthProvider } from '@/providers/auth-provider'
import { CoreProviders } from '@/providers/core-providers'
import { useAuth0 } from '@auth0/auth0-react'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { BaseSignInCallbackPage } from '../../signin-callback-page'

export function CallbackPage() {
  const { signInWithAuth0 } = useEdbAuth()
  const [signinState] = useAtom(signinStateAtom)

  const [state, setState] = useState<IRedirectState | null>(null)
  const [allowRedirect, setAllowRedirect] = useState(false)

  const { getAccessTokenSilently, getIdTokenClaims, handleRedirectCallback } =
    useAuth0()

  useEffect(() => {
    async function processCallback() {
      try {
        // seems to be needed to complete the auth0 login process
        await handleRedirectCallback()

        const auth0Token = await getAccessTokenSilently()
        const idTokenClaims = await getIdTokenClaims()
        const idToken = idTokenClaims?.__raw ?? ''

        await signInWithAuth0(idToken) //auth0Token)

        // let t: IRedirectUrl =
        //   decodeRedirectUrl(appState?.[REDIRECT_PARAM] || '') ||
        //   DEFAULT_REDIRECT_URL

        // auth0 allows storing objects in appState so we
        // don't need to encode/decode URLs like with other providers
        // let s: IRedirectState =
        //   appState?.[STATE_PARAM] || DEFAULT_REDIRECT_STATE

        // if (!isSafeRelativeUrl(s.target.path)) {
        //   // if login triggered from signout page, do not redirect back to it.
        //   // Instead goto account page. This stops login with immediate log out.
        //   s.target = DEFAULT_REDIRECT_TARGET
        // }

        setAllowRedirect(true)
      } catch (error) {
        console.error('Error handling redirect callback:', error)
      }
    }

    if (
      window.location.search.includes('code=') &&
      window.location.search.includes('state=')
    ) {
      processCallback()
    }
  }, [handleRedirectCallback, getAccessTokenSilently, getIdTokenClaims])

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
      <AuthProvider>
        <CallbackPage />
      </AuthProvider>
    </CoreProviders>
  )
}
