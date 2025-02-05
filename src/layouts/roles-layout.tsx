import { BaseCol } from '@/components/layout/base-col'

import { HCenterRow } from '@/components/layout/h-center-row'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@components/shadcn/ui/themed/card'

import { EdbAuthContext } from '@/lib/edb/edb-auth-provider'
import { useContext } from 'react'
import { SignInLayout, type ISignInLayoutProps } from './signin-layout'

function notAllowedContent() {
  return (
    <HCenterRow className="grow items-center">
      <BaseCol className="w-4/5 gap-y-8 text-sm lg:w-1/2 xl:w-1/3">
        <Card className="text-sm">
          <CardHeader>
            <CardTitle>Permission not granted</CardTitle>
          </CardHeader>
          <CardContent>
            You do not have sufficient permissions to view this page.
          </CardContent>
        </Card>
      </BaseCol>
    </HCenterRow>
  )
}

// interface IRolesLayout extends ISignInLayoutProps {
//   roles?: string[]
// }

export function RolesLayout({ children, ...props }: ISignInLayoutProps) {
  //const queryParameters = new URLSearchParams(window.location.search)

  //const signedIn = userIsSignedIn()

  // some other page needs to force reload account details either
  // passwordless or regular so that on refresh this page can see if
  // the details have been loaded
  //const { accessToken } = useAccessTokenStore()
  const { edbUser } = useContext(EdbAuthContext)

  // const [accessToken, setAccessToken] = useState('')
  // const [accessContents, setAccessContents] =
  //   useState<IAccessJwtPayload | null>(null)

  // useEffect(() => {
  //   async function fetch() {
  //     setAccessToken(await getAccessTokenAutoRefresh())
  //   }

  //   fetch()
  // }, [])

  // useEffect(() => {
  //   if (accessToken) {
  //     setAccessContents(getAccessTokenContents(accessToken))
  //   }
  // }, [accessToken])

  const roles = edbUser.roles.join(',')

  const isAdmin = roles.includes('Super') || roles.includes('Admin')

  // //if we are not admin assume cannot view page
  // // and verify we can
  // if (accessContents && notAllowed && roles) {
  //   for (let role of roles) {
  //     if (accessContents.roles.includes(role)) {
  //       notAllowed = false
  //       break
  //     }
  //   }
  // }

  return (
    <SignInLayout {...props}>
      {isAdmin ? children : notAllowedContent()}
    </SignInLayout>
  )
}
