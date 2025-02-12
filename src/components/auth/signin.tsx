import { Switch } from '@components/shadcn/ui/themed/switch'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/shadcn/ui/themed/card'

import { VCenterRow } from '@/components/layout/v-center-row'

import { makeInfoAlert } from '@components/alerts/alerts-provider'

import {
  APP_MYACCOUNT_URL,
  RESET_PASSWORD_ROUTE,
  SESSION_AUTH_SIGNIN_URL,
  SIGN_IN_ROUTE,
  SIGN_UP_ROUTE,
  TEXT_PASSWORDLESS,
  TEXT_SIGN_UP,
} from '@/lib/edb/edb'

import { ThemeIndexLink } from '@components/link/theme-index-link'
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_PATTERN,
  TEXT_MIN_PASSWORD_LENGTH,
  TEXT_PASSWORD_DESCRIPTION,
  TEXT_PASSWORD_REQUIRED,
} from '@components/pages/account/password-dialog'
import { useContext, useEffect, useRef, type BaseSyntheticEvent } from 'react'

import { EdbSettingsContext } from '@/lib/edb/edb-settings-provider'
import { FormInputError } from '@components/input-error'
import { ThemeLink } from '@components/link/theme-link'
import { Button } from '@components/shadcn/ui/themed/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@components/shadcn/ui/themed/form'
import { Input } from '@components/shadcn/ui/themed/input'
import { Label } from '@components/shadcn/ui/themed/label'

import type { IElementProps } from '@interfaces/element-props'

import { TEXT_SIGN_IN } from '@/consts'
import { useToast } from '@/hooks/use-toast'
import { httpFetch } from '@/lib/http/http-fetch'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { HCenterCol } from '../layout/h-center-col'

export const FORWARD_DELAY_MS = 1000

//https://uibakery.io/regex-library/email
export const EMAIL_PATTERN =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
export const USERNAME_PATTERN = /^[\w@.]{4,}/

export const NAME_PATTERN = /^[\w ]*/

export const TEXT_USERNAME_REQUIRED = 'A username is required'
export const TEXT_NAME_REQUIRED = 'A first name is required'
export const TEXT_USERNAME_DESCRIPTION =
  'A username must contain at least 3 characters, which can be letters, numbers, andunknown of @.-'
export const TEXT_EMAIL_ERROR = 'This does not seem like a valid email address'

export function CreateAccountLink() {
  return (
    <span>
      Don&apos;t have an account?{' '}
      <ThemeIndexLink href={SIGN_UP_ROUTE} aria-label={TEXT_SIGN_UP}>
        Create one
      </ThemeIndexLink>
    </span>
  )
}

export function SignInLink() {
  return (
    <span className="w-full">
      Already have an account?{' '}
      <ThemeIndexLink href={SIGN_IN_ROUTE} aria-label={TEXT_SIGN_IN}>
        {TEXT_SIGN_IN}
      </ThemeIndexLink>
    </span>
  )
}

export function makeSignedInAlert() {
  return makeInfoAlert({
    title: 'You are signed in',
  })
}

interface IFormInput {
  username: string
  password1: string
  //passwordless: boolean
  staySignedIn: boolean
}

export interface ISignInProps extends IElementProps {
  allowPassword?: boolean
  // if signin is success, which page of the app to jump to
  // so that user is not left on signin page
  visitUrl?: string
}

export function SignIn({ allowPassword = false, visitUrl }: ISignInProps) {
  const queryClient = useQueryClient()

  const { toast } = useToast()
  // some other page needs to force reload account details either
  // passwordless or regular so that on refresh this page can see if
  // the details have been loaded
  //const [account, setAccount] = useState<IAccount>({...DEFAULT_ACCOUNT})

  useEffect(() => {
    // the sign in callback includes this url so that the app can signin and
    // then return user to the page they were signing into as a convenience
    if (!visitUrl) {
      // default to returning to current page if none specified. This is not
      // advantageous on the signin page itself as it may appear as though
      // user has not signed in even when they have. In this case it should
      // be manually set.
      visitUrl = window.location.href
    }
  }, [])

  const { settings, updateSettings } = useContext(EdbSettingsContext)
  //const passwordless = useRef<boolean>(settings.passwordless)

  const btnRef = useRef<HTMLButtonElement>(null)

  const form = useForm<IFormInput>({
    defaultValues: {
      username: '',
      password1: '',
      //passwordless: settings.passwordless,
      staySignedIn: settings.staySignedIn,
    },
  })

  // useEffect(() => {
  //   async function fetch() {
  //     getCachedUser()
  //   }

  //   fetch()
  // }, [])

  useEffect(() => {
    form.reset({
      username: '',
      password1: '',
      //passwordless: settings.passwordless,
      staySignedIn: settings.staySignedIn,
    })
  }, [])

  async function onSubmit(data: IFormInput, e: BaseSyntheticEvent | undefined) {
    // question if user wants to keep signing in

    e?.preventDefault()

    // if (!forceSignIn && signedIn) {
    //   setCheckUserWantsToSignIn(true)
    //   return
    // }

    if (data.username.length < 3) {
      toast({
        title: 'Username must be at least 3 characters',
        description: 'Please enter a valid username or create an account.',
        variant: 'destructive',
      })

      return
    }

    //console.log(form.formState.errors)

    if (!settings.passwordless && data.password1.length < MIN_PASSWORD_LENGTH) {
      toast({
        title: TEXT_MIN_PASSWORD_LENGTH,
        variant: 'destructive',
      })
      return
    }

    try {
      // to activate passwordless, simply use a blank password

      console.log(SESSION_AUTH_SIGNIN_URL)

      const res = await queryClient.fetchQuery({
        queryKey: ['signin'],
        queryFn: () =>
          httpFetch.postJson(SESSION_AUTH_SIGNIN_URL, {
            body: {
              username: data.username,
              password: settings.passwordless ? '' : data.password1,
              staySignedIn: data.staySignedIn,
              redirectUrl: APP_MYACCOUNT_URL,
              //visitUrl,
            },
          }),
      })

      if (res.message.includes('email')) {
        toast({
          title: 'We sent you a sign in link',
          description:
            'Please check your email and click on the sign in link we sent.',
        })

        return
      }
    } catch (error) {
      console.error(error)

      toast({
        title: 'There was an issue signing you in',
        description:
          'Please check your account is still active. Do you need to create an account?',
        variant: 'destructive',
      })
    }

    //setForceSignIn(false)
  }

  return (
    <HCenterCol className="gap-y-16 grow justify-center">
      <Card className="text-sm p-8 w-11/12  lg:w-1/2 2xl:w-3/10">
        <CardHeader>
          <VCenterRow className="justify-between">
            <CardTitle>Sign in to your account</CardTitle>

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
            {settings.passwordless
              ? 'Enter your email address to sign in.'
              : 'Enter your username and password to sign in.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="flex flex-col gap-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="grid grid-cols-1 gap-2 items-center">
                <Label className="font-medium uppercase text-xs">Email</Label>
                <FormField
                  control={form.control}
                  name="username"
                  rules={{
                    required: {
                      value: true,
                      message: TEXT_USERNAME_REQUIRED,
                    },
                    pattern: {
                      value: USERNAME_PATTERN,
                      message: TEXT_USERNAME_DESCRIPTION,
                    },
                  }}
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <Input
                        id="username"
                        placeholder="Username"
                        //error={"username" in form.formState.errors}
                        variant="alt"
                        className="px-3 "
                        h="2xl"
                        {...field}
                      >
                        {/* {"username" in form.formState.errors && <WarningIcon />} */}
                      </Input>
                      <FormInputError error={form.formState.errors.username} />
                    </FormItem>
                  )}
                />
              </div>

              {!settings.passwordless && allowPassword && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                  <Label className="font-medium">Password</Label>
                  <FormField
                    control={form.control}
                    name="password1"
                    rules={{
                      required: {
                        value: !settings.passwordless,
                        message: TEXT_PASSWORD_REQUIRED,
                      },

                      pattern: {
                        value: PASSWORD_PATTERN,
                        message: TEXT_PASSWORD_DESCRIPTION,
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <Input
                          id="password1"
                          //disabled={settings.passwordless}
                          //error={"password1" in form.formState.errors}
                          type="password"
                          placeholder="Password"
                          {...field}
                        >
                          {/* {"password1" in form.formState.errors && (
                              <WarningIcon />
                            )} */}
                        </Input>
                        <FormInputError
                          error={form.formState.errors.password1}
                        />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <VCenterRow className="col-span-2 justify-between gap-x-2 text-sm">
                <FormField
                  control={form.control}
                  name="staySignedIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center gap-x-2">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={(state) => {
                            updateSettings({
                              ...settings,
                              staySignedIn: state,
                            })

                            field.onChange(state)
                          }}
                        ></Switch>
                      </FormControl>
                      <FormLabel>Keep me signed in</FormLabel>
                    </FormItem>
                  )}
                />

                {allowPassword && (
                  <ThemeLink
                    href={RESET_PASSWORD_ROUTE}
                    aria-label="Forgot password"
                  >
                    Forgot password?
                  </ThemeLink>
                )}
              </VCenterRow>

              <button ref={btnRef} type="submit" className="hidden" />
            </form>
          </Form>
        </CardContent>
        <CardFooter className="pt-8">
          {settings.passwordless ? (
            <Button
              size="2xl"
              variant="theme"
              className="w-full"
              onClick={() => {
                //passwordless.current = true

                btnRef.current?.click()
              }}
            >
              {TEXT_SIGN_IN}
            </Button>
          ) : (
            <>
              <Button
                size="2xl"
                className="w-full"
                onClick={() => {
                  //passwordless.current = false
                  btnRef.current?.click()
                }}
              >
                {TEXT_SIGN_IN}
              </Button>

              <Button
                size="xl"
                variant="secondary"
                onClick={() => {
                  //passwordless.current = true

                  btnRef.current?.click()
                }}
              >
                ${TEXT_SIGN_IN}
              </Button>
            </>
          )}
        </CardFooter>
      </Card>

      <CreateAccountLink />
    </HCenterCol>
  )
}
