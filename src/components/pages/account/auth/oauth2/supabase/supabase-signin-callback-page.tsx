'use client'

import { supabase } from '@/lib/auth/supabase'

import { useEdbAuth } from '@/components/edb/auth/edb-auth'

import { useEdbSession } from '@/components/edb/auth/session'
import { logger } from '@/lib/logger'
import { CoreProviders } from '@/providers/core-providers'
import { useEffect, useState } from 'react'
import { BaseSignInCallbackPage } from '../../signin-callback-page'

export function SignInCallbackPage() {
  const [error, setError] = useState('')
  const { signInWithSupabase } = useEdbAuth()
  const [allowRedirect, setAllowRedirect] = useState(false)
  const { redirectTarget } = useEdbSession()

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

  // useEffect(() => {
  //   if (signinState.target.path) {
  //     setState(signinState)
  //   }
  // }, [signinState])

  return (
    <BaseSignInCallbackPage
      target={redirectTarget}
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
