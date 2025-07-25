// 'use client'

import { AppIcon } from '@/components/icons/app-icon'
import { FormInputError } from '@/components/input-error'
import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { Button } from '@/components/shadcn/ui/themed/button'
import { Card, CardHeader, CardTitle } from '@/components/shadcn/ui/themed/card'
import { Form, FormField, FormItem } from '@/components/shadcn/ui/themed/form'
import { Input } from '@/components/shadcn/ui/themed/input'
import { APP_NAME, TEXT_SIGN_IN } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { redirect } from '@/lib/http/urls'
import { useSignIn } from '@clerk/clerk-react'
import type { OAuthStrategy } from '@clerk/types'
import { zodResolver } from '@hookform/resolvers/zod'
import { HCenterCol } from '@layout/h-center-col'
import {
  APP_OAUTH2_CALLBACK_URL,
  APP_OAUTH2_CLERK_CALLBACK_ROUTE,
  MYACCOUNT_ROUTE,
  REDIRECT_URL_PARAM,
} from '@lib/edb/edb'
import { CoreProviders } from '@providers/core-providers'
import { useEffect, useRef, useState, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
export const FORWARD_DELAY_MS = 2000

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

//const STRIP_URL_REGEX = /^[^\/]*\//
const FormSchema = z.object({
  email: z.string().email({
    message: 'You must enter a valid email address.',
  }),
})

function SignInPage({ redirectTo = MYACCOUNT_ROUTE }: { redirectTo?: string }) {
  const { signIn, isLoaded, setActive } = useSignIn()

  const { settings } = useEdbSettings()

  const btnRef = useRef<HTMLButtonElement>(null)
  // const [email, setEmail] = useState(
  //   settings?.users.length > 0 ? settings.users[0]!.email : ''
  // )

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: settings?.users.length > 0 ? settings.users[0]!.email : '',
    },
  })

  const [redirectUrl, setRedirectUrl] = useState('')

  useEffect(() => {
    const queryParameters = new URLSearchParams(window.location.search)

    let url = queryParameters.get(REDIRECT_URL_PARAM)

    if (url) {
      // sanitize by trying to str
      //url = url.replace(STRIP_URL_REGEX, '')

      // url must be relative path as we don't allow redirects to random domains
      if (!url.startsWith('/')) {
        url = '/' + url
      }

      url = `${APP_OAUTH2_CLERK_CALLBACK_ROUTE}?redirectUrl=${url}`
    } else {
      url = APP_OAUTH2_CLERK_CALLBACK_ROUTE
    }

    // used to reroute once authorized
    setRedirectUrl(url) // ?? MYACCOUNT_ROUTE)

    //fetch()
  }, [])

  async function onSubmit(
    data: { email: string },
    e: BaseSyntheticEvent | undefined
  ) {
    e?.preventDefault()

    handleMagicLink(data.email)
  }

  async function handleMagicLink(email: string) {
    if (!isLoaded) {
      console.warn('Clerk is not loaded yet')
      return
    }

    try {
      const result = await signIn.create({
        identifier: email,
      })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })

        // ✅ Redirect here
        redirect(redirectUrl)
      } else if (result.status === 'needs_first_factor') {
        // collect password or verification code from user
        // const password = prompt('Enter your password')
        // const attempt = await signIn.attemptFirstFactor({
        //   strategy: 'email_code',
        // })
      } else {
        console.warn('Unexpected status:', result.status)
      }
    } catch (err: any) {
      console.error('Sign in error', err.errors)
    }
  }

  async function handleOAuth(strategy: OAuthStrategy) {
    if (!isLoaded) {
      console.warn('Clerk is not loaded yet')
      return
    }

    console.log('handleOAuth', strategy)

    const url = `${APP_OAUTH2_CALLBACK_URL}?redirect=${encodeURIComponent(redirectTo)}`

    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: url,
        redirectUrlComplete: url,
      })
    } catch (err) {
      console.error('OAuth sign-in failed:', err)
      // Optionally show an error message to the user
    }
  }

  // Allow users to signin
  return (
    <CenterLayout
      title={TEXT_SIGN_IN}
      signedRequired="never"
      showAccountButton={false}
    >
      <Card className="shadow-lg w-100 px-8 py-12 text-sm" rounded="2xl">
        <CardHeader className="text-xl ">
          <VCenterRow className="gap-x-2 ">
            <AppIcon w="w-10" />
            <CardTitle>Sign in to {APP_NAME}</CardTitle>
          </VCenterRow>
        </CardHeader>

        <BaseCol className="gap-y-3 text-sm pt-8">
          <Form {...form}>
            <form
              className="flex flex-col gap-y-2 text-sm"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="email"
                rules={{
                  required: {
                    value: true,
                    message: 'An email address is required',
                  },
                  // pattern: {
                  //   value: EMAIL_PATTERN,
                  //   message: TEXT_EMAIL_DESCRIPTION,
                  // },
                }}
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-y-1">
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      h="lg"
                      //error={"email" in form.formState.errors}
                      {...field}
                    ></Input>
                    <FormInputError error={form.formState.errors.email} />
                  </FormItem>
                )}
              />

              <button ref={btnRef} type="submit" className="hidden" />
            </form>

            <Button
              variant="theme"
              size="lg"
              //d///isabled={loading || !form.watch('email')}
              onClick={() => btnRef.current?.click()}
            >
              {TEXT_SIGN_IN} with Email
            </Button>
          </Form>

          {/* <Input
               type="email"
               placeholder="you@example.com"
               value={email}
               onTextChange={e => {
                 validateE
                 setEmail(e)}}
               h="lg"
             />
             <Button
               variant="theme"
               className="w-full"
               size="lg"
               onClick={handleMagicLink}
               disabled={loading || !email}
             >
                 {loading ? (
                 <Loader2 className="animate-spin h-4 w-4 mr-2" />
               ) : (
                 <Mail className="h-4 w-4 mr-2" />
               )} 
               Sign in with Email
             </Button> */}
        </BaseCol>

        <div className="relative text-center py-2">
          <span className="bg-background px-4 text-foreground/75 z-10 relative">
            or
          </span>
          <div className="absolute top-1/2 -translate-y-1/2 left-6 right-6 h-[2px] border-b border-border" />
        </div>

        <HCenterCol className="space-y-2 mt-2">
          <Button
            variant="secondary"
            className="w-full grid grid-cols-6"
            size="lg"
            onClick={() => handleOAuth('oauth_google')}
          >
            <img
              src="/images/google.svg"
              alt="Google"
              className="h-4.5 w-4.5"
            />
            <span className="text-center col-span-4">Continue with Google</span>
            <></>
          </Button>
          <Button
            variant="secondary"
            className="w-full grid grid-cols-6"
            size="lg"
            onClick={() => handleOAuth('oauth_github')}
          >
            <img
              src="/images/github-mark.svg"
              alt="Google"
              className="h-4.5 w-4.5"
            />
            <span className="col-span-4 text-center">Continue with GitHub</span>
            <></>
          </Button>
        </HCenterCol>
      </Card>
    </CenterLayout>
  )
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
  )
}
