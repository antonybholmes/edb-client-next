import { ThemeIndexLink } from '@/components/link/theme-index-link'
import { config } from '@/config'
import { CenterLayout } from '@/layouts/center-layout'
import {
  signOutStateAtom,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { CoreProviders } from '@/providers/core-providers'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { AuthModal } from './auth-modal'

function SignedOutPage() {
  const [logoutState] = useAtom(signOutStateAtom)

  const [state, setState] = useState<IRedirectState | null>(null)

  useEffect(() => {
    if (logoutState.target.path) {
      setState(logoutState)
    }

    // force user to be refreshed
  }, [logoutState])

  // Redirect after 10 seconds to allow user to read message
  // useEffect(() => {
  //   if (state && state.target.path) {
  //     //safeRedirect(state.target.path , 10000)
  //   }
  // }, [state])

  return (
    <CenterLayout signinRequired={false} innerCls="gap-y-8">
      <AuthModal title={`You are signed out of ${config.name}`}>
        <p>It's a good idea to close all browser windows.</p>

        {state && state.target.title && state.target.path && (
          <ThemeIndexLink href={state.target.path}>
            Go to {state.target.title}
          </ThemeIndexLink>
        )}
      </AuthModal>
    </CenterLayout>
  )
}

export function SignedOutQueryPage() {
  return (
    <CoreProviders>
      <SignedOutPage />
    </CoreProviders>
  )
}
