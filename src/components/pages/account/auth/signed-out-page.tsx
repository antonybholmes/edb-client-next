'use client'

import { useEdbSession } from '@/components/edb/auth/session'
import { ThemeIndexLink } from '@/components/link/theme-index-link'
import { config } from '@/config'
import { CenterLayout } from '@/layouts/center-layout'
import { CoreProviders } from '@/providers/core-providers'
import { AuthModal } from './auth-modal'

function SignedOutPage() {
  const { redirectTarget } = useEdbSession()

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

        {redirectTarget && redirectTarget.title && redirectTarget.path && (
          <ThemeIndexLink href={redirectTarget.path}>
            Go to {redirectTarget.title}
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
