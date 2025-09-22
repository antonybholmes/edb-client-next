'use client'

import { AppIcon } from '@/components/icons/app-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { Card, CardHeader, CardTitle } from '@/components/shadcn/ui/themed/card'
import { APP_NAME } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export function invalidRedirectUrl(url: string): boolean {
  return (
    url.toLowerCase().includes('signin') ||
    url.toLowerCase().includes('login') ||
    url.toLowerCase().includes('signout') ||
    url.toLowerCase().includes('signedout') ||
    url.toLowerCase().includes('callback') ||
    !url.startsWith('/') ||
    url.includes(' ') ||
    url.includes('..') ||
    url.includes(':')
  )
}

export const REDIRECT_PARAM = 'redirect'

export function SignedOutPage() {
  //const [redirectUrl, setRedirectUrl] = useState('')
  const searchParams = useSearchParams()

  useEffect(() => {
    let url = searchParams.get(REDIRECT_PARAM) || '/'

    //window.location.href = url

    // force user to be refreshed
  }, [])

  // if (redirectUrl) {
  //   redirect(redirectUrl)
  // }

  return (
    <CenterLayout signedRequired={false}>
      <Card
        className="shadow-2xl w-128 text-sm"
        rounded="2xl"
        //variant="content"
      >
        <CardHeader className="text-xl ">
          <VCenterRow className="gap-x-2 ">
            <AppIcon w="w-10" />
            <CardTitle>You are signed out of {APP_NAME}</CardTitle>
          </VCenterRow>
        </CardHeader>

        <p className="py-4">
          It&apos;s a good idea to close all browser windows.
        </p>

        {/* <VCenterRow className="justify-end">
          <ThemeIndexLink href={APP_OAUTH2_SIGN_IN_ROUTE}>
            {TEXT_SIGN_IN}
          </ThemeIndexLink>
        </VCenterRow> */}
      </Card>
    </CenterLayout>
  )
}
