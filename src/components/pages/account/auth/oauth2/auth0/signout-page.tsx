'use client'

import { AppIcon } from '@/components/icons/app-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { Card, CardHeader, CardTitle } from '@/components/shadcn/ui/themed/card'
import { APP_NAME } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import { APP_OAUTH2_SIGNED_OUT_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { useAuth0 } from '@auth0/auth0-react'
import { useEffect } from 'react'
import { REDIRECT_PARAM } from '../signedout-page'

export function SignOutPage() {
  const { logout } = useAuth0()
  const { signout } = useEdbAuth()

  useEffect(() => {
    async function completeSignout() {
      signout()

      let url =
        new URLSearchParams(window.location.search).get(REDIRECT_PARAM) || '/'

      const redirectUrl = `${APP_OAUTH2_SIGNED_OUT_URL}${url ? `?redirect=${encodeURIComponent(url)}` : ''}`

      console.log('Redirect URL from query:', redirectUrl)

      logout({
        logoutParams: {
          returnTo: redirectUrl,
        },
      })
    }
    completeSignout()
  }, [])

  return (
    <CenterLayout signedRequired="never">
      <Card className="shadow-2xl w-128 text-sm" rounded="2xl">
        <CardHeader className="text-xl">
          <VCenterRow className="gap-x-2">
            <AppIcon w="w-10" />
            <CardTitle>Signing you out of {APP_NAME}...</CardTitle>
          </VCenterRow>
        </CardHeader>
        <p>Please wait while we sign you out.</p>
      </Card>
    </CenterLayout>
  )
}
