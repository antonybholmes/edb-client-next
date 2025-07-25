// 'use client'

import { useAuth0 } from '@auth0/auth0-react'

import { Button } from '@themed/button'

import { TEXT_SIGN_IN } from '@/consts'

export function Auth0SignInButton({
  redirectUrl = '',
}: {
  redirectUrl?: string
}) {
  //const [isLoggedIn, setIsLoggedIn] = useState(false)

  const { loginWithRedirect } = useAuth0()

  // Allow users to signin
  return (
    <Button
      variant="theme"
      //className="w-full"
      size="lg"
      onClick={() => {
        const state = {
          redirectUrl,
        }

        loginWithRedirect({ appState: state })
      }}
      aria-label={TEXT_SIGN_IN}
    >
      {TEXT_SIGN_IN}
    </Button>
  )
}
