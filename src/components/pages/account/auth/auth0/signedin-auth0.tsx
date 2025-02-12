'use client'

import { VCenterRow } from '@/components/layout/v-center-row'
import { MYACCOUNT_ROUTE, TEXT_MY_ACCOUNT } from '@/lib/edb/edb'
import { EdbAuthContext } from '@/lib/edb/edb-auth-provider'

import { useAuth0 } from '@auth0/auth0-react'
import { ThemeIndexLink } from '@components/link/theme-index-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from '@components/shadcn/ui/themed/card'
import { SignInLayout } from '@layouts/signin-layout'
import { CoreProviders } from '@providers/core-providers'

import { useContext, useEffect } from 'react'

function SignedInPage() {
  const { edbUser, signInWithAuth0Token } = useContext(EdbAuthContext)

  //const [user, setUser] = useState<IUser | null>(null)

  // useEffect(() => {
  //   // async function fetch() {
  //   //   setUser(await getCachedUser())
  //   // }

  //   console.log(window.location.search, 'ss')

  //   const queryParameters = new URLSearchParams(window.location.search)

  //   // used to reroute once authorized
  //   setCallbackUrl(queryParameters.get(CALLBACK_URL_PARAM) ?? '') // ?? MYACCOUNT_ROUTE)

  //   //fetch()
  // }, [])

  // useEffect(() => {
  //   if (callbackUrl) {
  //     // if (process.env.NODE_ENV !== "development" && accessToken && url) {
  //     setTimeout(() => {
  //       redirect(callbackUrl)
  //     }, FORWARD_DELAY_MS)
  //   }
  // }, [callbackUrl])

  // if (!user) {
  //   return null
  // }

  const {
    isLoading,
    isAuthenticated,
    getAccessTokenSilently,
    handleRedirectCallback,
  } = useAuth0()

  useEffect(() => {
    async function processCallback() {
      try {
        //const { appState } = await handleRedirectCallback()
        //setCallbackUrl(appState[CALLBACK_URL_PARAM])
      } catch (error) {
        console.error('Error handling redirect callback:', error)
      }
    }

    if (
      window.location.search.includes('code=') &&
      window.location.search.includes('state=')
    ) {
      processCallback()
    }
  }, [handleRedirectCallback])

  useEffect(() => {
    async function load() {
      try {
        const auth0Token = await getAccessTokenSilently()

        //console.log('auth0Token', auth0Token)

        await signInWithAuth0Token(auth0Token)

        // force user to be refreshed
        //setUser(await refreshEdbUser())
      } catch (error) {
        console.error(error)
      }
    }

    if (isAuthenticated) {
      load()
    }
  }, [isAuthenticated])

  if (isLoading) {
    return <div>Loading... Please wait.</div>
  }

  // if (isAuthenticated && edbUser.uuid !== '' && callbackUrl) {
  //   setTimeout(() => {
  //     redirect(callbackUrl)
  //   }, FORWARD_DELAY_MS)
  // }

  return (
    <SignInLayout showSignInError={false}>
      <CenteredCardContainer>
        <Card>
          <CardHeader>
            <CardTitle>
              {edbUser.uuid !== ''
                ? `Hi ${
                    edbUser.firstName !== '' ? edbUser.firstName : edbUser.email
                  },`
                : 'Waiting for account data to load...'}
            </CardTitle>

            <CardDescription>
              You can now view your account profile.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <VCenterRow>
              <ThemeIndexLink
                href={MYACCOUNT_ROUTE}
                aria-label={TEXT_MY_ACCOUNT}
              >
                {TEXT_MY_ACCOUNT}
              </ThemeIndexLink>

              {/* <button
                onClick={() =>
                  logout({
                    logoutParams: { returnTo: APP_ACCOUNT_SIGNED_OUT_URL },
                  })
                }
              >
                {TEXT_SIGN_OUT}
              </button> */}
            </VCenterRow>
          </CardContent>
        </Card>
      </CenteredCardContainer>
    </SignInLayout>
  )
}

export function SignedInQueryPage() {
  return (
    <CoreProviders>
      <SignedInPage />
    </CoreProviders>
  )
}
