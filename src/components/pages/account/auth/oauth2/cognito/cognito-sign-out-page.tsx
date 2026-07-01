'use client'

import { CoreProviders } from '@/providers/core-providers'

import { useEdbSession } from '@/components/edb/auth/session'
import { BaseSignOutPage } from '../../sign-out-page'
import { cognitoSignout } from './cognito-signin-button'

export function SignOutPage() {
  //const [state, setState] = useState<IRedirectState | null>(null)
  const url = cognitoSignout()

  const { redirectTarget } = useEdbSession()

  return <BaseSignOutPage target={redirectTarget} allowRedirect={false} />
}

export function SignOutQueryPage() {
  return (
    <CoreProviders>
      <SignOutPage />
    </CoreProviders>
  )
}
