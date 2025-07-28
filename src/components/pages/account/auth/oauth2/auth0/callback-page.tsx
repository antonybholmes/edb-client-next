'use client'

import { VCenterRow } from '@layout/v-center-row'
import { REDIRECT_URL_PARAM } from '@lib/edb/edb'
import { useEdbAuth } from '@lib/edb/edb-auth'

import { useAuth0 } from '@auth0/auth0-react'
import { CoreProviders } from '@providers/core-providers'
import { Card, CardHeader, CardTitle } from '@themed/card'

import { AppIcon } from '@/components/icons/app-icon'
import { ThemeLink } from '@/components/link/theme-link'
import { APP_NAME } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import { useRouter, useSearchParams } from 'next/navigation'

import { useEffect, useState } from 'react'
import { invalidRedirectUrl } from '../signedout-page'

function CallbackPage() {
  const { signInWithAuth0 } = useEdbAuth()

  const router = useRouter()
  const searchParams = useSearchParams()

  const [redirectUrl, setRedirectUrl] = useState<string | null>(null)
  const { signout } = useEdbAuth()

  // useEffect(() => {
  //   //const queryParameters = new URLSearchParams(window.location.search)
  //   const param =
  //     searchParams.get(REDIRECT_URL_PARAM) || APP_ACCOUNT_SIGN_IN_URL
  //   setRedirectUrl(param)
  // }, [searchParams])

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

  const { getAccessTokenSilently, handleRedirectCallback } = useAuth0()

  useEffect(() => {
    async function processCallback() {
      try {
        const { appState } = await handleRedirectCallback()

        const auth0Token = await getAccessTokenSilently()

        console.log('auth0Token', auth0Token)

        await signInWithAuth0(auth0Token)

        let url = appState[REDIRECT_URL_PARAM]

        console.log('Redirect URL from appState:', appState)

        if (invalidRedirectUrl(url)) {
          // if login triggered from signout page, do not redirect back to it.
          // Instead goto account page. This stops login with immediate log out.
          url = '/' //MYACCOUNT_ROUTE
        }

        //console.log('Redirect URL from appState:', url, invalidRedirectUrl(url))

        setRedirectUrl(url)
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

  // useEffect(() => {
  //   async function load() {
  //     try {
  //       const auth0Token = await getAccessTokenSilently()

  //       console.log('auth0Token', auth0Token)

  //       await signInWithAuth0(auth0Token)

  //       // force user to be refreshed
  //     } catch (error) {
  //       console.error(error)
  //     }
  //   }

  //   if (isAuthenticated) {
  //     load()
  //   }
  // }, [isAuthenticated])

  // if (redirectUrl) {
  //   //console.log('ahda', redirectUrl)
  //   redirect(redirectUrl, REDIRECT_DELAY_MS)
  // }

  useEffect(() => {
    if (redirectUrl !== null) {
      // You can add validation or whitelist here for security
      console.log('Redirecting to:', redirectUrl)
      router.replace(redirectUrl)
    }
  }, [redirectUrl, router])

  return (
    <CenterLayout signedRequired="never">
      <Card className="shadow-lg w-128 p-8  text-sm" rounded="2xl">
        <CardHeader className="text-xl ">
          <VCenterRow className="gap-x-2 ">
            <AppIcon w="w-10" />
            <CardTitle>Signing in to {APP_NAME}...</CardTitle>
          </VCenterRow>
        </CardHeader>

        {redirectUrl ? (
          <p>
            Please wait while we sign you in. You will be redirected to
            <ThemeLink href={redirectUrl}>{redirectUrl}</ThemeLink> after we are
            finished.
          </p>
        ) : (
          <p>Please wait while we sign you in.</p>
        )}
      </Card>
    </CenterLayout>
  )
}

export function CallbackQueryPage() {
  return (
    <CoreProviders>
      <CallbackPage />
    </CoreProviders>
  )
}
