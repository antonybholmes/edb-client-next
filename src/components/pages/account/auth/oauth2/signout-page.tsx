'use client'

import { AppIcon } from '@/components/icons/app-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { Card, CardHeader, CardTitle } from '@/components/shadcn/ui/themed/card'
import { APP_NAME } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import { APP_ACCOUNT_AUTH_SIGNED_OUT_URL } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { REDIRECT_PARAM } from './signedout-page'

export function SignOutPage() {
  const { signout } = useEdbAuth()
  // const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    async function completeSignout() {
      try {
        await signout()
      } catch (e) {
        console.error('Error during signout:', e)
      }

      try {
        let url = searchParams.get(REDIRECT_PARAM) || '/'

        const redirectUrl = `${APP_ACCOUNT_AUTH_SIGNED_OUT_URL}${url ? `?${REDIRECT_PARAM}=${encodeURIComponent(url)}` : ''}`

        console.log('Redirect URL from query:', redirectUrl)

        //router.push(redirectUrl)

        window.location.href = redirectUrl

        // logout({
        //   logoutParams: {
        //     returnTo: redirectUrl,
        //   },
        // })
      } catch (e) {
        console.error('Error during signout:', e)
      }
    }
    completeSignout()
  }, [])

  return (
    <CenterLayout signedRequired={false}>
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
