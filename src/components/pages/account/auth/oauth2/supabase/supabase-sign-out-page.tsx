import { supabase } from '@/lib/auth/supabase'

import { SIGNED_OUT_PATH } from '@/components/edb/edb'
import { useEffect } from 'react'

import { useEdbSession } from '@/components/edb/auth/session'
import { redirect } from '@/lib/http/urls'
import { CoreProviders } from '@/providers/core-providers'
import { BaseSignOutPage } from '../../sign-out-page'

export function SignOutPage() {
  //const [state, setState] = useState<IRedirectState | null>(null)
  //const [logoutState] = useAtom(signOutStateAtom)
  const { redirectTarget } = useEdbSession()

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

  // useEffect(() => {
  //   if (logoutState && logoutState.target.path) {
  //     setState(logoutState)
  //   }
  // }, [logoutState])

  return <BaseSignOutPage target={redirectTarget} allowRedirect={false} />
}

export function SignOutQueryPage() {
  return (
    <CoreProviders>
      <SignOutPage />
    </CoreProviders>
  )
}
