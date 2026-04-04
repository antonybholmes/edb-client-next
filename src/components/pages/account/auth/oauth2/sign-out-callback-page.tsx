import {
  makeSignedOutRedirectRoute,
  signOutStateAtom,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { CoreProviders } from '@/providers/core-providers'
import { useAtom } from 'jotai'
import { useEffect, useState } from 'react'
import { BaseSignOutPage } from '../sign-out-page'

export function SignOutCallbackPage() {
  const [state, setState] = useState<IRedirectState | null>(null)
  const [logoutState] = useAtom(signOutStateAtom)

  useEffect(() => {
    async function parse() {
      //const result = getRedirectStateFromURI()

      // could go directly to target, but better to go via signedout page

      if (logoutState.target.path) {
        const state = makeSignedOutRedirectRoute(logoutState)

        setState(state)
      }
    }

    parse()
  }, [logoutState])

  console.log('SignOutCallbackPage, logoutState:', logoutState)

  return <BaseSignOutPage state={state} />
}

export function SignOutCallbackQueryPage() {
  return (
    <CoreProviders>
      <SignOutCallbackPage />
    </CoreProviders>
  )
}
