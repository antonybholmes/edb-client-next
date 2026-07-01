'use client'

import { ThemeLink } from '@/components/link/theme-link'

import {
  getRedirectStateFromURI,
  safeRedirect,
} from '@/components/edb/auth/edb-signin'
import {
  HOME_REDIRECT_TARGET,
  IRedirectTarget,
  isSafeRelativeUrl,
  useEdbSession,
} from '@/components/edb/auth/session'
import { config } from '@/config'
import { CenterLayout } from '@/layouts/center-layout'
import { CoreProviders } from '@/providers/core-providers'
import { useEffect } from 'react'
import { AuthModal } from './auth-modal'

interface IBaseSignInCallbackPageProps {
  target?: IRedirectTarget | null
  error?: string | null
  allowRedirect?: boolean
}

export function BaseSignInCallbackPage({
  target = null,
  error = null,
  allowRedirect = true,
}: IBaseSignInCallbackPageProps) {
  // if state is set to something, validate it
  // and default to home if unsafe, otherwise null
  const _target =
    target && isSafeRelativeUrl(target.path) ? target : HOME_REDIRECT_TARGET

  useEffect(() => {
    if (!_target || !allowRedirect || error) {
      return
    }

    try {
      safeRedirect(_target.path)
    } catch (err) {
      console.error('Error during redirect:', err)
    }
  }, [_target, allowRedirect, error])

  return (
    <CenterLayout signinRequired={false} innerCls="gap-y-2">
      {error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <AuthModal title={`Signing in to ${config.name}...`}>
          {_target && (
            <p>
              You will be redirected to{' '}
              <ThemeLink href={_target.path}>{_target.title}</ThemeLink>
            </p>
          )}
        </AuthModal>
      )}
    </CenterLayout>
  )
}

export function CallbackPage() {
  const { redirectTarget, setRedirect } = useEdbSession()

  useEffect(() => {
    async function processCallback() {
      try {
        const state = getRedirectStateFromURI()

        setRedirect(state.target)
      } catch (error) {
        console.error('Error handling redirect callback:', error)
      }
    }

    processCallback()
  }, [])

  return <BaseSignInCallbackPage target={redirectTarget} />
}

export function CallbackQueryPage() {
  return (
    <CoreProviders>
      <CallbackPage />
    </CoreProviders>
  )
}
