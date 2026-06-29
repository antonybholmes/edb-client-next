'use client'

import {
    EMAIL_PATTERN,
    NAME_PATTERN,
    TEXT_EMAIL_ERROR,
    TEXT_USERNAME_REQUIRED,
} from '@/layouts/signin-layout'

import {
    DEFAULT_EDB_USER,
    flattenRoles,
    SESSION_UPDATE_USER_URL,
    TEXT_MY_ACCOUNT,
    type IAuthProvider,
    type IEdbUser,
} from '@/lib/edb/edb'

import { useEffect, useRef, useState, type BaseSyntheticEvent } from 'react'

import { FormInputError } from '@/components/input-error'
import {
    Form,
    FormField,
    FormItem,
} from '@/components/shadcn/ui/themed/v2/form'
import { VCenterRow } from '@/layout/v-center-row'
import { Button } from '@/themed/v2/button'

import { Label } from '@/components/shadcn/ui/themed/v2/label'
import { Input } from '@/themed/v2/input'

import { SIGNIN_METHOD_MAP, useEdbAuth } from '@/lib/edb/edb-auth'
import { httpFetch } from '@/lib/http/http-fetch'
import { csfrHeaders } from '@/lib/http/urls'

import { useForm } from 'react-hook-form'

import { IS_DEV_MODE, TEXT_SAVE, TEXT_SIGNED_IN } from '@/consts'
import { ReloadIcon } from '@/icons/reload-icon'
import { Textarea } from '@/themed/textarea'

import { formattedList } from '@/lib/text/text'
import { CoreProviders } from '@/providers/core-providers'

import { ScrollAccordion } from '@/components/shadcn/ui/themed/v2/accordion'
import { SettingsAccordionItem } from '@/dialogs/settings/settings-dialog'
import { CenterLayout } from '@/layouts/center-layout'

import { fetchCSRFTokenFromServer, getCSRFToken } from '@/lib/edb/csrf'
import { makeUuid } from '@/lib/id'
import { IconButton } from '@/themed/icon-button'
import { Toast } from '@base-ui/react/toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import z from 'zod'
import { PasswordCard } from './password-card'

export const UserFormSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.union([
    z
      .string()
      .min(1, {
        message: TEXT_USERNAME_REQUIRED,
      })
      .regex(
        /^[a-zA-Z0-9]+$/,
        'Username must consist of letters and numbers only or else be an email address.'
      ),
    z.email({
      message: TEXT_EMAIL_ERROR,
    }),
  ]),
  email: z.email({
    message: TEXT_EMAIL_ERROR,
  }),
  pictureUrl: z.string(),
  groups: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      roles: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          permissions: z.array(
            z.object({
              id: z.string(),
              name: z.string(),
            })
          ),
        })
      ),
    })
  ),
  authProviders: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      updatedAt: z.string(),
    })
  ),

  isLocked: z.boolean(),
  apiKeys: z.array(z.string()),
})

export function MyAccountPage() {
  const btnRef = useRef<HTMLButtonElement>(null)

  const { add: addToast } = Toast.useToastManager()

  //const [account, setAccount] = useState<IAccount>({...DEFAULT_ACCOUNT})
  //const { token: csrf, fetchToken } = useCSRF()
  //const { signinMethod } = useEdbSignIn()
  const { session, refreshSession, fetchUpdateToken } = useEdbAuth()

  //const [roles, setRoles] = useState<string[]>([])
  //const roles = useMemo(() => rolesFromAccessToken(accessToken), [accessToken])

  // const form = useForm<IEdbUser>({
  //   defaultValues: {
  //     ...DEFAULT_EDB_USER,
  //   },
  // })

  const [tabs, setTabs] = useState<string[]>([
    'my-account',
    'password',
    'session',
  ])

  const [csrf, setCsrf] = useState('')

  const form = useForm({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      ...DEFAULT_EDB_USER,
    },
  })

  //logger.debug('form', csrfToken)

  // useEffect(() => {
  //   async function fetch() {
  //     const accessToken = await fetchAccessToken()

  //     //setUser(await getUser(accessToken))

  //     //setRoles(rolesFromAccessToken(accessToken))
  //   }

  //   fetch()
  // }, [])

  // useEffect(()=> {
  //   if (accessToken && reload) {
  //     refreshAccount()
  //   }
  // },[accessToken])

  useEffect(() => {
    async function fetchToken() {
      const token = await getCSRFToken()

      setCsrf(token)
    }

    fetchToken()
  }, [])

  useEffect(() => {
    if (session) {
      form.reset({
        ...session.user,
      })
    }
  }, [session])

  async function updateRemoteUser(username: string, name: string) {
    // force load of token in case it expired and needs
    // refresh

    try {
      const updateToken = await fetchUpdateToken()

      const csrfToken = await getCSRFToken()

      await httpFetch.post(SESSION_UPDATE_USER_URL, {
        body: {
          username,
          name,
        },

        //headers: bearerHeaders(updateToken),
        headers: csfrHeaders(csrfToken),
        withCredentials: true,
      })

      // what is returned is the updated user
      //const user: IUser = res.data

      // force update
      refreshSession()

      addToast({
        id: makeUuid(),
        title: 'Your account information was updated',
        type: 'success',
        description: 'You will receive a confirmation email shortly.',
      })
    } catch (err) {
      addToast({
        id: makeUuid(),
        title: 'Your account information could not be updated',
        type: 'destructive',
        description: 'Please try again later.',
      })
    }
  }

  async function onSubmit(data: IEdbUser, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    // if (password.length < 8) {
    //   toast({
    //     type: "add",
    //     alert: makeAlert({
    //       title:"Password",
    //       message: "Please enter your current password.",
    //       type: "error",
    //     }),
    //   })
    //   return
    // }

    updateRemoteUser(data.username, data.name)
  }

  // async function reloadAccount() {
  //   const account = await loadAccountFromCookie(true)

  //   setAccount(account)
  // }

  const now = new Date()

  //sort authproviders by updated data
  const authProviders: IAuthProvider[] = session
    ? session.user.authProviders.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
    : []

  return (
    <CenterLayout title={TEXT_MY_ACCOUNT}>
      <ScrollAccordion
        value={tabs}
        //variant={variant}
        // if user species onChange, let them handle which
        // accordions are open, otherwise we'll do it internally
        onValueChange={(v) => setTabs(v as string[])}
        className="w-9/10 xl:w-2/3"
        variant="settings"
      >
        <SettingsAccordionItem title={TEXT_MY_ACCOUNT} showBorder={false}>
          <Form {...form}>
            <form
              className="flex flex-col gap-y-4 text-xs"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                <Label className="font-medium" htmlFor="name">
                  Name
                </Label>
                <div className="col-span-1 md:col-span-3">
                  <FormField
                    control={form.control}
                    name="name"
                    rules={{
                      // required: {
                      //   value: true,
                      //   message: TEXT_NAME_REQUIRED,
                      // },
                      // minLength: {
                      //   value: 1,
                      //   message: TEXT_NAME_REQUIRED,
                      // },
                      pattern: {
                        value: NAME_PATTERN,
                        message: 'This does not seem like a valid name',
                      },
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <Input
                          id="name"
                          placeholder="Name..."
                          readOnly={session?.user.isLocked}
                          //variant="underline"
                          {...field}
                        />

                        <FormInputError error={form.formState.errors.name} />
                      </FormItem>
                    )}
                  />
                </div>

                <Label className="font-medium" htmlFor="email">
                  Email
                </Label>
                <div className="col-span-1 md:col-span-3">
                  <FormField
                    control={form.control}
                    name="email"
                    rules={{
                      required: {
                        value: true,
                        message: 'An email address is required',
                      },
                      pattern: {
                        value: EMAIL_PATTERN,
                        message: TEXT_EMAIL_ERROR,
                      },
                    }}
                    render={({ field }) => (
                      <FormItem className="grow">
                        <Input
                          id="email"
                          placeholder="Email..."
                          autoComplete="email"
                          readOnly
                          //variant="underline"
                          {...field}
                        />
                        <FormInputError error={form.formState.errors.email} />
                      </FormItem>
                    )}
                  />
                </div>

                <Label className="font-medium" htmlFor="pictureUrl">
                  Picture
                </Label>

                <div className="col-span-1 md:col-span-3">
                  <FormField
                    control={form.control}
                    name="pictureUrl"
                    render={({ field }) => (
                      <FormItem className="grow">
                        <Input
                          id="pictureUrl"
                          placeholder="Picture URL..."
                          readOnly
                          //variant="underline"
                          {...field}
                        />
                        <FormInputError error={form.formState.errors.email} />
                      </FormItem>
                    )}
                  />
                </div>

                <Label className="font-medium" htmlFor="groups">
                  Groups
                </Label>
                <FormField
                  control={form.control}
                  name="groups"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-3">
                      <Textarea
                        id="groups"
                        value={formattedList(
                          field.value.map((group) => group.name).sort()
                        )}
                        placeholder="Groups..."
                        readOnly
                        //variant="underline"
                        className="h-16"
                        //{...field}
                      />
                    </FormItem>
                  )}
                />

                <Label className="font-medium" htmlFor="roles">
                  Roles
                </Label>
                <FormField
                  control={form.control}
                  name="groups"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-3">
                      <Textarea
                        id="roles"
                        value={formattedList(flattenRoles(field.value))}
                        placeholder="Roles..."
                        readOnly
                        //variant="underline"
                        className="h-16"
                        //{...field}
                      />
                    </FormItem>
                  )}
                />

                <Label className="font-medium" htmlFor="apiKeys">
                  API Keys
                </Label>
                <FormField
                  control={form.control}
                  name="apiKeys"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-3">
                      <Textarea
                        id="apiKeys"
                        value={field.value.join(', ')}
                        readOnly
                        //variant="underline"
                        className="h-16"
                        //{...field}
                      />
                    </FormItem>
                  )}
                />

                <Label className="font-medium" htmlFor="accountStatus">
                  Account Status
                </Label>

                <FormField
                  control={form.control}
                  name="isLocked"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-3">
                      <Input
                        id="accountStatus"
                        //variant="underline"
                        value={field.value ? 'Locked' : 'Unlocked'}
                        placeholder="Account Status"
                        readOnly
                      />
                    </FormItem>
                  )}
                />

                <Label className="font-medium" htmlFor="id">
                  Account ID
                </Label>

                <FormField
                  control={form.control}
                  name="id"
                  render={({ field }) => (
                    <FormItem className="col-span-1 md:col-span-3">
                      <Input
                        id="id"
                        //variant="underline"
                        value={field.value}
                        placeholder="Account ID"
                        readOnly
                      />
                    </FormItem>
                  )}
                />
              </div>

              <button ref={btnRef} type="submit" className="hidden" />
            </form>
          </Form>

          <VCenterRow className="gap-x-2 justify-between">
            <IconButton
              size="md"
              rounded="full"
              onClick={() => {
                refreshSession()
              }}
              title="Reload account information"
            >
              <ReloadIcon />
            </IconButton>
            <Button
              variant="theme"
              size="md"
              //rounded="full"
              className="w-18 text-sm"
              ripple={true}
              //className="w-full"
              onClick={() => btnRef.current?.click()}
            >
              {TEXT_SAVE}
            </Button>
          </VCenterRow>

          {/* <CardFooter>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center w-full">
                <div></div>
                <div className="col-span-1">
                   <Button
                    variant="theme"
                    size="lg"
                    //className="w-full"
                    onClick={() => btnRef.current?.click()}
                  >
                    Save Changes
                  </Button> 
                </div>
              </div>
            </CardFooter> */}
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Password">
          <PasswordCard />
        </SettingsAccordionItem>

        <SettingsAccordionItem title="Session">
          {authProviders.length > 0 && (
            <>
              <p className="text-sm">
                {TEXT_SIGNED_IN} using{' '}
                <strong>
                  {SIGNIN_METHOD_MAP[
                    authProviders[0]!.name as keyof typeof SIGNIN_METHOD_MAP
                  ] ?? 'Default'}
                </strong>{' '}
                at{' '}
                <strong>
                  {format(
                    new Date(authProviders[0]!.updatedAt) ?? now,
                    'MMM, dd yyyy HH:mm:ss'
                  )}
                </strong>
              </p>
              <p className="text-sm">
                Session expires{' '}
                <strong>
                  {format(session?.expiresAt ?? now, 'MMM, dd yyyy')}{' '}
                  {format(session?.expiresAt ?? now, 'HH:mm:ss')} (
                  {formatInTimeZone(
                    session?.expiresAt ?? now,
                    'UTC',
                    'HH:mm:ss'
                  )}{' '}
                  UTC)
                </strong>
              </p>
            </>
          )}

          {IS_DEV_MODE && (
            <VCenterRow className="gap-x-2 justify-between text-sm">
              <span>
                CSRF Token: <strong>{csrf}</strong>
              </span>

              <IconButton
                rounded="full"
                onClick={async () => {
                  setCsrf(await fetchCSRFTokenFromServer())
                }}
                title="Generate a new CSRF token"
              >
                <ReloadIcon />
              </IconButton>
            </VCenterRow>
          )}
        </SettingsAccordionItem>
      </ScrollAccordion>
    </CenterLayout>
  )
}

export function MyAccountQueryPage() {
  return (
    <CoreProviders>
      <MyAccountPage />
    </CoreProviders>
  )
}
