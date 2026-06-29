import { ThemeLink } from '@/components/link/theme-link'
import { CenterLayout } from '@/layouts/center-layout'
import {
    APP_ACCOUNT_OAUTH2_AUTH0_SIGN_OUT_URL,
    APP_ACCOUNT_OAUTH2_CLERK_SIGN_OUT_URL,
    APP_ACCOUNT_OAUTH2_COGNITO_SIGN_OUT_URL,
    APP_ACCOUNT_OAUTH2_SUPABASE_SIGN_OUT_URL,
} from '@/lib/edb/edb'
import { useEdbAuth, useEdbSignIn } from '@/lib/edb/edb-auth'
import {
    addRedirectStateToUrl,
    DEFAULT_REDIRECT_STATE,
    getRedirectStateFromURI,
    isSafeRelativeUrl,
    signOutStateAtom,
    type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { redirect } from '@/lib/http/urls'
import { CoreProviders } from '@/providers/core-providers'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { AuthModal } from './auth-modal'

interface BaseSignOutPageProps {
  state?: IRedirectState | null
  allowRedirect?: boolean
}

export function BaseSignOutPage({
  state = null,
  allowRedirect = true,
}: BaseSignOutPageProps) {
  const _state = state
    ? isSafeRelativeUrl(state.target.path)
      ? state
      : DEFAULT_REDIRECT_STATE
    : null

  useEffect(() => {
    if (allowRedirect && _state && _state.target.path) {
      redirect(_state.target.path)
    }
  }, [_state, allowRedirect])

  return (
    <CenterLayout signinRequired={false}>
      <AuthModal title="Signing out...">
        {_state && (
          <p>
            You will be redirected to the{' '}
            <ThemeLink href={_state.target.path}>
              {_state.target.title}
            </ThemeLink>{' '}
            page.
          </p>
        )}
      </AuthModal>
    </CenterLayout>
  )
}

export function SignOutPage() {
  const { signinMethod } = useEdbSignIn()
  const { signout } = useEdbAuth()
  const [state, setState] = useState<IRedirectState | null>(null)
  const [, setLogoutState] = useAtom(signOutStateAtom)

  useEffect(() => {
    async function completeSignout() {
      try {
        await signout()
      } catch (error) {
        console.error('Error during signout:', error)
      }

      let state = getRedirectStateFromURI()

      // cache where to go after signout since
      // some providers lose state during signout
      setLogoutState(state)

      let url = ''

      switch (signinMethod) {
        case 'supabase':
          url = APP_ACCOUNT_OAUTH2_SUPABASE_SIGN_OUT_URL
          break
        case 'cognito':
          url = APP_ACCOUNT_OAUTH2_COGNITO_SIGN_OUT_URL
          break
        case 'clerk':
          url = APP_ACCOUNT_OAUTH2_CLERK_SIGN_OUT_URL
          break
        default:
          // default to auth0 as this is most common
          url = APP_ACCOUNT_OAUTH2_AUTH0_SIGN_OUT_URL
      }

      if (url) {
        url = addRedirectStateToUrl(url, state)

        setState({ target: { title: state.target.title, path: url } })
      }
    }

    completeSignout()
  }, [])

  return <BaseSignOutPage state={state} />
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
      <SignOutPage />
    </CoreProviders>
  )
}
