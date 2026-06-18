'use client'

import { CoreProviders } from '@/providers/core-providers'

import { useEdbAuth } from '@/lib/edb/edb-auth'
import { useEffect, useState } from 'react'

import {
  signinStateAtom,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { useAtom } from 'jotai'
import { BaseSignInCallbackPage } from '../../signin-callback-page'
import { handleCognitoCallback } from './cognito-signin-button'

export function SignInCallbackPage() {
  const { signInWithCognito } = useEdbAuth()
  const [state, setState] = useState<IRedirectState | null>(null)
  const [signinState] = useAtom(signinStateAtom)
  const [allowRedirect, setAllowRedirect] = useState(false)

  useEffect(() => {
    async function parse() {
      const result = await handleCognitoCallback()

      console.log('Redirect URL from appState:', result)

      if (!result?.tokens) {
        return
      }
      // Store JWTs
      //localStorage.setItem('id_token', result.tokens.id_token)
      //localStorage.setItem('access_token', result.tokens.access_token)

      try {
        await signInWithCognito(result.tokens.id_token)
        //setState(result.state)

        setAllowRedirect(true)

        //window.location.href = result.target
      } catch (error) {
        console.error('Error handling redirect callback:', error)
      }
    }

    parse()
  }, [])

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
