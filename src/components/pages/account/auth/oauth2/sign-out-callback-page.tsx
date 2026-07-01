import {} from '@/components/edb/auth/edb-signin'
import { useEdbSession } from '@/components/edb/auth/session'
import { CoreProviders } from '@/providers/core-providers'
import { BaseSignOutPage } from '../sign-out-page'

export function SignOutCallbackPage() {
  const { redirectTarget } = useEdbSession()

  //const [state, setState] = useState<IRedirectState | null>(null)
  //const [logoutState] = useAtom(signOutStateAtom)

  // useEffect(() => {
  //   async function parse() {
  //     //const result = getRedirectStateFromURI()

  //     // could go directly to target, but better to go via signedout page

  //     if (logoutState.target.path) {
  //       const state = makeSignedOutRedirectRoute(logoutState)

  //       setState(state)
  //     }
  //   }

  //   parse()
  // }, [logoutState])

  return <BaseSignOutPage target={redirectTarget} allowRedirect={false} />
}

export function SignOutCallbackQueryPage() {
  return (
    <CoreProviders>
      <SignOutCallbackPage />
    </CoreProviders>
  )
}
