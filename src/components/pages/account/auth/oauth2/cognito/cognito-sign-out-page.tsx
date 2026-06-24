'use client'

import { CoreProviders } from '@/providers/core-provider'
import { useEffect, useState } from 'react'

import {
  signOutStateAtom,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { useAtom } from 'jotai'
import { BaseSignOutPage } from '../../sign-out-page'
import { cognitoSignout } from './cognito-signin-button'

export function SignOutPage() {
  const [state, setState] = useState<IRedirectState | null>(null)
  const url = cognitoSignout()
  const [logoutState] = useAtom(signOutStateAtom)

  useEffect(() => {
    if (url && logoutState && logoutState.target.path) {
      setState({ target: { title: logoutState.target.title, path: url } })
    }
  }, [logoutState, url])

  return <BaseSignOutPage state={state} />
}

export function SignOutQueryPage() {
  return (
    <CoreProviders>
      <SignOutPage />
    </CoreProviders>
  )
}
