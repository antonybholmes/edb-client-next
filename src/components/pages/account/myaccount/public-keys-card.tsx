import { SESSION_UPDATE_PASSWORD_URL } from '@/lib/edb/edb'

//import { AccountSettingsContext } from "@/context/account-settings-context"

import { useRef, type BaseSyntheticEvent } from 'react'

import { TEXT_UPDATE } from '@/consts'
import { httpFetch } from '@/lib/http/http-fetch'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/themed/card'

import { Button } from '@/themed/v2/button'

import { BaseCol } from '@/components/layout/base-col'

import { getCSRFToken } from '@/lib/edb/csrf'
import { useEdbAuth } from '@/lib/edb/edb-auth'
import { csfrHeaders } from '@/lib/http/urls'
import { makeUuid } from '@/lib/id'
import { Toast } from '@base-ui/react/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import z from 'zod'

export const MIN_PASSWORD_LENGTH = 8

//export const PASSWORD_PATTERN = /^[\w!@#$%^&*.?]{8,}/

//export const TEXT_PASSWORD_PATTERN_DESCRIPTION =
//  'A password must contain at least 8 characters, which can be letters, numbers, and special characters like !@#$%^&*.?'

// export const TEXT_PASSWORD_DESCRIPTION =
//   'For security, a link to change your password will be sent to your current email address.'

// export const TEXT_PASSWORD_REQUIRED = 'A password is required'

export type IPasswordAction =
  | {
      type: 'password'
      password: string
    }
  | {
      type: 'newPassword'
      password: string
    }
  | {
      type: 'retypePassword'
      password: string
    }

// interface PasswordState {
//   password: string
//   newPassword: string
//   newPassword2: string
// }

// function passwordReducer(state: PasswordState, action: IPasswordAction) {
//   switch (action.type) {
//     case "password":
//       return { ...state, password: action.password }
//     case "newPassword":
//       return { ...state, newPassword: action.password }
//     case "newPassword2":
//       return { ...state, newPassword2: action.password }
//     default:
//       return state
//   }
// }

const FormSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string().min(1),
    key: z.string().min(1),
  })
)

export function PublicKeysCard() {
  const { session } = useEdbAuth()

  const btnRef = useRef<HTMLButtonElement>(null)

  const { add: addToast } = Toast.useToastManager()

  async function updatePassword(password: string, newPassword: string) {
    try {
      const csrfToken = await getCSRFToken()

      await httpFetch.postJson(SESSION_UPDATE_PASSWORD_URL, {
        body: {
          password,
          newPassword,
        },
        headers: csfrHeaders(csrfToken),
        withCredentials: true,
      })

      addToast({
        id: makeUuid(),
        title: 'Your password was updated',
        type: 'success',
        description: 'An email will be sent to your address.',
      })
    } catch (err) {
      addToast({
        id: makeUuid(),
        title: 'Your password could not be updated',
        type: 'destructive',
        description: 'Please try again later.',
      })
    }
  }

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: [],
  })

  async function onSubmit(
    data: { password: string; newPassword: string; retypePassword: string },
    e: BaseSyntheticEvent | undefined
  ) {
    e?.preventDefault()

    // if (data.newPassword !== data.retypePassword) {
    //   form.setError('retypePassword', {
    //     type: 'manual',
    //     message: 'Passwords do not match',
    //   })
    //   return
    // }

    updatePassword(data.password, data.newPassword)
  }

  return (
    <Card className="lg:w-3xl">
      <CardHeader className="flex flex-row items-start justify-between">
        <BaseCol className="gap-y-2">
          <CardTitle>Password</CardTitle>

          <CardDescription>
            Update your password. This is optional if you are using passwordless
            sign in.
          </CardDescription>
        </BaseCol>

        <Button
          variant="theme"
          size="lg"
          rounded="full"
          className="w-20"
          ripple={true}
          onClick={() => btnRef.current?.click()}
          disabled={session?.user.isLocked ?? false}
        >
          {TEXT_UPDATE}
        </Button>
      </CardHeader>

      <CardContent>
        {/* <Form {...form}>
          <form
            className="flex flex-col gap-y-4 text-xs"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center">
              <Label className="font-medium" htmlFor="password">
                Current Password
              </Label>
              <FormField
                control={form.control}
                name="password"
                rules={{
                  pattern: {
                    value: PASSWORD_PATTERN,
                    message: TEXT_PASSWORD_DESCRIPTION,
                  },
                }}
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-3">
                    <Input
                      id="password"
                      type="password"
                      error={'password' in form.formState.errors}
                      placeholder="Current Password"
                      variant="underline"
                      {...field}
                    />
                    <FormInputError error={form.formState.errors.password} />
                  </FormItem>
                )}
              />

              <Label className="font-medium" htmlFor="newPassword">
                New Password
              </Label>
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-3">
                    <Input
                      id="newPassword"
                      type="password"
                      error={'newPassword' in form.formState.errors}
                      placeholder="New Password"
                      variant="underline"
                      {...field}
                    />
                    <FormInputError error={form.formState.errors.newPassword} />
                  </FormItem>
                )}
              />

              <Label className="font-medium" htmlFor="retypePassword">
                Retype Password
              </Label>
              <FormField
                control={form.control}
                name="retypePassword"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-3">
                    <Input
                      id="retypePassword"
                      type="password"
                      error={'newPassword2' in form.formState.errors}
                      placeholder="Retype Password"
                      variant="underline"
                      {...field}
                    />
                    <FormInputError
                      error={form.formState.errors.retypePassword}
                    />
                  </FormItem>
                )}
              />
            </div>

            <button ref={btnRef} type="submit" className="hidden" />
          </form>
        </Form> */}
      </CardContent>
    </Card>
  )
}
