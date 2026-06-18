'use client'

import { ThemeLink } from '@/components/link/theme-link'

import { config } from '@/config'
import { CenterLayout } from '@/layouts/center-layout'
import {
  DEFAULT_REDIRECT_STATE,
  getRedirectStateFromURI,
  isSafeRelativeUrl,
  safeRedirect,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { CoreProviders } from '@/providers/core-providers'
import { useEffect, useState } from 'react'
import { AuthModal } from './auth-modal'

interface IBaseSignInCallbackPageProps {
  state?: IRedirectState | null
  error?: string | null
  allowRedirect?: boolean
}

export function BaseSignInCallbackPage({
  state = null,
  error = null,
  allowRedirect = true,
}: IBaseSignInCallbackPageProps) {
  // if state is set to something, validate it
  // and default to home if unsafe, otherwise null
  const _state = state
    ? isSafeRelativeUrl(state?.target.path || '')
      ? state
      : DEFAULT_REDIRECT_STATE
    : null

  useEffect(() => {
    console.log('e', _state, allowRedirect, error)
    if (!_state || !allowRedirect || error) {
      return
    }

    console.log('Redirecting to sign-in target:', _state)

    try {
      safeRedirect(_state.target.path)
    } catch (err) {
      console.error('Error during redirect:', err)
    }
  }, [_state, allowRedirect, error])

  return (
    <CenterLayout signinRequired={false} innerCls="gap-y-2">
      {error ? (
        <p className="text-destructive">{error}</p>
      ) : (
        <AuthModal title={`Signing in to ${config.name}...`}>
          {_state && (
            <p>
              You will be redirected to{' '}
              <ThemeLink href={_state.target.path}>
                {_state.target.title}
              </ThemeLink>
            </p>
          )}
        </AuthModal>
      )}
    </CenterLayout>
  )
}

export function CallbackPage() {
  const [state, setState] = useState<IRedirectState | null>(null)

  useEffect(() => {
    async function processCallback() {
      try {
        const state = getRedirectStateFromURI()

        //console.log('Redirect URL from appState:', url, invalidRedirectUrl(url))

        setState(state)
      } catch (error) {
        console.error('Error handling redirect callback:', error)
      }
    }

    processCallback()
  }, [])

  return <BaseSignInCallbackPage state={state} />
}

export function CallbackQueryPage() {
  return (
    <CoreProviders>
      <CallbackPage />
    </CoreProviders>
  )
}
