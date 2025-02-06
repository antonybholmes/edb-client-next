'use client'

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from '@components/shadcn/ui/themed/card'

import { HeaderLayout } from '@layouts/header-layout'

import {
  APP_ACCOUNT_SIGNED_OUT_URL,
  EDB_ACCESS_TOKEN_COOKIE,
  EDB_SESSION_COOKIE,
  EDB_USER_COOKIE,
} from '@/lib/edb/edb'

import { useAuth0 } from '@auth0/auth0-react'

import { EdbAuthContext } from '@/lib/edb/edb-auth-provider'
import { CoreProviders } from '@providers/core-providers'
import Cookies from 'js-cookie'
import { useContext, useEffect } from 'react'
import { Auth0SignInButton } from './auth0-signin-button'

function SignOutPage() {
  const { signoutUser } = useContext(EdbAuthContext)

  const { logout } = useAuth0()

  useEffect(() => {
    // call signout
    async function signout() {
      try {
        await signoutUser()

        Cookies.remove(EDB_SESSION_COOKIE)
        Cookies.remove(EDB_ACCESS_TOKEN_COOKIE)
        Cookies.remove(EDB_USER_COOKIE)
      } catch (err) {
        console.error(err)
      }

      // auth0 logout
      logout({ logoutParams: { returnTo: APP_ACCOUNT_SIGNED_OUT_URL } }) // window.location.href } })
    }

    signout()
  }, [])

  return (
    <HeaderLayout>
      <CenteredCardContainer>
        <Card>
          <CardHeader>
            <CardTitle>You have been signed out</CardTitle>
            <CardDescription>
              It&apos;s a good idea to close all browser windows.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-row items-start gap-2">
            {/* <ButtonLink
              variant="theme"
              //className="w-full"
              size="lg"
              href={SIGN_IN_ROUTE}
              aria-label={TEXT_SIGN_IN}
            >
              {TEXT_SIGN_IN}
            </ButtonLink> */}

            <Auth0SignInButton />
          </CardFooter>
        </Card>

        {/* <CreateAccountLink /> */}
      </CenteredCardContainer>
    </HeaderLayout>
  )
}

export function SignOutQueryPage() {
  // const [url, setUrl] = useState('')

  // useEffect(() => {
  //   setUrl(window.location.href)
  // }, [])

  // if (!url) {
  //   return 'Getting page url...'
  // }

  return (
    <CoreProviders>
      <SignOutPage />
    </CoreProviders>
  )
}
