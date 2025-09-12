import { ThemeIndexLink } from '@components/link/theme-index-link'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from '@themed/card'

import { HeaderLayout } from '@layouts/header-layout'
import { bearerHeaders } from '@lib/http/urls'

import {
  API_EMAIL_VERIFIED_URL,
  EDB_ACCESS_TOKEN_COOKIE,
  EDB_TOKEN_PARAM,
  OAUTH2_SIGN_IN_ROUTE,
  SIGN_UP_ROUTE,
  TEXT_SIGN_UP,
} from '@lib/edb/edb'

import { TEXT_SIGN_IN } from '@/consts'
import { httpFetch } from '@lib/http/http-fetch'
import { useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { useEffect, useState } from 'react'

export interface IRedirectUrlJwtPayload extends JwtPayload {
  data: string
  redirectUrl: string
}

export function VerifyPage() {
  const queryClient = useQueryClient()

  //const url = queryParameters.get(EDB_URL_PARAM) ?? ""

  //const { accessToken } = useAccessTokenStore()
  //const { user } = useUserStore()

  // if (!jwt) {
  //   return (
  //     <CenteredCardContainer>
  //       <Card>
  //         <CardHeader>
  //           <CardTitle>You are not authorized to view this page.</CardTitle>
  //         </CardHeader>
  //       </Card>
  //     </CenteredCardContainer>
  //   )
  // }

  const [isVerified, setIsVerified] = useState(
    Boolean(Cookies.get(EDB_ACCESS_TOKEN_COOKIE))
  )

  const [firstName, setFirstName] = useState('')

  useEffect(() => {
    async function verify() {
      const queryParameters = new URLSearchParams(window.location.search)
      const jwt = queryParameters.get(EDB_TOKEN_PARAM) ?? ''
      const jwtData = jwtDecode<IRedirectUrlJwtPayload>(jwt)

      try {
        const res = await queryClient.fetchQuery({
          queryKey: ['verify'],
          queryFn: () =>
            httpFetch.postJson<{ data: { success: boolean } }>(
              API_EMAIL_VERIFIED_URL,
              {
                headers: bearerHeaders(jwt),
              }
            ),
        })

        const success: boolean = res.data.success

        setIsVerified(success)
        setFirstName(jwtData.data)

        // url encoded in jwt to make it more tamper proof
        //const visitUrl = jwtData.redirectUrl

        // if (success && visitUrl) {
        //   redirect(visitUrl, 2000)
        // }
      } catch {
        setIsVerified(false)
      }
    }

    verify()
  }, [])

  return (
    <HeaderLayout>
      <CenteredCardContainer>
        <Card>
          {isVerified ? (
            <>
              <CardHeader>
                <CardTitle>{`Thanks ${firstName},`}</CardTitle>
                <CardDescription>
                  Your email address has been verified. To sign in, click the
                  link below.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-row justify-end">
                <ThemeIndexLink
                  href={OAUTH2_SIGN_IN_ROUTE}
                  aria-label="Sign In"
                >
                  {TEXT_SIGN_IN}
                </ThemeIndexLink>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>Your email address is not verified</CardTitle>
                <CardDescription>
                  To sign up click the button below.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-row justify-end">
                <ThemeIndexLink href={SIGN_UP_ROUTE} aria-label={TEXT_SIGN_UP}>
                  {TEXT_SIGN_UP}
                </ThemeIndexLink>
              </CardFooter>
            </>
          )}
        </Card>
      </CenteredCardContainer>
    </HeaderLayout>
  )
}
