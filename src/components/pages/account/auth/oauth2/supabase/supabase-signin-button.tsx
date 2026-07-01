'use client'

import { Button } from '@/themed/v2/button'

import {
  HOME_REDIRECT_STATE,
  IRedirectState,
} from '@/components/edb/auth/session'
import { OAUTH2_SUPABASE_SIGN_IN_PATH } from '@/components/edb/edb'
import { TEXT_SIGN_IN } from '@/consts'
import { redirect } from '@/lib/http/urls'

export function SupabaseSignInButton({
  state = HOME_REDIRECT_STATE,
}: {
  state: IRedirectState
}) {
  //const { redirect: redirectTo } = useEdbSession()

  // Allow users to signin
  return (
    <Button
      variant="secondary"
      //className="w-full"
      size="lg"
      onClick={() => {
        // setState(state)
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
