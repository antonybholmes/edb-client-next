'use client'

import { CoreProviders } from '@/providers/core-providers'

import { useEdbAuth } from '@/components/edb/auth/edb-auth'
import { useEffect, useState } from 'react'

import { useEdbSession } from '@/components/edb/auth/session'
import { BaseSignInCallbackPage } from '../../signin-callback-page'
import { handleCognitoCallback } from './cognito-signin-button'

export function SignInCallbackPage() {
  const { signInWithCognito } = useEdbAuth()

  const [allowRedirect, setAllowRedirect] = useState(false)

  const { redirectTarget } = useEdbSession()

  useEffect(() => {
    async function parse() {
      const result = await handleCognitoCallback()

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
