"use client";

import {
  APP_ACCOUNT_SIGN_IN_URL,
  APP_ACCOUNT_SIGNED_OUT_URL,
  CALLBACK_URL_PARAM,
} from "@/lib/edb/edb";
import { SignInLayout } from "@layouts/signin-layout";

import { useAuth0 } from "@auth0/auth0-react";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from "@components/shadcn/ui/themed/card";

import { TEXT_SIGN_IN, TEXT_SIGN_OUT } from "@/consts";
import { CoreProviders } from "@providers/core-providers";
import { useEffect, useState } from "react";
import { Auth0SignInButton } from "./auth0-signin-button";

// async function signIn(jwt: string): Promise<AxiosResponse> {
//   console.log("signin")

//   return await queryClient.fetchQuery("signin", async () => {
//     //const callbackUrl = `${SITE_URL}/login`

//     return axios.post(
//       SESSION_PASSWORDLESS_SIGNIN_URL,
//       {},

//       {
//         headers: bearerHeaders(jwt),
//         withCredentials: true,
//       },
//     )
//   })
// }

function SignInPage() {
  //const [isLoggedIn, setIsLoggedIn] = useState(false)

  const [callbackUrl, setCallbackUrl] = useState("");

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search);

    // used to reroute once authorized
    setCallbackUrl(
      queryParameters.get(CALLBACK_URL_PARAM) ?? APP_ACCOUNT_SIGN_IN_URL
    ); // ?? MYACCOUNT_ROUTE)

    //fetch()
  }, []);

  const {
    //isLoading,
    //isAuthenticated,
    //error,
    user,
    //handleRedirectCallback,

    logout,
  } = useAuth0();

  // useEffect(() => {
  //   async function processCallback() {
  //     try {
  //       const { appState } = await handleRedirectCallback()

  //       console.log(appState)

  //       setCallbackUrl(appState[CALLBACK_URL_PARAM])
  //     } catch (error) {
  //       console.error('Error handling redirect callback:', error)
  //     }
  //   }

  //   if (
  //     window.location.search.includes('code=') &&
  //     window.location.search.includes('state=')
  //   ) {
  //     processCallback()
  //   }
  // }, [handleRedirectCallback])

  // if (isLoading) {
  //   return <div>Loading...</div>
  // }

  // if user has been loaded, redirect to account page
  //if (edbUser && edbUser.uuid !== '') {
  //redirect(`${SIGNEDIN_ROUTE}?callbackUrl=${MYACCOUNT_ROUTE}`)
  //}

  // if (error) {
  //   console.log(error)
  //   return <div>Oops... {error.message}</div>
  // }

  if (user) {
    return (
      <div>
        Hello {user.name}{" "}
        <button
          onClick={() =>
            logout({ logoutParams: { returnTo: APP_ACCOUNT_SIGNED_OUT_URL } })
          }
        >
          {TEXT_SIGN_OUT}
        </button>
      </div>
    );
  }

  // Allow users to signin
  return (
    <SignInLayout showSignInError={false}>
      <CenteredCardContainer>
        <Card>
          <CardHeader>
            <CardTitle>{TEXT_SIGN_IN}</CardTitle>
            <CardDescription>
              To sign in to your account, click the button below. You can use
              your email address, Google or GitHub accounts.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-row items-start gap-2">
            <Auth0SignInButton callbackUrl={callbackUrl} />
          </CardFooter>
        </Card>

        {/* <CreateAccountLink /> */}
      </CenteredCardContainer>
    </SignInLayout>
  );
}

export function SignInQueryPage() {
  // const [url, setUrl] = useState('')

  // useEffect(() => {
  //   setUrl(window.location.href)
  // }, [])

  // if (!url) {
  //   return null
  // }

  return (
    <CoreProviders>
      <SignInPage />
    </CoreProviders>
  );
}
