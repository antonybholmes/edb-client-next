import { supabase } from '@/lib/auth/supabase'

import { SIGNED_OUT_PATH } from '@/lib/edb/edb'
import { useEffect, useState } from 'react'

import {
  signOutStateAtom,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { redirect } from '@/lib/http/urls'
import { CoreProviders } from '@/providers/core-providers'
import { useAtom } from 'jotai'
import { BaseSignOutPage } from '../../sign-out-page'

export function SignOutPage() {
  const [state, setState] = useState<IRedirectState | null>(null)
  const [logoutState] = useAtom(signOutStateAtom)

  useEffect(() => {
    async function completeSignout() {
      try {
        await supabase.auth.signOut()
      } catch (error) {
        console.error('Error during signout:', error)
      }

      redirect(SIGNED_OUT_PATH)
    }
    completeSignout()
  }, [])

  useEffect(() => {
    if (logoutState && logoutState.target.path) {
      setState(logoutState)
    }
  }, [logoutState])

  return <BaseSignOutPage state={state} allowRedirect={false} />
}

export function SignOutQueryPage() {
  return (
    <CoreProviders>
      <SignOutPage />
    </CoreProviders>
  )
}
