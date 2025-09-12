import { HeaderLayout, type IHeaderLayoutProps } from '@layouts/header-layout'

import { OAUTH2_SIGN_IN_ROUTE, SIGN_UP_ROUTE, TEXT_SIGN_UP } from '@lib/edb/edb'

import { ThemeIndexLink } from '@components/link/theme-index-link'
import { useState, type ReactNode } from 'react'

import { TEXT_SIGN_IN } from '@/consts'

import { AppIcon } from '@/components/icons/app-icon'
import { VCenterRow } from '@/components/layout/v-center-row'

import { CenterCol } from '@/components/layout/center-col'
import { Card, CardHeader, CardTitle } from '@/components/shadcn/ui/themed/card'
import { EDBSignIn, type SignInMode } from '@/lib/edb/signin/edb-signin'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { usePathname } from 'next/navigation'

export const FORWARD_DELAY_MS = 2000

//https://uibakery.io/regex-library/email
export const EMAIL_PATTERN =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
export const USERNAME_PATTERN = /^[\w@.]{3,}/

export const NAME_PATTERN = /^[\w ]*/

export const TEXT_USERNAME_REQUIRED = 'A username is required'
export const TEXT_NAME_REQUIRED = 'A first name is required'
export const TEXT_USERNAME_DESCRIPTION =
  'A username must contain at least 3 characters, which can be letters, numbers, andunknown of @.-'
export const TEXT_EMAIL_ERROR = 'This does not seem like a valid email address'

export function CreateAccountLink() {
  return (
    <span className="w-full">
      Don&apos;t have an account?{' '}
      <ThemeIndexLink href={SIGN_UP_ROUTE} aria-label={TEXT_SIGN_UP}>
        Create an account
      </ThemeIndexLink>
    </span>
  )
}

export function SignInLink() {
  return (
    <span>
      Already have an account?{' '}
      <ThemeIndexLink href={OAUTH2_SIGN_IN_ROUTE} aria-label={TEXT_SIGN_IN}>
        {TEXT_SIGN_IN}
      </ThemeIndexLink>
    </span>
  )
}

// interface IFormInput {
//   username: string
//   password1: string
//   //passwordless: boolean
//   staySignedIn: boolean
// }

export interface ISignInLayoutProps extends IHeaderLayoutProps {
  signedRequired?: 'auto' | 'always' | 'never'
  apiKey?: string
  // if signin is success, which page of the app to jump to
  // so that user is not left on signin page
  redirectUrl?: string
  signInMode?: SignInMode
  showAccountButton?: boolean
}

export function SignInRequired({
  redirectUrl = '',

  children,
}: ISignInLayoutProps) {
  const pathname = usePathname()
  const [_redirectUrl, setRedirectUrl] = useState('')

  //const queryClient = useQueryClient()

  const { session, loaded } = useEdbAuth()

  // useEffect(() => {
  //   async function checkSignedIn() {
  //     // we need to check if user is signed in
  //     // if not, we will redirect them to the sign in page.
  //     // We must request the session rather than using the
  //     // session from the store, because it may be stale
  //     // and we want to ensure that the user is truly not
  //     // signed in before redirecting them to the sign in page.
  //     // session may be null upon initial load until the
  //     // session is fetched from the server so it is not reliable
  //     // for determining if the user is signed in and should
  //     // only be used in passive ways, such as rendering the
  //     // sign in button or showing the user name in the header.
  //     const s = await fetchSession()

  //     //console.log('loadUser', session)
  //     if (!s) {
  //       // the sign in callback includes this url so that the app can signin and
  //       // then return user to the page they were signing into as a convenience

  //       const url = redirectUrl ? redirectUrl : pathname // window.location.pathname

  //       setRedirectUrl(url)
  //     }
  //   }

  //   if (csrfToken) {
  //     checkSignedIn()
  //   }
  // }, [csrfToken])

  // if (_redirectUrl) {
  //   console.log('redirect', _redirectUrl, session)
  //   redirect(
  //     `${APP_OAUTH2_SIGN_IN_ROUTE}?redirect=${encodeURIComponent(_redirectUrl)}`
  //   )
  // }

  if (!loaded) {
    return null
  }

  if (!session) {
    return (
      <CenterCol>
        <Card className="shadow-2xl w-128 text-sm">
          <CardHeader className="text-xl">
            <VCenterRow className="gap-x-2">
              <AppIcon w="w-10" />
              <CardTitle>{TEXT_SIGN_IN} Required</CardTitle>
            </VCenterRow>
          </CardHeader>
          <p>You need to sign in to view this page.</p>
          {/* <VCenterRow className="justify-end">
            <ThemeIndexLink href={APP_OAUTH2_SIGN_IN_ROUTE}>
              {TEXT_SIGN_IN}
            </ThemeIndexLink>
          </VCenterRow> */}
        </Card>
      </CenterCol>
    )
  } else {
    return children
  }
}

export function SignInLayout({
  signInMode = 'auth0', //username-password',
  signedRequired = 'auto',
  showAccountButton = true,
  redirectUrl = '',
  className,
  headerTrayChildren,
  children,
}: ISignInLayoutProps) {
  let elem: ReactNode

  if (signedRequired !== 'never') {
    elem = (
      <SignInRequired
        signInMode={signInMode}
        signedRequired={signedRequired}
        showAccountButton={showAccountButton}
        redirectUrl={redirectUrl}
        className={className}
        headerTrayChildren={headerTrayChildren}
      >
        {children}
      </SignInRequired>
    )
  } else {
    elem = children
  }

  return (
    <HeaderLayout
      className={className}
      headerTrayChildren={
        <>
          {showAccountButton && <EDBSignIn signInMode={signInMode} />}

          {headerTrayChildren}
        </>
      }
    >
      {/* <OKCancelDialog
          open={checkUserWantsToSignIn}
          title={APP_NAME}
          onResponse={r => {
            if (r === TEXT_OK) {
              setForceSignIn(true)
            }

            setCheckUserWantsToSignIn(false)
          }}
        >
          You are already signed in. Are you sure you want to sign in again?
        </OKCancelDialog> */}

      {elem}
    </HeaderLayout>
  )
}
