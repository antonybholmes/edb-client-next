import { Switch } from '@components/shadcn/ui/themed/switch'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/shadcn/ui/themed/card'

import { HeaderLayout } from '@layouts/header-layout'

import {
  API_SIGNUP_URL,
  APP_VERIFY_EMAIL_URL,
  TEXT_PASSWORDLESS,
} from '@/lib/edb/edb'

import { useContext, useRef, type BaseSyntheticEvent } from 'react'

import { VCenterRow } from '@/components/layout/v-center-row'
import { useToast } from '@/hooks/use-toast'
import { EdbSettingsContext } from '@/lib/edb/edb-settings-provider'
import { httpFetch } from '@/lib/http/http-fetch'
import { Button } from '@components/shadcn/ui/themed/button'
import { Form, FormField, FormItem } from '@components/shadcn/ui/themed/form'
import { Input } from '@components/shadcn/ui/themed/input'
import { Label } from '@components/shadcn/ui/themed/label'
import { SignInLink } from '@layouts/signin-layout'
import { CoreProviders } from '@providers/core-providers'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { HCenterCol } from '../layout/h-center-col'
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

function SignUpPage({ allowPassword = false }: ISignupProps) {
  const queryClient = useQueryClient()

  const { toast } = useToast()

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
      toast({
        title: 'Password too short',
        description: TEXT_MIN_PASSWORD_LENGTH,
        variant: 'destructive',
      })

      return
    }

    try {
      await queryClient.fetchQuery({
        queryKey: ['update'],
        queryFn: () =>
          httpFetch.post(API_SIGNUP_URL, {
            body: {
              email: data.email,
              //username: data.email,
              firstName: data.firstName,
              //lastName: data.lastName,
              //password: settings.passwordless ? '' : data.password1,
              redirectUrl: APP_VERIFY_EMAIL_URL,
            },
          }),
      })

      toast({
        title: 'Your account was created',
        description: 'Please check your email to continue.',
      })
    } catch (error) {
      console.error(error, 'error')
    }
  }

  return (
    <HeaderLayout>
      <>
        <HCenterCol className="gap-y-16 justify-center grow">
          <Card className="shadow-xl p-8">
            <CardHeader>
              <VCenterRow className="justify-between">
                <CardTitle>Create your account</CardTitle>

                {allowPassword && (
                  <Switch
                    checked={settings.passwordless}
                    onCheckedChange={(state) => {
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
                  className="flex flex-col gap-y-4"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="grid grid-cols-1 gap-2 items-center">
                    <Label className="font-medium uppercase text-xs">
                      First Name
                    </Label>
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-y-2 col-span-2">
                          <Input
                            id="name"
                            className="w-full px-3"
                            placeholder="First Name"
                            h="2xl"
                            variant="alt"
                            {...field}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
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
                  </div> */}

                  <div className="grid grid-cols-1 gap-2 items-center">
                    <Label className="font-medium uppercase text-xs">
                      Email
                    </Label>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-y-2 col-span-2">
                          <Input
                            id="email"
                            type="email"
                            className="w-full rounded-theme px-3"
                            placeholder="Email address"
                            variant="alt"
                            h="2xl"
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
                              variant="alt"
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
            <CardFooter className="pt-8 text-sm">
              <Button
                variant="theme"
                size="2xl"
                className="w-full"
                onClick={() => btnRef.current?.click()}
              >
                Sign Up
              </Button>

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
        </HCenterCol>
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
