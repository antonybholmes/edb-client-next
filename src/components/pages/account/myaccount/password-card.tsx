import { SESSION_UPDATE_PASSWORD_URL } from '@lib/edb/edb'

//import { AccountSettingsContext } from "@context/account-settings-context"

import { useRef, type BaseSyntheticEvent } from 'react'

import { FormInputError } from '@/components/input-error'
import { Button } from '@/components/shadcn/ui/themed/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/ui/themed/card'
import { toast } from '@/components/shadcn/ui/themed/crisp'
import { Form, FormField, FormItem } from '@/components/shadcn/ui/themed/form'
import { Input } from '@/components/shadcn/ui/themed/input'
import { Label } from '@/components/shadcn/ui/themed/label'
import { TEXT_UPDATE } from '@/consts'
import { httpFetch } from '@/lib/http/http-fetch'

import { BaseCol } from '@/components/layout/base-col'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEdbAuth } from '@lib/edb/edb-auth'
import { csfrHeaders } from '@lib/http/urls'
import { useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import z from 'zod'

export const MIN_PASSWORD_LENGTH = 8

export const PASSWORD_PATTERN = /^[\w!@#$%^&*.?]{8,}/

export const TEXT_PASSWORD_PATTERN_DESCRIPTION =
  'A password must contain at least 8 characters, which can be letters, numbers, and special characters like !@#$%^&*.?'

export const TEXT_PASSWORD_DESCRIPTION =
  'For security, a link to change your password will be sent to your current email address.'

export const TEXT_PASSWORD_REQUIRED = 'A password is required'

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
      type: 'newPassword2'
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

const FormSchema = z.object({
  password: z.string(),
  newPassword: z.string().regex(PASSWORD_PATTERN, {
    message: TEXT_PASSWORD_PATTERN_DESCRIPTION,
  }),
  newPassword2: z.string().regex(PASSWORD_PATTERN, {
    message: TEXT_PASSWORD_PATTERN_DESCRIPTION,
  }),
})

export function PasswordCard() {
  const queryClient = useQueryClient()

  const { session } = useEdbAuth()

  const btnRef = useRef<HTMLButtonElement>(null)

  //const [user, setUser] = useState<IUser | null>(null)

  //const { accessToken } = useAccessTokenStore()

  const { csrfToken } = useEdbAuth()

  //const [passwordless, setPasswordless] = useState(settings.passwordless)

  // useEffect(() => {
  //   async function fetch() {
  //     const token = await fetchAccessToken()

  //     setAccessToken(token)

  //     setUser(await getCachedUser(token))
  //   }

  //   fetch()
  // }, [])

  // if (!session || !accessToken) {
  //   return null
  // }

  async function updatePassword(password: string, newPassword: string) {
    try {
      await queryClient.fetchQuery({
        queryKey: ['update'],
        queryFn: () =>
          httpFetch.postJson(SESSION_UPDATE_PASSWORD_URL, {
            body: {
              password,
              newPassword,
            },
            headers: csfrHeaders(csrfToken),
            withCredentials: true,
          }),
      })

      toast({
        title: 'Your password was updated',
        variant: 'success',
        description: 'An email will be sent to your address.',
      })
    } catch (err) {
      console.log('update err', err)

      toast({
        title: 'Your password could not be updated',
        variant: 'destructive',
        description: 'Please try again later.',
      })
    }
  }

  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      password: '',
      newPassword: '',
      newPassword2: '',
    },
  })

  async function onSubmit(
    data: { password: string; newPassword: string; newPassword2: string },
    e: BaseSyntheticEvent | undefined
  ) {
    e?.preventDefault()

    console.log('onSubmit', data)

    if (data.newPassword !== data.newPassword2) {
      form.setError('newPassword2', {
        type: 'manual',
        message: 'Passwords do not match',
      })
      return
    }

    updatePassword(data.password, data.newPassword)
  }

  return (
    <Card className="shadow-md lg:w-192">
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
          onClick={() => btnRef.current?.click()}
          disabled={session?.user.isLocked}
        >
          {TEXT_UPDATE}
        </Button>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form
            className="flex flex-col gap-y-4 text-xs"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center">
              <Label className="font-medium">Current Password</Label>
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
                  <FormItem className="col-span-1 md:col-span-2">
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
              <div />
              <Label className="font-medium">New Password</Label>
              <FormField
                control={form.control}
                name="newPassword"
                rules={{
                  pattern: {
                    value: PASSWORD_PATTERN,
                    message: TEXT_PASSWORD_DESCRIPTION,
                  },
                }}
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
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
              <div />

              <Label className="font-medium">Retype Password</Label>
              <FormField
                control={form.control}
                name="newPassword2"
                rules={{
                  pattern: {
                    value: PASSWORD_PATTERN,
                    message: TEXT_PASSWORD_DESCRIPTION,
                  },
                }}
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <Input
                      id="newPassword2"
                      type="password"
                      error={'newPassword2' in form.formState.errors}
                      placeholder="Retype Password"
                      variant="underline"
                      {...field}
                    />
                    <FormInputError
                      error={form.formState.errors.newPassword2}
                    />
                  </FormItem>
                )}
              />
              <div />
            </div>

            <button ref={btnRef} type="submit" className="hidden" />
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
