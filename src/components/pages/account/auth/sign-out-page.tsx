import { useEdbAuth, useEdbSignIn } from '@/components/edb/auth/edb-auth'
import { getRedirectStateFromURI } from '@/components/edb/auth/edb-signin'
import {
  HOME_REDIRECT_TARGET,
  IRedirectTarget,
  isSafeRelativeUrl,
  useEdbSession,
} from '@/components/edb/auth/session'
import {
  APP_ACCOUNT_OAUTH2_AUTH0_SIGN_OUT_URL,
  APP_ACCOUNT_OAUTH2_CLERK_SIGN_OUT_URL,
  APP_ACCOUNT_OAUTH2_COGNITO_SIGN_OUT_URL,
  APP_ACCOUNT_OAUTH2_SUPABASE_SIGN_OUT_URL,
} from '@/components/edb/edb'
import { ThemeLink } from '@/components/link/theme-link'
import { CenterLayout } from '@/layouts/center-layout'
import { redirect } from '@/lib/http/urls'
import { CoreProviders } from '@/providers/core-providers'
import { useEffect } from 'react'
import { AuthModal } from './auth-modal'

interface BaseSignOutPageProps {
  target?: IRedirectTarget | null
  allowRedirect?: boolean
}

export function BaseSignOutPage({
  target = null,
  allowRedirect = true,
}: BaseSignOutPageProps) {
  const _target =
    target && isSafeRelativeUrl(target.path) ? target : HOME_REDIRECT_TARGET

  useEffect(() => {
    if (allowRedirect && _target && _target.path) {
      redirect(_target.path)
    }
  }, [_target, allowRedirect])

  return (
    <CenterLayout signinRequired={false}>
      <AuthModal title="Signing out...">
        {_target && (
          <p>
            You will be redirected to the{' '}
            <ThemeLink href={_target.path}>{_target.title}</ThemeLink> page.
          </p>
        )}
      </AuthModal>
    </CenterLayout>
  )
}

export function SignOutPage() {
  const { signinMethod } = useEdbSignIn()
  const { signout } = useEdbAuth()
  //const [state, setState] = useState<IRedirectState | null>(null)
  //const [, setLogoutState] = useAtom(signOutStateAtom)
  const { redirectTarget } = useEdbSession()

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
      //  setLogoutState(state)

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

      //if (url) {
      //  url = addRedirectStateToUrl(url, state)

      //setState({ target: { title: state.target.title, path: url } })
      //}
    }

    completeSignout()
  }, [])

  return <BaseSignOutPage target={redirectTarget} />
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
