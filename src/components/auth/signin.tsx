import { Switch } from '@components/shadcn/ui/themed/switch'

import {
  Card,
  CardContainer,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@components/shadcn/ui/themed/card'

import { VCenterRow } from '@/components/layout/v-center-row'

import {
  AlertsContext,
  makeAlertFromAxiosError,
  makeErrorAlert,
  makeInfoAlert,
} from '@components/alerts/alerts-provider'

import {
  APP_SIGNIN_URL,
  RESET_PASSWORD_ROUTE,
  SESSION_SIGNIN_URL,
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
import axios, { AxiosError } from 'axios'
import { useContext, useEffect, useRef, type BaseSyntheticEvent } from 'react'

import { BaseCol } from '@/components/layout/base-col'
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
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

export const FORWARD_DELAY_MS = 2000

//https://uibakery.io/regex-library/email
export const EMAIL_PATTERN =
  /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
export const USERNAME_PATTERN = /^[\w@.]{4,}/

export const NAME_PATTERN = /^[\w ]*/

export const TEXT_USERNAME_REQUIRED = 'A username is required'
export const TEXT_NAME_REQUIRED = 'A first name is required'
export const TEXT_USERNAME_DESCRIPTION =
  'A username must contain at least 3 characters, which can be letters, numbers, and any of @.-'
export const TEXT_EMAIL_ERROR = 'This does not seem like a valid email address'

export function CreateAccountLink() {
  return (
    <span className="w-full">
      Don&apos;t have an account?{' '}
      <ThemeIndexLink href={SIGN_UP_ROUTE} aria-label={TEXT_SIGN_UP}>
        Create an account
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

export function SignIn({ allowPassword = true, visitUrl }: ISignInProps) {
  const queryClient = useQueryClient()

  const { alertDispatch } = useContext(AlertsContext)
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
      alertDispatch({
        type: 'add',
        alert: makeErrorAlert({
          title: 'Username must be at least 3 characters',
          content: 'Please enter a valid username or create an account.',
        }),
      })

      return
    }

    //console.log(form.formState.errors)

    if (!settings.passwordless && data.password1.length < MIN_PASSWORD_LENGTH) {
      alertDispatch({
        type: 'add',
        alert: makeErrorAlert({
          title: TEXT_MIN_PASSWORD_LENGTH,
        }),
      })
      return
    }

    try {
      // to activate passwordless, simply use a blank password

      const res = await queryClient.fetchQuery({
        queryKey: ['signin'],
        queryFn: () =>
          axios.post(
            SESSION_SIGNIN_URL,
            {
              username: data.username,
              password: settings.passwordless ? '' : data.password1,
              staySignedIn: data.staySignedIn,
              callbackUrl: APP_SIGNIN_URL,
              visitUrl,
            },
            { withCredentials: true }
          ),
      })

      if (res.data.message.includes('email')) {
        alertDispatch({
          type: 'set',
          alert: makeInfoAlert({
            title: 'Please check your email',
            content:
              'We sent you an email containing a link you can use to sign in.',
            size: 'dialog',
          }),
        })

        return
      }
    } catch (error) {
      console.log(error)
      alertDispatch({
        type: 'add',
        alert: makeAlertFromAxiosError(error as AxiosError),
      })
    }

    //setForceSignIn(false)
  }

  return (
    <CardContainer>
      <Card className="text-sm">
        <CardHeader>
          <VCenterRow className="justify-between">
            <CardTitle>Sign in to your account </CardTitle>

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
              ? 'Enter your username or email address to sign in.'
              : 'Enter your username and password to sign in.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="flex flex-col gap-y-4"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <Label className="font-medium">Username</Label>
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
                        className=" rounded-theme"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div></div>
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

                  <ThemeLink
                    href={RESET_PASSWORD_ROUTE}
                    aria-label="Forgot password"
                  >
                    Forgot password?
                  </ThemeLink>
                </VCenterRow>
              </div>

              <button ref={btnRef} type="submit" className="hidden" />
            </form>
          </Form>
        </CardContent>
        <CardFooter>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center w-full">
            <div></div>
            <BaseCol className="col-span-2 gap-y-2">
              {settings.passwordless ? (
                <VCenterRow>
                  <Button
                    size="lg"
                    onClick={() => {
                      //passwordless.current = true

                      btnRef.current?.click()
                    }}
                  >
                    {TEXT_PASSWORDLESS} {TEXT_SIGN_IN}
                  </Button>
                </VCenterRow>
              ) : (
                <>
                  <VCenterRow className="gap-x-2">
                    <Button
                      size="lg"
                      onClick={() => {
                        //passwordless.current = false
                        btnRef.current?.click()
                      }}
                    >
                      {TEXT_SIGN_IN}
                    </Button>

                    <Button
                      size="lg"
                      variant="secondary"
                      onClick={() => {
                        //passwordless.current = true

                        btnRef.current?.click()
                      }}
                    >
                      {`${TEXT_PASSWORDLESS} ${TEXT_SIGN_IN}`}
                    </Button>
                  </VCenterRow>
                </>
              )}
            </BaseCol>
          </div>
        </CardFooter>
      </Card>

      <CreateAccountLink />
    </CardContainer>
  )
}
