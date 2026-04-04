// 'use client'

import { supabase } from '@/lib/auth/supabase'

import { useEdbAuth } from '@/lib/edb/edb-auth'
import {
  signinStateAtom,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { logger } from '@/lib/logger'
import { CoreProviders } from '@/providers/core-providers'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { BaseSignInCallbackPage } from '../../signin-callback-page'

export function SignInCallbackPage() {
  const [state, setState] = useState<IRedirectState | null>(null)
  const [error, setError] = useState('')
  const { signInWithSupabase } = useEdbAuth()
  const [allowRedirect, setAllowRedirect] = useState(false)
  const [signinState] = useAtom(signinStateAtom)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        logger.error('Session error:', error)
        setError('Session error: ' + error.message)
        return
      }

      try {
        const token = data.session?.access_token || ''

        logger.debug('supta token', token)

        await signInWithSupabase(token)

        setAllowRedirect(true)

        // force user to be refreshed
      } catch (error) {
        logger.error(error)
        setError(
          'We couldn’t complete the sign in process. This might be due to an expired session or network issue. Please try again later.'
        )
      }
    }

    load()
  }, [])

  useEffect(() => {
    if (signinState.target.path) {
      setState(signinState)
    }
  }, [signinState])

  return (
    <BaseSignInCallbackPage
      state={state}
      error={error}
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
