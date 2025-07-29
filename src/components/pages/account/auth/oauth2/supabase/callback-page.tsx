// 'use client'

import { AppIcon } from '@/components/icons/app-icon'
import { HCenterCol } from '@/components/layout/h-center-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { ButtonLink } from '@/components/link/button-link'
import { ThemeLink } from '@/components/link/theme-link'
import { Card, CardHeader, CardTitle } from '@/components/shadcn/ui/themed/card'
import { APP_NAME, TEXT_SIGN_IN } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import { supabase } from '@/lib/auth/supabase'

import { APP_OAUTH2_SIGN_IN_ROUTE } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { redirect } from '@/lib/http/urls'
import { CircleAlert } from 'lucide-react'
import { useEffect, useState } from 'react'
import { REDIRECT_PARAM, invalidRedirectUrl } from '../signedout-page'

export function CallbackPage() {
  const [redirectUrl, setRedirectUrl] = useState('')
  const [error, setError] = useState('')
  const { signInWithSupabase } = useEdbAuth()

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Session error:', error)
        return
      }

      try {
        const auth0Token = data.session?.access_token || ''

        console.log('auth0Token', auth0Token)

        await signInWithSupabase(auth0Token)

        let url =
          new URLSearchParams(window.location.search).get(REDIRECT_PARAM) || '/'

        console.log('Redirect URL from query:', url, invalidRedirectUrl(url))

        if (!invalidRedirectUrl(url)) {
          // if login triggered from signout page, do not redirect back to it.
          // Instead goto account page. This stops login with immediate log out.
          console.log('Redirect URL from query:', url)

          setRedirectUrl(url)
        }

        // force user to be refreshed
      } catch (error) {
        console.error(error)
        setError(
          'We couldn’t complete the sign in process. This might be due to an expired session or network issue. Please try again later.'
        )
      }
    }

    load()
  }, [])

  if (redirectUrl) {
    console.log('Redirecting to:', redirectUrl)
    redirect(redirectUrl)
  }

  return (
    <CenterLayout signedRequired="never">
      {error !== '' ? (
        <HCenterCol className="gap-8">
          <Card className="border-red-300 w-100 text-center items-center shadow-md">
            <CircleAlert className="stroke-red-500 w-8 h-8" />

            {error}
          </Card>
          <ButtonLink
            variant="theme"
            href={APP_OAUTH2_SIGN_IN_ROUTE}
            size="lg"
            className="w-full"
          >
            {TEXT_SIGN_IN}
          </ButtonLink>
        </HCenterCol>
      ) : (
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
              <ThemeLink href={redirectUrl}>{redirectUrl}</ThemeLink> after we
              are finished.
            </p>
          ) : (
            <p>Please wait while we sign you in.</p>
          )}
        </Card>
      )}
    </CenterLayout>
  )
}
