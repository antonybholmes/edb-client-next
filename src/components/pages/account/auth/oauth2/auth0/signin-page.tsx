// 'use client'

import { SignInLayout } from '@layouts/signin-layout'
import {
  APP_ACCOUNT_SIGN_IN_URL,
  REDIRECT_URL_PARAM,
  SIGN_OUT_ROUTE,
} from '@lib/edb/edb'

import { useAuth0 } from '@auth0/auth0-react'

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@themed/card'

import { TEXT_SIGN_IN, TEXT_SIGN_OUT } from '@/consts'
import { CenterCol } from '@layout/center-col'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { redirect } from '@lib/http/urls'
import { CoreProviders } from '@providers/core-providers'
import { useEffect, useState } from 'react'
import { Auth0SignInButton } from './auth0-signin-button'

// async function signIn(jwt: string): Promise<AxiosResponse> {
//   console.log("signin")

//   return await queryClient.fetchQuery("signin", async () => {
//     //const callbackUrl = `${SITE_URL}/login`

//     return axios.post(
//       SESSION_PASSWORDLESS_SIGNIN_URL,
//       {},

//       {
//         headers: bearerHeaders(jwt),
//         withCredentials: true,
//       },
//     )
//   })
// }

function SignInPage() {
  //const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [redirectUrl, setRedirectUrl] = useState('')
  const { signout } = useEdbAuth()

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search)

    // used to reroute once authorized
    setRedirectUrl(
      queryParameters.get(REDIRECT_URL_PARAM) ?? APP_ACCOUNT_SIGN_IN_URL
    ) // ?? MYACCOUNT_ROUTE)

    //fetch()
  }, [])

  const {
    //isLoading,
    //isAuthenticated,
    //error,
    user,
    //handleRedirectCallback,
  } = useAuth0()

  if (user) {
    return (
      <div>
        Hello {user.name}{' '}
        <button
          onClick={() => {
            redirect(SIGN_OUT_ROUTE)
            signout()
          }}
        >
          {TEXT_SIGN_OUT}
        </button>
      </div>
    )
  }

  // Allow users to signin
  return (
    <SignInLayout signedRequired="never">
      <CenterCol>
        <Card className="w-1/2 lg:w-1/3">
          <CardHeader>
            <CardTitle>{TEXT_SIGN_IN}</CardTitle>
            <CardDescription>
              To sign in to your account through Auth0, click the button below.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-row justify-end gap-2">
            <Auth0SignInButton redirectUrl={redirectUrl} />
          </CardFooter>
        </Card>

        {/* <CreateAccountLink /> */}
      </CenterCol>
    </SignInLayout>
  )
}

export function SignInQueryPage() {
  // const [url, setUrl] = useState('')

  // useEffect(() => {
  //   setUrl(window.location.href)
  // }, [])

  // if (!url) {
  //   return null
  // }

  return (
    <CoreProviders>
      <SignInPage />
    </CoreProviders>
  )
}
