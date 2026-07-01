'use client'

import { Button } from '@/themed/v2/button'

import {} from '@/components/edb/auth/edb-signin'
import {
  HOME_REDIRECT_STATE,
  IRedirectState,
  useEdbSession,
} from '@/components/edb/auth/session'
import { APP_ACCOUNT_OAUTH2_CLERK_SIGNIN_CALLBACK_URL } from '@/components/edb/edb'
import { TEXT_SIGN_IN } from '@/consts'
import { useClerk } from '@clerk/react'

export function ClerkSignInButton({
  state = HOME_REDIRECT_STATE,
}: {
  state: IRedirectState
}) {
  //const { openSignIn } = useClerk()
  const { redirectToSignIn } = useClerk()
  //const [, setState] = useAtom(signinStateAtom)

  const { setRedirect } = useEdbSession()

  // Allow users to signin
  return (
    <Button
      variant="secondary"
      //className="w-full"
      size="lg"
      onClick={() => {
        setRedirect(state.target)
        // openSignIn({
        //   fallbackRedirectUrl: state.target.path || APP_MYACCOUNT_URL,
        // })
        redirectToSignIn({
          redirectUrl: APP_ACCOUNT_OAUTH2_CLERK_SIGNIN_CALLBACK_URL,
        })
      }}
      aria-label={TEXT_SIGN_IN}
    >
      {TEXT_SIGN_IN} with Clerk
    </Button>
  )
}
