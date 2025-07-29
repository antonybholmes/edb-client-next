// 'use client'

import {
  EDB_TOKEN_PARAM as EDB_JWT_PARAM,
  SESSION_AUTH_PASSWORDLESS_VALIDATE_URL,
} from '@lib/edb/edb'

import { useQueryClient } from '@tanstack/react-query'
import { jwtDecode } from 'jwt-decode'

import { SignIn } from '@/components/pages/account/auth/passwordless/signin'
import { CenterLayout } from '@/layouts/center-layout'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders, redirect } from '@lib/http/urls'
import { toast } from '@themed/crisp'
import { useEffect } from 'react'
import type { IRedirectUrlJwtPayload } from '../email/verify'

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

export function SignInPage() {
  //const url = queryParameters.get(EDB_URL_PARAM) ?? MYACCOUNT_ROUTE

  const queryClient = useQueryClient()

  //const [, acountDispatch] = useContext(AccountContext)

  useEffect(() => {
    async function signin() {
      const queryParameters = new URLSearchParams(window.location.search)
      const jwt = queryParameters.get(EDB_JWT_PARAM) ?? ''

      if (!jwt) {
        return
      }

      try {
        // first validate jwt and ensure no errors
        await queryClient.fetchQuery({
          queryKey: ['signin'],
          queryFn: () =>
            httpFetch.post(SESSION_AUTH_PASSWORDLESS_VALIDATE_URL, {
              headers: bearerHeaders(jwt),
              withCredentials: true,
            }),
        })

        toast({
          title: 'Signed in',
          description: 'You are signed in.',
        })

        // now extract visit url from token

        const jwtData = jwtDecode<IRedirectUrlJwtPayload>(jwt)

        // url encoded in jwt to make it more tamper proof
        const redirectUrl = jwtData.redirectUrl

        redirect(redirectUrl)
      } catch {
        // we encounted a login error
        toast({
          title: 'Sign in error',
          description: 'We were not able to sign you in.',
          variant: 'destructive',
        })
      }
    }
    //
    signin()
  }, [])

  return (
    <CenterLayout signedRequired="never">
      <SignIn />
    </CenterLayout>
  )
}
