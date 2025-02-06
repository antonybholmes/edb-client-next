import { Alerts } from '@components/alerts/alerts'

import { Switch } from '@components/shadcn/ui/themed/switch'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from '@components/shadcn/ui/themed/card'

import {
  AlertsContext,
  makeAlertFromAxiosError,
  makeErrorAlert,
  makeInfoAlert,
} from '@components/alerts/alerts-provider'
import { HeaderLayout } from '@layouts/header-layout'

import {
  API_SIGNUP_URL,
  APP_VERIFY_EMAIL_URL,
  TEXT_PASSWORDLESS,
} from '@/lib/edb/edb'

import { useContext, useRef, type BaseSyntheticEvent } from 'react'

import { VCenterRow } from '@/components/layout/v-center-row'
import { TEXT_CONTINUE } from '@/consts'
import { EdbSettingsContext } from '@/lib/edb/edb-settings-provider'
import { Button } from '@components/shadcn/ui/themed/button'
import { Form, FormField, FormItem } from '@components/shadcn/ui/themed/form'
import { Input } from '@components/shadcn/ui/themed/input'
import { Label } from '@components/shadcn/ui/themed/label'
import { SignInLink } from '@layouts/signin-layout'
import { CoreProviders } from '@providers/core-providers'
import { useQueryClient } from '@tanstack/react-query'
import axios, { AxiosError } from 'axios'
import { useForm } from 'react-hook-form'
import {
  MIN_PASSWORD_LENGTH,
  TEXT_MIN_PASSWORD_LENGTH,
} from './account/password-dialog'

interface IFormInput {
  firstName: string
  lastName: string
  email: string
  password1: string
  //passwordless: boolean
}

interface ISignupProps {
  allowPassword?: boolean
}

function SignUpPage({ allowPassword = true }: ISignupProps) {
  const queryClient = useQueryClient()

  const { alertDispatch } = useContext(AlertsContext)

  const btnRef = useRef<HTMLButtonElement>(null)

  const { settings, updateSettings } = useContext(EdbSettingsContext)

  const form = useForm<IFormInput>({
    defaultValues: {
      firstName: process.env.NODE_ENV === 'development' ? 'Antony' : '',
      lastName: '',
      email:
        process.env.NODE_ENV === 'development' ? 'antony@antonyholmes.com' : '',
      password1: '',
      //passwordless: true, //settings.passwordless,
    },
  })

  async function onSubmit(data: IFormInput, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()
    // if (password1 !== password2) {
    //   setMessage({ message: "Your passwords do not match", type: "error" })
    //   return
    // }

    //console.log(API_SIGNUP_URL)

    if (!settings.passwordless && data.password1.length < MIN_PASSWORD_LENGTH) {
      alertDispatch({
        type: 'add',
        alert: makeErrorAlert({
          content: TEXT_MIN_PASSWORD_LENGTH,
        }),
      })

      return
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ['update'],
        queryFn: () =>
          axios.post(API_SIGNUP_URL, {
            email: data.email,
            username: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: settings.passwordless ? '' : data.password1,
            callbackUrl: APP_VERIFY_EMAIL_URL,
          }),
      })

      alertDispatch({
        type: 'set',
        alert: makeInfoAlert({
          content:
            'Your account was created. Please check your email to continue.',
        }),
      })
    } catch (error) {
   
      alertDispatch({
        type: 'add',
        alert: makeAlertFromAxiosError(error as AxiosError),
      })
    }
  }

  return (
    <HeaderLayout>
      <>
        <Alerts />
        <CenteredCardContainer>
          <Card>
            <CardHeader>
              <VCenterRow className="justify-between">
                <CardTitle>Create your account</CardTitle>

                {allowPassword && (
                  <Switch
                    checked={settings.passwordless}
                    onCheckedChange={state => {
                      updateSettings({ ...settings, passwordless: state })
                    }}
                  >
                    {TEXT_PASSWORDLESS}
                  </Switch>
                )}
              </VCenterRow>
              <CardDescription>
                We just need a name and email address to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  className="flex flex-col gap-y-2"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">First Name*</Label>
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-y-2 col-span-2">
                          <Input
                            id="name"
                            className="w-full rounded-theme"
                            placeholder="First Name *"
                            {...field}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">Last Name</Label>

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-y-2 col-span-2">
                          <Input
                            id="name"
                            className="w-full rounded-theme"
                            placeholder="Last Name"
                            {...field}
                          />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">Email</Label>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-y-2 col-span-2">
                          <Input
                            id="email"
                            type="email"
                            className="w-full rounded-theme"
                            placeholder="Email *"
                            {...field}
                          />
                        </FormItem>
                      )}
                    />
                  </div>

                  {!settings.passwordless && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                      <Label className="font-medium">Password</Label>
                      <FormField
                        control={form.control}
                        name="password1"
                        render={({ field }) => (
                          <FormItem className="flex flex-col gap-y-2 col-span-2">
                            <Input
                              id="password1"
                              type="password"
                              className="w-full rounded-theme"
                              placeholder="Password"
                              {...field}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* <FormField
                      control={form.control}
                      name="passwordless"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center gap-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={state => {
                                settingsDispatch({
                                  type: "passwordless",
                                  state,
                                })
                                field.onChange(state)
                              }}
                            ></Switch>
                          </FormControl>
                          <FormLabel className="p-0">
                            {TEXT_PASSWORDLESS}
                          </FormLabel>
                        </FormItem>
                      )}
                    /> */}

                  <button ref={btnRef} type="submit" className="hidden" />
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center w-full">
                <div></div>
                <div className="col-span-2">
                  <Button
                    variant="theme"
                    size="lg"
                    onClick={() => btnRef.current?.click()}
                  >
                    {TEXT_CONTINUE}
                  </Button>
                </div>
              </div>
              {/* <SecondaryButton
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    if (passwordless) {
                      setPasswordless(false)
                    } else {
                      signup()
                    }
                  }}
                >
                  {!passwordless ? "Continue" : "Continue with password"}
                </SecondaryButton> */}
            </CardFooter>
          </Card>

          <SignInLink />
        </CenteredCardContainer>
      </>
    </HeaderLayout>
  )
}

export function SignUpQueryPage() {
  return (
    <CoreProviders>
      <SignUpPage />
    </CoreProviders>
  )
}
