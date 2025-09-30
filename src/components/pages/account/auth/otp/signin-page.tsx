'use client'

import { AppIcon } from '@/components/icons/app-icon'
import { FormInputError } from '@/components/input-error'
import { BaseCol } from '@/components/layout/base-col'
import { VCenterRow } from '@/components/layout/v-center-row'
import { Button } from '@/components/shadcn/ui/themed/button'
import { Card, CardHeader, CardTitle } from '@/components/shadcn/ui/themed/card'
import { toast } from '@/components/shadcn/ui/themed/crisp'
import { Form, FormField, FormItem } from '@/components/shadcn/ui/themed/form'
import { Input } from '@/components/shadcn/ui/themed/input'
import { Label } from '@/components/shadcn/ui/themed/label'
import { APP_NAME, TEXT_SIGN_IN } from '@/consts'
import { CenterLayout } from '@/layouts/center-layout'
import { MYACCOUNT_ROUTE, REDIRECT_URL_PARAM } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { zodResolver } from '@hookform/resolvers/zod'

import { ArrowRight } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { addPeriod, capitalizeFirstWord } from '@/lib/text/capital-case'
import { BaseSyntheticEvent, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'
import { invalidRedirectUrl } from '../oauth2/signedout-page'

const FormSchema = z.object({
  email: z.email({
    message: 'You must enter a valid email address.',
  }),
  otp: z
    .string()
    .regex(/^\d{6}$/, { message: 'You must enter a 6-digit code.' }),
})

export function SignInPage() {
  //const router = useRouter()
  const searchParams = useSearchParams()

  const [otpSent, setOTPSent] = useState(false)
  const { settings } = useEdbSettings()
  const { sendOTP, signInWithEmailOTP, signout, session } = useEdbAuth()
  const [redirectUrl, setRedirectUrl] = useState<string>(MYACCOUNT_ROUTE)

  const btnRef = useRef<HTMLButtonElement>(null)
  // const [email, setEmail] = useState(
  //   settings?.users.length > 0 ? settings.users[0]!.email : ''
  // )

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      otp: '',
    },
  })

  useEffect(() => {
    //const queryParameters = new URLSearchParams(window.location.search)
    setRedirectUrl(searchParams.get(REDIRECT_URL_PARAM) || MYACCOUNT_ROUTE)
  }, [searchParams])

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

      console.log('redirectUrl', redirectUrl)

      // if (
      //   redirectUrl &&
      //   redirectUrl.length > 0 &&
      //   redirectUrl !== '/' &&
      //   redirectUrl !== OTP_SIGN_IN_ROUTE &&
      //   redirectUrl.startsWith('/')

      let url = redirectUrl

      if (invalidRedirectUrl(redirectUrl)) {
        url = '/'
      }

      //router.push(url)
      window.location.href = url

      // toast({
      //   title: APP_NAME,
      //   variant: 'success',
      //   description: `Hi, ${session.user.firstName}. You are signed in.`,
      //   //variant: 'destructive',
      // })
    } catch (error) {
      console.log('Error signing in: ', error)

      //setOTPSent(false)

      // try {
      //   await signout()
      // } catch (e) {
      //   console.log('Error signing out: ', e)
      // }

      toast({
        title: APP_NAME,
        description:
          'The sign in failed. Please check the one-time code and try again.',
        variant: 'destructive',
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

    console.log('isValid', isValid, form.getValues('email'))

    if (isValid) {
      try {
        await sendOTP(form.getValues('email'))

        setOTPSent(true)

        toast({
          title: APP_NAME,
          description:
            'If the email address is valid, you will receive a 6-digit code.',
        })
      } catch (error) {
        console.log('Error sending OTP: ', error)

        toast({
          title: 'We were unable to send you a code',
          description:
            error instanceof Error
              ? addPeriod(capitalizeFirstWord(error.message))
              : 'Error sending code.',
          variant: 'destructive',
        })
      }
    }
  }

  return (
    <CenterLayout
      title={TEXT_SIGN_IN}
      signedRequired={false}
      //
      innerCls="gap-y-4"
    >
      {session && session.user && (
        <p className="bg-emerald-50 w-120 px-5 py-2.5 rounded-xl border border-emerald-200">
          Hi{' '}
          <a href={MYACCOUNT_ROUTE} className="underline hover:text-theme">
            {session.user.firstName || session.user.email}
          </a>
          , you are signed in.
        </p>
      )}

      <Card
        className="shadow-2xl gap-y-8 w-120 text-sm p-10"
        rounded="2xl"
        //variant="simple"
      >
        <CardHeader className="text-xl">
          <VCenterRow className="gap-x-2">
            <AppIcon w="w-10" />
            <CardTitle>
              {TEXT_SIGN_IN} to {APP_NAME}
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
                      6-Digit One-Time Passcode
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

            <Button
              variant="theme"
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
                  toast({
                    title: APP_NAME,
                    description: 'Please enter your email address.',
                    variant: 'destructive',
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
          </Form>
        </BaseCol>
      </Card>
    </CenterLayout>
  )
}
