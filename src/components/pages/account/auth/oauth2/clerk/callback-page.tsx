// 'use client'

import { ThemeIndexLink } from '@components/link/theme-index-link'
import { Apps } from '@components/pages/apps-page'
import { VCenterRow } from '@layout/v-center-row'
import {
  MYACCOUNT_ROUTE,
  REDIRECT_URL_PARAM,
  TEXT_MY_ACCOUNT,
} from '@lib/edb/edb'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { redirect, REDIRECT_DELAY_MS } from '@lib/http/urls'

import { useAuth } from '@clerk/clerk-react'
import { SignInLayout } from '@layouts/signin-layout'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from '@themed/card'
import { useEffect, useState } from 'react'
import { invalidRedirectUrl } from '../signedout-page'

export function CallbackPage() {
  //const { user } = useUser()
  const { getToken, isSignedIn } = useAuth()
  const { session, signInWithClerk } = useEdbAuth()
  const [redirectUrl, setRedirectUrl] = useState('')

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search)

    let url = queryParameters.get(REDIRECT_URL_PARAM) || '/'

    if (url) {
      // sanitize by trying to str
      //url = url.replace(STRIP_URL_REGEX, '')

      // url must be relative path as we don't allow redirects to random domains
      if (!invalidRedirectUrl(url)) {
        setRedirectUrl(url)
      }
    }

    // used to reroute once authorized
    //setRedirectUrl(url) // ?? MYACCOUNT_ROUTE)

    //fetch()
  }, [])

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

  // const {
  //   isLoading,
  //   isAuthenticated,
  //   getAccessTokenSilently,
  //   handleRedirectCallback,
  // } = useAuth0()

  // useEffect(() => {
  //   async function processCallback() {
  //     try {
  //       //const { appState } = await handleRedirectCallback()
  //       //setCallbackUrl(appState[CALLBACK_URL_PARAM])
  //     } catch (error) {
  //       console.error('Error handling redirect callback:', error)
  //     }
  //   }

  //   if (
  //     window.location.search.includes('code=') &&
  //     window.location.search.includes('state=')
  //   ) {
  //     processCallback()
  //   }
  // }, [handleRedirectCallback])

  useEffect(() => {
    async function load() {
      try {
        const token = await getToken()

        console.log('token', token)

        if (token) {
          // create session with token
          await signInWithClerk(token)
        }

        // force user to be refreshed
        //setUser(await refreshEdbUser())
      } catch (error) {
        console.error(error)
      }
    }

    if (isSignedIn) {
      load()
    }
  }, [isSignedIn])

  useEffect(() => {
    if (session && redirectUrl) {
      console.log('foward to ', redirectUrl)
      //window.location.href = redirectUrl

      redirect(redirectUrl, REDIRECT_DELAY_MS)
    }
  }, [session, redirectUrl])

  // if (isLoading) {
  //   return <div>Loading... Please wait.</div>
  // }

  // if (isAuthenticated && edbUser.uuid !== '' && callbackUrl) {
  //   setTimeout(() => {
  //     redirect(callbackUrl)
  //   }, FORWARD_DELAY_MS)
  // }

  // useEffect(() => {
  //   async function load() {
  //     const token = await getToken()
  //     console.log(token)
  //   }

  //   load()
  // }, [])

  return (
    <SignInLayout signedRequired="never">
      <CenteredCardContainer gap="gap-y-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>
              {session
                ? `Hi ${
                    session.user.firstName !== ''
                      ? session.user.firstName
                      : session.user.email
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
            </VCenterRow>
          </CardContent>
        </Card>

        <Apps />
      </CenteredCardContainer>
    </SignInLayout>
  )
}
