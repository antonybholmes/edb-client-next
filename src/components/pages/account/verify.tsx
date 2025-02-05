import { ThemeIndexLink } from '@components/link/theme-index-link'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from '@components/shadcn/ui/themed/card'

import { AlertsProvider } from '@components/alerts/alerts-provider'

import { bearerHeaders, redirect } from '@/lib/http/urls'
import { HeaderLayout } from '@layouts/header-layout'

import {
  API_VERIFY_EMAIL_URL,
  EDB_ACCESS_TOKEN_COOKIE,
  EDB_TOKEN_PARAM,
  SIGN_IN_ROUTE,
  SIGN_UP_ROUTE,
  TEXT_SIGN_UP,
} from '@/lib/edb/edb'

import { TEXT_SIGN_IN } from '@/consts'
import { httpFetch } from '@/lib/http/http-fetch'
import { useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { useEffect, useState } from 'react'

export interface ICallbackJwtPayload extends JwtPayload {
  data: string
  url: string
}

function VerifyPage() {
  const queryClient = useQueryClient()
  const queryParameters = new URLSearchParams(window.location.search)
  const jwt = queryParameters.get(EDB_TOKEN_PARAM) ?? ''
  //const url = queryParameters.get(EDB_URL_PARAM) ?? ""

  //const { accessToken } = useAccessTokenStore()
  //const { user } = useUserStore()
  const jwtData = jwtDecode<ICallbackJwtPayload>(jwt)

  const [isVerified, setIsVerified] = useState(
    Boolean(Cookies.get(EDB_ACCESS_TOKEN_COOKIE))
  )

  if (!jwt) {
    return (
      <CenteredCardContainer>
        <Card>
          <CardHeader>
            <CardTitle>You are not authorized to view this page.</CardTitle>
          </CardHeader>
        </Card>
      </CenteredCardContainer>
    )
  }

  async function verify() {
    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['verify'],
        queryFn: () =>
          httpFetch.postJson(
            API_VERIFY_EMAIL_URL,

            {
              headers: bearerHeaders(jwt),
            }
          ),
      })

      const success = res.data.success

      setIsVerified(success)

      // url encoded in jwt to make it more tamper proof
      const visitUrl = jwtData.url

      if (success && visitUrl) {
        redirect(visitUrl)
      }
    } catch {
      setIsVerified(false)
    }
  }

  useEffect(() => {
    verify()
  }, [])

  return (
    <HeaderLayout>
      <CenteredCardContainer>
        <Card>
          {isVerified ? (
            <>
              <CardHeader>
                <CardTitle>{`Thanks ${jwtData.data},`}</CardTitle>
                <CardDescription>
                  Your email address has been verified. To sign in, click the
                  link below.
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-row justify-end">
                <ThemeIndexLink href={SIGN_IN_ROUTE} aria-label="Sign In">
                  {TEXT_SIGN_IN}
                </ThemeIndexLink>
              </CardFooter>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle>You are not verified</CardTitle>
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

export function VerifyQueryPage() {
  return (
    <AlertsProvider>
      <VerifyPage />
    </AlertsProvider>
  )
}
