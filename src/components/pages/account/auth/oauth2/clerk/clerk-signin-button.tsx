// 'use client'

import { APP_MYACCOUNT_URL } from '@lib/edb/edb'

import { Button } from '@themed/button'

import { TEXT_SIGN_IN } from '@/consts'
import { useClerk } from '@clerk/clerk-react'

export function ClerkSignInButton({
  callbackUrl = '',
}: {
  callbackUrl?: string
}) {
  const { openSignIn } = useClerk()

  // Allow users to signin
  return (
    <Button
      variant="theme"
      //className="w-full"
      size="lg"
      onClick={() => {
        openSignIn({
          fallbackRedirectUrl: callbackUrl ? callbackUrl : APP_MYACCOUNT_URL,
        })
      }}
      aria-label={TEXT_SIGN_IN}
    >
      {TEXT_SIGN_IN}
    </Button>
  )
}
