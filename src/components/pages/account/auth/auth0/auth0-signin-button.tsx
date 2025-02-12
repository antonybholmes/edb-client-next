'use client'

import { APP_MYACCOUNT_URL } from '@/lib/edb/edb'

import { useAuth0 } from '@auth0/auth0-react'

import { Button } from '@components/shadcn/ui/themed/button'

import { TEXT_SIGN_IN } from '@/consts'

export function Auth0SignInButton({
  callbackUrl = '',
}: {
  callbackUrl?: string
}) {
  //const [isLoggedIn, setIsLoggedIn] = useState(false)

  const { loginWithRedirect } = useAuth0()

  // Allow users to signin
  return (
    <Button
      variant="theme"
      //className="w-full"
      size="lg"
      pad="lg"
      onClick={() => {
        const state = {
          callbackUrl: callbackUrl ? callbackUrl : APP_MYACCOUNT_URL,
        }

        loginWithRedirect({ appState: state })
      }}
      aria-label={TEXT_SIGN_IN}
    >
      {TEXT_SIGN_IN}
    </Button>
  )
}
