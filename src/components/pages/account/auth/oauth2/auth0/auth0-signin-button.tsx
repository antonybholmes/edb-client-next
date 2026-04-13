// 'use client'

import { SignInIcon } from '@/components/icons/sign-in-icon'
import { Button } from '@/components/shadcn/ui/themed/v2/button'
import { TEXT_SIGN_IN } from '@/consts'
import {
  DEFAULT_REDIRECT_STATE,
  signinStateAtom,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { useAuth0 } from '@auth0/auth0-react'
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

// export function Auth0SignInButton({
//   state = DEFAULT_REDIRECT_STATE,
// }: {
//   state: IRedirectState
// }) {
//   console.log(`/auth/login?returnTo=${state.target.path}`)
//   return (
//     <ButtonLink
//       variant="theme"
//       size="lg"
//       aria-label={TEXT_SIGN_IN}
//       href={`/auth/login?returnTo=${state.target.path}`}
//     >
//       <SignInIcon stroke="" />
//       <span>{TEXT_SIGN_IN}</span>
//     </ButtonLink>
//   )
// }
