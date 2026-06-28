import { Switch } from '@/components/shadcn/ui/themed/v2/switch'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/themed/card'

import { HeaderLayout } from '@/layouts/header-layout'

import {
  API_SIGNUP_URL,
  APP_VERIFY_EMAIL_URL,
  TEXT_PASSWORDLESS,
} from '@/lib/edb/edb'

import { useRef, type BaseSyntheticEvent } from 'react'

import { VCenterRow } from '@/layout/v-center-row'

import {
  Form,
  FormField,
  FormItem,
} from '@/components/shadcn/ui/themed/v2/form'
import { Label } from '@/components/shadcn/ui/themed/v2/label'
import { useEdbSettings } from '@/lib/edb/edb-settings'
import { httpFetch } from '@/lib/http/http-fetch'
import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'
import { useForm } from 'react-hook-form'
import { HCenterCol } from '../layout/h-center-col'

import { makeUuid } from '@/lib/id'
import { Toast } from '@base-ui/react/toast'
import {
  MIN_PASSWORD_LENGTH,
  TEXT_MIN_PASSWORD_LENGTH,
} from './account/password-email-dialog'

interface IFormInput {
  name: string
  email: string
  password1: string
  //passwordless: boolean
}

interface ISignupProps {
  allowPassword?: boolean
}

export function SignUpPage({ allowPassword = false }: ISignupProps) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const { add: addToast } = Toast.useToastManager()

  const { settings, updateSettings } = useEdbSettings()

  const form = useForm<IFormInput>({
    defaultValues: {
      name: process.env.NODE_ENV === 'development' ? 'Antony' : '',
      email:
        process.env.NODE_ENV === 'development' ? 'antony@antonyholmes.com' : '',
      password1: '',
      //passwordless: true, //settings.passwordless,
    },
  })

  async function onSubmit(data: IFormInput, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    if (!settings.passwordless && data.password1.length < MIN_PASSWORD_LENGTH) {
      addToast({
        id: makeUuid(),
        title: 'Password too short',
        description: TEXT_MIN_PASSWORD_LENGTH,
        type: 'destructive',
      })

      return
    }

    try {
      await httpFetch.post(API_SIGNUP_URL, {
        body: {
          email: data.email,
          //username: data.email,
          name: data.name,

          redirectUrl: APP_VERIFY_EMAIL_URL,
        },
      })

      addToast({
        id: makeUuid(),
        title: 'Your account was created',
        description: 'Please check your email to continue.',
        type: 'success',
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
                      updateSettings({ passwordless: state })
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
                      name="name"
                      render={({ field }) => (
                        <FormItem className="flex flex-col gap-y-2 col-span-2">
                          <Input
                            id="name"
                            className="w-full px-3"
                            placeholder="Name"
                            h="2xl"
                            variant="alt"
                            {...field}
                          />
                        </FormItem>
                      )}
                    />
                  </div>

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

          {/* <SignInLink /> */}
        </HCenterCol>
      </>
    </HeaderLayout>
  )
}
