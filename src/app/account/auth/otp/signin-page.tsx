'use client'

import { AppIcon } from '@/components/icons/app-icon'
import { FormInputError } from '@/components/input-error'
import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  Form,
  FormField,
  FormItem,
} from '@/components/shadcn/ui/themed/v2/form'
import { Label } from '@/components/shadcn/ui/themed/v2/label'
import { TEXT_SIGN_IN } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import { MYACCOUNT_PATH, TEXT_MY_ACCOUNT } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { Card, CardHeader, CardTitle } from '@/themed/card'

import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'
import { zodResolver } from '@hookform/resolvers/zod'

import { ArrowRight } from 'lucide-react'

import { ThemeLink } from '@/components/link/theme-link'
import { config } from '@/config'
import {
  getRedirectStateFromURI,
  isSafeRelativeUrl,
  safeRedirect,
  type IRedirectState,
} from '@/lib/edb/signin/edb-signin'
import { makeUuid } from '@/lib/id'
import { addPeriod, capitalizeFirstWord } from '@/lib/text/capital-case'
import { CoreProviders } from '@/providers/core-provider'
import { Toast } from '@base-ui/react/toast'
import { useEffect, useRef, useState, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

const FormSchema = z.object({
  email: z.email({
    message: 'You must enter a valid email address.',
  }),
  otp: z
    .string()
    .regex(/^\d{6}$/, { message: 'You must enter a 6-digit code.' }),
})

export function SignInPage() {
  const [otpSent, setOTPSent] = useState(false)
  const { settings } = useEdbSettings()
  const { sendOTP, signInWithEmailOTP, session } = useEdbAuth()
  const [state, setState] = useState<IRedirectState | null>(null)

  const btnRef = useRef<HTMLButtonElement>(null)

  const { add: addToast } = Toast.useToastManager()

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      otp: '',
    },
  })

  useEffect(() => {
    setState(
      getRedirectStateFromURI({
        target: { title: TEXT_MY_ACCOUNT, path: MYACCOUNT_PATH },
      })
    )
  }, [])

  useEffect(() => {
    if (settings.users.length! > 0) {
      const email = settings.users[0]?.email
      if (email) {
        form.setValue('email', email)
      }
    }
  }, [settings, form])

  async function onSubmit(
    data: { email: string; otp: string },
    e: BaseSyntheticEvent | undefined
  ) {
    e?.preventDefault()

    try {
      await signInWithEmailOTP(data.email, data.otp)

      let url = state?.target.path ?? MYACCOUNT_PATH

      if (!isSafeRelativeUrl(url)) {
        url = MYACCOUNT_PATH
      }

      //router.push(url)
      safeRedirect(url)
    } catch (error) {
      addToast({
        id: makeUuid(),
        title: config.name,
        description:
          'The sign in failed. Please check the one-time code and try again.',
        type: 'destructive',
      })
    }

    // const { error } = await supabase.auth.signInWithOtp({
    //   email,
    //   options: {
    //     emailRedirectTo: `${APP_OAUTH2_CALLBACK_URL}?redirect=${redirectTo}`,
    //   },
    // })
    // setLoading(false)

    // if (error) {
    //   //alert(error.message)

    //   toast({
    //     title: APP_NAME,
    //     description: error.message,
    //     variant: 'destructive',
    //   })
    // } else {
    //   //alert('Check your email for a login link!')

    //   toast({
    //     title: 'Success',
    //     variant: 'success',
    //     description: 'Check your email for a sign in link!',
    //     //variant: 'destructive',
    //   })
    // }
  }

  async function sendCode(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault()

    const isValid = await form.trigger('email')

    if (isValid) {
      try {
        await sendOTP(form.getValues('email'))

        setOTPSent(true)

        addToast({
          id: makeUuid(),
          title: config.name,
          description:
            'If the email address is valid, you will receive a 6-digit code.',
        })
      } catch (error) {
        addToast({
          id: makeUuid(),
          title: 'We were unable to send you a code',
          description:
            error instanceof Error
              ? addPeriod(capitalizeFirstWord(error.message))
              : 'Error sending code.',
          type: 'destructive',
        })
      }
    }
  }

  return (
    <CenterLayout
      title={TEXT_SIGN_IN}
      signinRequired={false}
      //
      innerCls="gap-y-8"
    >
      {session && session.user && (
        <BaseCol className="items-center gap-y-2">
          <p className="font-bold text-lg">
            Hi{' '}
            <a href={MYACCOUNT_PATH} className="hover:underline">
              {session.user.name || session.user.email}
            </a>
            , you are already signed in.
          </p>
          <p>
            {state?.target && (
              <ThemeLink href={state.target.path} className="hover:underline">
                Go to {state.target.title ?? TEXT_MY_ACCOUNT}
              </ThemeLink>
            )}
          </p>
        </BaseCol>
      )}

      <Card
        className="shadow-2xl gap-y-8 w-120 text-sm p-10"
        rounded="2xl"
        //variant="simple"
      >
        <CardHeader className="text-xl">
          <VCenterRow className="gap-x-2">
            <AppIcon size={2} />
            <CardTitle>
              {TEXT_SIGN_IN} to {config.name}
            </CardTitle>
          </VCenterRow>
        </CardHeader>

        <BaseCol className="gap-y-8 text-sm">
          <Form {...form}>
            <form
              className="flex flex-col gap-y-4 text-sm"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-y-1">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      h="xl"
                      variant="alt"
                      //error={"email" in form.formState.errors}
                      {...field}
                    />
                    <FormInputError error={form.formState.errors.email} />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col gap-y-2">
                    <Label htmlFor="otp" className="text-sm font-medium">
                      6 Digit One-Time Passcode
                    </Label>
                    <VCenterRow className="gap-x-4">
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        h="xl"
                        variant="alt"
                        {...field}
                      />
                    </VCenterRow>

                    <FormInputError error={form.formState.errors.otp} />
                  </FormItem>
                )}
              />

              {otpSent && (
                <button
                  className="text-sm text-theme hover:underline"
                  disabled={!form.watch('email')}
                  onClick={(e) => {
                    sendCode(e)
                  }}
                  aria-label="Send One-Time Password to Email"
                  title="Send One-Time Password to Email"
                >
                  Re-send Code
                </button>
              )}

              <button ref={btnRef} type="submit" className="hidden" />
            </form>

            <BaseCol className="gap-y-2">
              <Button
                variant={session && session.user ? 'secondary' : 'theme'}
                size="xl"
                //disabled={otpSent && (!form.watch('email') || !form.watch('otp'))}
                onClick={(e) => {
                  if (form.watch('email')) {
                    if (!form.watch('otp')) {
                      sendCode(e)
                    } else {
                      btnRef.current?.click()
                    }
                  } else {
                    addToast({
                      id: makeUuid(),
                      title: config.name,
                      description: 'Please enter your email address.',
                      type: 'destructive',
                    })
                  }
                }}
                className="group"
              >
                <div className="group-hover:w-5 group-hover:opacity-100 group-focus:w-5 group-focus:opacity-100 opacity-0 w-0 overflow-hidden trans-all">
                  <ArrowRight className="w-5" />
                </div>
                <span>
                  {form.watch('otp') || otpSent
                    ? TEXT_SIGN_IN
                    : 'Send One-Time Code'}
                </span>
              </Button>
            </BaseCol>
          </Form>
        </BaseCol>
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
