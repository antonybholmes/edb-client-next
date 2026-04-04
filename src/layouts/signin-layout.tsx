import { HeaderLayout, type IHeaderLayoutProps } from '@/layouts/header-layout'

import { SIGN_UP_PATH, TEXT_SIGN_UP } from '@/lib/edb/edb'

import { ThemeIndexLink } from '@/components/link/theme-index-link'
import { type ReactNode } from 'react'

import { TEXT_SIGN_IN } from '@/consts'

import { AuthModal } from '@/components/pages/account/auth/auth-modal'
import { useEdbAuth } from '@/lib/edb/edb-auth'

export const FORWARD_DELAY_MS = 2000

//https://uibakery.io/regex-library/email
export const EMAIL_PATTERN =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
export const USERNAME_PATTERN = /^[\w@.]{3,}/
export const USERNAME_REGEX = /^\w{3,}/
export const PUBLIC_ID_REGEX = /^[a-zA-Z0-9\-\_]+$/

export const NAME_PATTERN = /^[\w ]+/

export const TEXT_USERNAME_REQUIRED = 'A username is required'
export const TEXT_NAME_REQUIRED = 'A first name is required'
export const TEXT_USERNAME_DESCRIPTION =
  'A username must contain at least 3 characters, which can be letters, numbers and special characters like @ and .'
export const TEXT_EMAIL_ERROR = 'This does not seem like a valid email address'

export function CreateAccountLink() {
  return (
    <span className="w-full">
      Don&apos;t have an account?{' '}
      <ThemeIndexLink href={SIGN_UP_PATH} aria-label={TEXT_SIGN_UP}>
        Create an account
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
  apiKey?: string
  // if signin is success, which page of the app to jump to
  // so that user is not left on signin page
  redirectUrl?: string
}

export function SignInRequired({ children }: ISignInLayoutProps) {
  //const pathname = usePathname()
  //const [_redirectUrl, setRedirectUrl] = useState('')

  //const queryClient = useQueryClient()

  const { session } = useEdbAuth()

  // if (!loaded) {
  //   return null
  // }

  if (!session) {
    return (
      <AuthModal title={`${TEXT_SIGN_IN} Required`}>
        {/* <Card className="shadow-2xl w-lg text-sm">
          <CardHeader className="text-xl">
            <VCenterRow className="gap-x-2">
              <AppIcon w="w-10" />
              <CardTitle>{TEXT_SIGN_IN} Required</CardTitle>
            </VCenterRow>
          </CardHeader>
          <p>You need to sign in to view this page.</p>
        </Card> */}

        <p>You need to sign in to view this page.</p>
      </AuthModal>
    )
  } else {
    return children
  }
}

export function SignInLayout({
  signInMode = 'auth0', //username-password',
  signinRequired = true,
  showAccountButton = true,
  redirectUrl = '',
  className,

  children,
  ...props
}: ISignInLayoutProps) {
  let elem: ReactNode

  if (signinRequired) {
    elem = (
      <SignInRequired
        signInMode={signInMode}
        signinRequired={signinRequired}
        showAccountButton={showAccountButton}
        redirectUrl={redirectUrl}
        className={className}
      >
        {children}
      </SignInRequired>
    )
  } else {
    elem = children
  }

  //elem = children

  return (
    <HeaderLayout className={className} {...props}>
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
