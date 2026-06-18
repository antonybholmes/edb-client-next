'use client'

import { useAuth0 } from '@auth0/auth0-react'

import { Button } from '@/themed/v2/button'

import { SignInIcon } from '@/components/icons/sign-in-icon'
import { TEXT_SIGN_IN } from '@/consts'
import {
  DEFAULT_REDIRECT_STATE,
  signinStateAtom,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { useAtom } from 'jotai'

// export function auth0SignIn(
//   loginWithRedirect: (options?: {
//     appState?: Record<string, unknown>
//   }) => Promise<void>,
//   state: IRedirectState | null = DEFAULT_REDIRECT_STATE
// ) {
//   const target = {
//     title: state?.target.title || document.title || 'Home',
//     path: state?.target.path || window.location.pathname || '/',
//   }

//   const newState = {
//     [STATE_PARAM]: { target },
//   }

//   console.log('EDBSignIn: loginWithRedirect state', newState)
//   loginWithRedirect({ appState: newState })
// }

export function Auth0SignInButton({
  state = DEFAULT_REDIRECT_STATE,
}: {
  state: IRedirectState
}) {
  const [, setSigninState] = useAtom(signinStateAtom)

  const { loginWithRedirect } = useAuth0()

  // Allow users to signin
  return (
    <Button
      variant="theme"
      size="lg"
      aria-label={TEXT_SIGN_IN}
      onClick={() => {
        setSigninState(state)
        console.log('Auth0SignInButton, state:', state)
        loginWithRedirect({ appState: state })
      }}
    >
      <SignInIcon stroke="" />
      <span>{TEXT_SIGN_IN}</span>
    </Button>
  )
}
