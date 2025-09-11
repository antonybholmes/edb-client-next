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
import { REDIRECT_URL_PARAM } from '@/lib/edb/edb'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { zodResolver } from '@hookform/resolvers/zod'

import { ArrowRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

import { BaseSyntheticEvent, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import z from 'zod'

const FormSchema = z.object({
  email: z.email({
    message: 'You must enter a valid email address.',
  }),
  otp: z.string().min(6, { message: 'You must enter the 6-digit code.' }),
})

export function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [loading, setLoading] = useState(false)
  const { settings } = useEdbSettings()
  const { sendOTP, signInWithEmailOTP, signout, session } = useEdbAuth()
  const [redirectUrl, setRedirectUrl] = useState<string>('')

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
    setRedirectUrl(searchParams.get(REDIRECT_URL_PARAM) || '')
  }, [searchParams])

  useEffect(() => {
    form.setValue(
      'email',
      settings?.users.length! > 0 ? settings!.users[0]!.email : ''
    )
  }, [settings, form])

  async function onSubmit(
    data: { email: string; otp: string },
    e: BaseSyntheticEvent | undefined
  ) {
    e?.preventDefault()

    setLoading(true)

    //await signout()

    try {
      await signInWithEmailOTP(data.email, data.otp)

      console.log('redirectUrl', redirectUrl)

      if (redirectUrl) {
        router.push(redirectUrl)
      }

      toast({
        title: APP_NAME,
        variant: 'success',
        description: 'You have signed in successfully.',
        //variant: 'destructive',
      })
    } catch (error) {
      console.log('Error signing in: ', error)

      toast({
        title: APP_NAME,
        description: error instanceof Error ? error.message : String(error),
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

  return (
    <CenterLayout
      title={TEXT_SIGN_IN}
      signedRequired="never"
      //showAccountButton={false}
      innerCls="gap-y-4"
    >
      {session && session.user && (
        <p className="bg-emerald-50 w-120 p-3 rounded-xl border border-emerald-200">
          Hi, {session.user.firstName}. You are signed in.
        </p>
      )}

      <Card
        className="shadow-2xl gap-y-8 w-120 text-sm p-12"
        rounded="2xl"
        //variant="simple"
      >
        <CardHeader className="text-xl">
          <VCenterRow className="gap-x-2">
            <AppIcon w="w-10" />
            <CardTitle>Sign in to {APP_NAME}</CardTitle>
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
                  <FormItem className="flex flex-col gap-y-1">
                    <Label htmlFor="otp" className="text-sm font-medium">
                      One-Time Password (OTP)
                    </Label>
                    <VCenterRow className="gap-x-4">
                      <Input
                        id="otp"
                        type="text"
                        placeholder="OTP code, e.g. 123456"
                        h="xl"
                        variant="alt"
                        {...field}
                      />

                      <button
                        className="text-sm text-theme hover:underline"
                        disabled={!form.watch('email')}
                        onClick={async () => {
                          const isValid = await form.trigger('email')

                          if (isValid) {
                            sendOTP(form.getValues('email'))

                            toast({
                              title: APP_NAME,
                              description:
                                'If the email address is valid, you will receive a 6-digit code.',
                            })
                          }
                        }}
                      >
                        Send Code
                      </button>
                    </VCenterRow>

                    <FormInputError error={form.formState.errors.otp} />
                  </FormItem>
                )}
              />

              <button ref={btnRef} type="submit" className="hidden" />
            </form>

            <Button
              variant="theme"
              size="xl"
              disabled={!form.watch('email') || !form.watch('otp')}
              onClick={() => btnRef.current?.click()}
              className="group"
            >
              <div className="group-hover:w-5 group-hover:opacity-100 group-focus:w-5 group-focus:opacity-100 opacity-0 w-0 overflow-hidden trans-all">
                <ArrowRight className="w-5" />
              </div>
              <span>{TEXT_SIGN_IN}</span>
            </Button>
          </Form>
        </BaseCol>
      </Card>
    </CenterLayout>
  )
}
