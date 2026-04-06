// 'use client'

import {
  EDB_TOKEN_PARAM as EDB_JWT_PARAM,
  SESSION_AUTH_PASSWORDLESS_VALIDATE_URL,
} from '@/lib/edb/edb'

import { jwtDecode } from 'jwt-decode'

import { SignIn } from '@/components/pages/account/auth/passwordless/signin'
import { CenterLayout } from '@/layouts/center-layout'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders, redirect } from '@/lib/http/urls'
import { CoreProviders } from '@/providers/core-providers'

import { makeUuid } from '@/lib/id'
import { Toast } from '@base-ui/react/toast'
import { useEffect } from 'react'
import type { IRedirectUrlJwtPayload } from '../email/verify'

export function SignInPage() {
  const { add: addToast } = Toast.useToastManager()

  useEffect(() => {
    async function signin() {
      const queryParameters = new URLSearchParams(window.location.search)
      const jwt = queryParameters.get(EDB_JWT_PARAM) ?? ''

      if (!jwt) {
        return
      }

      try {
        // first validate jwt and ensure no errors
        await httpFetch.post(SESSION_AUTH_PASSWORDLESS_VALIDATE_URL, {
          headers: bearerHeaders(jwt),
          withCredentials: true,
        })

        addToast({
          id: makeUuid(),
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
        addToast({
          id: makeUuid(),
          title: 'Sign in error',
          description: 'We were not able to sign you in.',
          type: 'destructive',
        })
      }
    }
    //
    signin()
  }, [])

  return (
    <CenterLayout signinRequired={false}>
      <SignIn />
    </CenterLayout>
  )
}

export function SignInQueryPage() {
  return (
    <CoreProviders>
      <SignInPage />
    </CoreProviders>
  )
}
