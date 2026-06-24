import { BaseCol } from '@/layout/base-col'

import { HCenterRow } from '@/layout/h-center-row'
import { HeaderLayout } from '@/layouts/header-layout'
import { API_UPDATE_PASSWORD_URL } from '@/lib/edb/edb'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/themed/card'

import { useRef, useState, type BaseSyntheticEvent } from 'react'

import { FormInputError } from '@/components/input-error'
import {
  Form,
  FormField,
  FormItem,
} from '@/components/shadcn/ui/themed/v2/form'
import { TEXT_CONTINUE } from '@/consts'
import { WarningIcon } from '@/icons/warning-icon'

import {
  TEXT_USERNAME_DESCRIPTION,
  TEXT_USERNAME_REQUIRED,
  USERNAME_PATTERN,
} from '@/layouts/signin-layout'

import { CoreProviders } from '@/providers/core-provider'

import { Button } from '@/components/shadcn/ui/themed/v2/button'

import { getCSRFToken } from '@/lib/edb/csrf'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { httpFetch } from '@/lib/http/http-fetch'
import { csfrHeaders } from '@/lib/http/urls'
import { makeUuid } from '@/lib/id'
import { Input } from '@/themed/v2/input'
import { Toast } from '@base-ui/react/toast'
import { useForm } from 'react-hook-form'
import {
  MIN_PASSWORD_LENGTH,
  PASSWORD_PATTERN,
  TEXT_MIN_PASSWORD_LENGTH,
  TEXT_PASSWORD_DESCRIPTION,
} from '../password-email-dialog'

interface IFormInput {
  userId: string
  password1: string
  password2: string
  passwordless: boolean
}

export function UpdatePasswordPage() {
  //const [jwtData, setJwtData] = useState<IResetJwtPayload | null>(null)

  const { add: addToast } = Toast.useToastManager()

  const { session } = useEdbAuth()

  // useEffect(() => {
  //   const queryParameters = new URLSearchParams(window.location.search)

  //   // the one time token for changing the email address
  //   // this contains the signed user to be updated so even if the ui
  //   // is messed with, only that user can be changed
  //   const j: NullStr = queryParameters.get(EDB_TOKEN_PARAM) ?? null

  //   if (j) {
  //     setJwt(j)
  //     try {
  //       const d = jwtDecode<IResetJwtPayload>(j)
  //       setJwtData(d)
  //     } catch {
  //       console.error('jwt parse error')
  //     }
  //   }
  // }, [])

  //const { accessToken } = useAccessTokenStore()
  //const { user } = useUserStore(queryClient)

  const btnRef = useRef<HTMLButtonElement>(null)

  const [hasErrors, setHasErrors] = useState(false)

  // try to get name from either account or token
  // const userId = jwtData?.userId ?? ''

  // // try to get name from either account or token
  // const name = jwtData?.data ?? 'User'

  const form = useForm<IFormInput>({
    defaultValues: {
      userId: session?.user.id ?? '',
      password1: '',
      password2: '',
      passwordless: false,
    },
  })

  async function update(data: IFormInput) {
    // if (!forceSignIn && resetLinkSent) {
    //   setCheckUserWantsToReset(true)
    //   return
    // }

    if (
      data.password1.length > 0 &&
      data.password1.length < MIN_PASSWORD_LENGTH
    ) {
      addToast({
        id: makeUuid(),
        title: TEXT_MIN_PASSWORD_LENGTH,
        type: 'destructive',
      })

      return
    }

    try {
      const csrfToken = await getCSRFToken()

      await httpFetch.post(API_UPDATE_PASSWORD_URL, {
        headers: csfrHeaders(csrfToken),
        withCredentials: true,
        body: {
          //username: data.username,
          password: data.password1,
          //callbackUrl: APP_RESET_PASSWORD_URL,
        },
      })

      if (data.password1.length === 0) {
        addToast({
          id: makeUuid(),
          title: 'You have switched to passwordless login',
          description: 'Look for a passwordless email when you sign in.',
        })
      } else {
        addToast({
          id: makeUuid(),
          title: 'Your password was updated',
          description: 'Please use your new password to sign in.',
        })
      }

      //setResetLinkSent(true)
    } catch (error) {
      addToast({
        id: makeUuid(),
        title: error as string,
        type: 'destructive',
      })

      setHasErrors(true)
    }
  }

  function onSubmit(data: IFormInput, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    if (!hasErrors) {
      update(data)
    }
  }

  return (
    <HeaderLayout>
      <HCenterRow className="grow items-center border">
        <BaseCol className="w-4/5 gap-y-8 text-sm lg:w-1/2 xl:w-1/3">
          <Card>
            <CardHeader>
              <CardTitle>Reset Password</CardTitle>
              {!hasErrors ? (
                <CardDescription>
                  Hi <span className="font-bold">{session?.user.name}</span>.
                  Please type your new password. It must contain at least 8
                  characters and may contain letters, numbers, and special
                  characters. If you leave the password blank, you will be
                  switched to passwordless sign in.
                </CardDescription>
              ) : (
                <CardDescription>
                  Tell us the username or email address associated with your
                  account, and we&apos;ll email you a link to reset your
                  password.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  className="flex flex-col gap-y-2"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <FormField
                    control={form.control}
                    name="userId"
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
                      <FormItem>
                        <Input
                          id="userId"
                          error={'userId' in form.formState.errors}
                          placeholder="User Id"
                          disabled
                          {...field}
                        >
                          {'userId' in form.formState.errors && <WarningIcon />}
                        </Input>
                        <FormInputError error={form.formState.errors.userId} />
                      </FormItem>
                    )}
                  />
                  {!hasErrors && (
                    <FormField
                      control={form.control}
                      name="password1"
                      rules={{
                        pattern: {
                          value: PASSWORD_PATTERN,
                          message: TEXT_PASSWORD_DESCRIPTION,
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <Input
                            id="password1"
                            error={'password1' in form.formState.errors}
                            type="password"
                            placeholder="Password"
                            {...field}
                          >
                            {'password1' in form.formState.errors && (
                              <WarningIcon />
                            )}
                          </Input>
                          <FormInputError
                            error={form.formState.errors.password1}
                          />
                        </FormItem>
                      )}
                    />
                  )}

                  <button ref={btnRef} type="submit" className="hidden" />
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                onClick={() => btnRef.current?.click()}
                className="w-full"
              >
                {hasErrors ? 'Re-send reset link' : TEXT_CONTINUE}
              </Button>
            </CardFooter>
          </Card>
        </BaseCol>
      </HCenterRow>
    </HeaderLayout>
  )
}

export function UpdatePasswordQueryPage() {
  return (
    <CoreProviders>
      <UpdatePasswordPage />
    </CoreProviders>
  )
}
