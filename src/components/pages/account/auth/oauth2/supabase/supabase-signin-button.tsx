'use client'

import { Button } from '@/themed/v2/button'

import { TEXT_SIGN_IN } from '@/consts'
import { OAUTH2_SUPABASE_SIGN_IN_PATH } from '@/lib/edb/edb'
import {
  DEFAULT_REDIRECT_STATE,
  signinStateAtom,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { redirect } from '@/lib/http/urls'
import { useAtom } from 'jotai'

export function SupabaseSignInButton({
  state = DEFAULT_REDIRECT_STATE,
}: {
  state: IRedirectState
}) {
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
        redirect(OAUTH2_SUPABASE_SIGN_IN_PATH)
      }}
      aria-label={TEXT_SIGN_IN}
    >
      {TEXT_SIGN_IN} with Supabase
    </Button>
  )
}
