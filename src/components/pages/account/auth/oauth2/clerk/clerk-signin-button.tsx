'use client'

import { Button } from '@/themed/v2/button'

import { TEXT_SIGN_IN } from '@/consts'
import { APP_ACCOUNT_OAUTH2_CLERK_SIGNIN_CALLBACK_URL } from '@/lib/edb/edb'
import {
  DEFAULT_REDIRECT_STATE,
  signinStateAtom,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { useClerk } from '@clerk/react'
import { useAtom } from 'jotai'

export function ClerkSignInButton({
  state = DEFAULT_REDIRECT_STATE,
}: {
  state: IRedirectState
}) {
  //const { openSignIn } = useClerk()
  const { redirectToSignIn } = useClerk()
  const [, setState] = useAtom(signinStateAtom)

  // Allow users to signin
  return (
    <Button
      variant="secondary"
      //className="w-full"
      size="lg"
      onClick={() => {
        setState(state)
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
