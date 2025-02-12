import { makeInfoAlert } from '@components/alerts/alerts-provider'

import { HeaderLayout, type IHeaderLayoutProps } from '@layouts/header-layout'

import { SIGN_IN_ROUTE, SIGN_UP_ROUTE, TEXT_SIGN_UP } from '@/lib/edb/edb'

import { ThemeIndexLink } from '@components/link/theme-index-link'
import { useContext, useEffect, useState, type ReactNode } from 'react'

import { VCenterCol } from '@/components/layout/v-center-col'
import { TEXT_SIGN_IN } from '@/consts'

import { DinoIcon } from '@/components/icons/dino-icon'
import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { Button } from '@/components/shadcn/ui/themed/button'
import { EdbAuthContext } from '@/lib/edb/edb-auth-provider'
import { EDBSignIn, type SignInMode } from '@/lib/edb/signin/edb-signin'

export const FORWARD_DELAY_MS = 1000

//https://uibakery.io/regex-library/email
export const EMAIL_PATTERN =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
export const USERNAME_PATTERN = /^[\w@.]{4,}/

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
      <ThemeIndexLink href={SIGN_IN_ROUTE} aria-label={TEXT_SIGN_IN}>
        {TEXT_SIGN_IN}
      </ThemeIndexLink>
    </span>
  )
}

export function makeSignedInAlert() {
  return makeInfoAlert({
    title: 'You are signed in',
  })
}

// interface IFormInput {
//   username: string
//   password1: string
//   //passwordless: boolean
//   staySignedIn: boolean
// }

export interface ISignInLayoutProps extends IHeaderLayoutProps {
  signInMode?: SignInMode
  showSignInError?: boolean
  apiKey?: string
  // if signin is success, which page of the app to jump to
  // so that user is not left on signin page
  callbackUrl?: string
}

export function SignInLayout({
  signInMode = 'auth0', //username-password',
  showSignInError = true,
  apiKey = '',
  callbackUrl,
  className,
  headerTrayChildren,
  children,
  ...props
}: ISignInLayoutProps) {
  const [_callbackUrl, setCallbackUrl] = useState<string | undefined>(
    callbackUrl
  )

  //const queryClient = useQueryClient()

  const { edbUser: user } = useContext(EdbAuthContext)

  useEffect(() => {
    // async function loadUser() {
    //   setUser(await getCachedUser())
    // }

    // the sign in callback includes this url so that the app can signin and
    // then return user to the page they were signing into as a convenience
    if (!_callbackUrl) {
      // default to returning to current page if none specified. This is not
      // advantageous on the signin page itself as it may appear as though
      // user has not signed in even when they have. In this case it should
      // be manually set.
      setCallbackUrl(window.location.href)
    }

    //loadUser()
  }, [])

  if (!user) {
    return null // 'Checking callback url...'
  }

  if (!_callbackUrl) {
    return null // 'Checking callback url...'
  }

  //const signInRequired = showSignInError && user.uuid === ''

  //if (signInRequired) {
  //  console.log('redirect', _callbackUrl)
  //redirect(`${SIGN_IN_ROUTE}?callbackUrl=${_callbackUrl}`)
  //}

  let elem: ReactNode

  if (user.uuid === '' && showSignInError) {
    elem = (
      <VCenterCol className="h-full items-center grow">
        <BaseCol className="gap-y-4 w-1/2">
          <DinoIcon />
          <h1 className="text-2xl font-medium">
            Hmm, you do not appear to be signed in!
          </h1>
          <p>
            You must be signed in to view this page. Try using the{' '}
            <strong>{TEXT_SIGN_IN}</strong> button on the top right to enter
            your credentials.
          </p>

          <VCenterRow className="mt-8 text-sm">
            <Button
              variant="theme"
              size="lg"
              onClick={() => window.location.reload()}
            >
              Reload
            </Button>
          </VCenterRow>
        </BaseCol>
      </VCenterCol>
    )
  } else {
    elem = children
  }

  return (
    <HeaderLayout
      className={className}
      headerTrayChildren={
        <>
          {headerTrayChildren}
          <EDBSignIn apiKey={apiKey} signInMode={signInMode} />
        </>
      }
      {...props}
    >
      {/* <OKCancelDialog
          open={checkUserWantsToSignIn}
          title={APP_NAME}
          onReponse={r => {
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
