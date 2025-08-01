'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@themed/card'

import {
  EMAIL_PATTERN,
  NAME_PATTERN,
  TEXT_EMAIL_ERROR,
  TEXT_USERNAME_DESCRIPTION,
  TEXT_USERNAME_REQUIRED,
  USERNAME_PATTERN,
} from '@layouts/signin-layout'

import {
  DEFAULT_EDB_USER,
  SESSION_UPDATE_USER_URL,
  TEXT_MY_ACCOUNT,
  type IEdbUser,
} from '@lib/edb/edb'

import { useEffect, useRef, type BaseSyntheticEvent } from 'react'

import { FormInputError } from '@components/input-error'
import { VCenterRow } from '@layout/v-center-row'
import { Button } from '@themed/button'
import { Form, FormField, FormItem } from '@themed/form'

import { Input } from '@themed/input'
import { Label } from '@themed/label'

import { useCSRF, useEdbAuth } from '@lib/edb/edb-auth'
import { httpFetch } from '@lib/http/http-fetch'
import { csfrHeaders } from '@lib/http/urls'
import { useQueryClient } from '@tanstack/react-query'

import { useForm } from 'react-hook-form'

import { TEXT_SAVE } from '@/consts'
import { ReloadIcon } from '@icons/reload-icon'
import { BaseCol } from '@layout/base-col'
import { Textarea } from '@themed/textarea'

import { CenterLayout } from '@/layouts/center-layout'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from '@themed/crisp'
import { IconButton } from '@themed/icon-button'
import { format } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'
import z from 'zod'
import { PasswordCard } from './password-card'

// interface IFormInput {
//   uuid: string
//   username: string
//   email: string
//   firstName: string
//   lastName: string
//   roles: string
// }

const FormSchema = z.object({
  publicId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
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
    z.string().email({
      message: TEXT_EMAIL_ERROR,
    }),
  ]),
  email: z.string().email({
    message: TEXT_EMAIL_ERROR,
  }),
  roles: z.array(z.string()),

  isLocked: z.boolean(),
  apiKeys: z.array(z.string()),
})

export function MyAccountPage() {
  const queryClient = useQueryClient()

  //const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  //const [password, setPassword] = useState("")

  //const [account, accountDispatch] = useContext(AccountContext)

  const btnRef = useRef<HTMLButtonElement>(null)

  //const [user, setUser] = useState<IUser | null>(null)

  //const [account, setAccount] = useState<IAccount>({...DEFAULT_ACCOUNT})
  const { fetchToken } = useCSRF()
  const { session, csrfToken, refreshSession, fetchUpdateToken } = useEdbAuth()

  //const [roles, setRoles] = useState<string[]>([])
  //const roles = useMemo(() => rolesFromAccessToken(accessToken), [accessToken])

  // const form = useForm<IEdbUser>({
  //   defaultValues: {
  //     ...DEFAULT_EDB_USER,
  //   },
  // })

  const form = useForm({
    resolver: zodResolver(FormSchema),
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
    if (session) {
      form.reset({
        ...session.user,
      })
    }
  }, [session])

  async function updateRemoteUser(
    username: string,
    firstName: string,
    lastName: string
  ) {
    // force load of token in case it expired and needs
    // refresh

    try {
      const updateToken = await fetchUpdateToken()

      console.log('update token', updateToken)

      // write update to remote
      await queryClient.fetchQuery({
        queryKey: ['update'],
        queryFn: () =>
          httpFetch.post(SESSION_UPDATE_USER_URL, {
            body: {
              username,
              firstName,
              lastName,
            },

            //headers: bearerHeaders(updateToken),
            headers: csfrHeaders(csrfToken),
            withCredentials: true,
          }),
      })

      // what is returned is the updated user
      //const user: IUser = res.data

      // force update
      refreshSession()

      toast({
        title: 'Your account information was updated',
        variant: 'success',
        description: 'Please check your email for any changes.',
      })
    } catch (err) {
      console.log('update err', err)

      toast({
        title: 'Your account information could not be updated',
        variant: 'destructive',
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

    updateRemoteUser(data.username, data.firstName, data.lastName)
  }

  // async function reloadAccount() {
  //   const account = await loadAccountFromCookie(true)

  //   setAccount(account)
  // }

  const now = new Date()

  return (
    <CenterLayout title={TEXT_MY_ACCOUNT}>
      <BaseCol className="text-sm gap-y-8 px-2">
        <Card className="shadow-md lg:w-192">
          <CardHeader>
            <CardTitle>{TEXT_MY_ACCOUNT}</CardTitle>

            <VCenterRow className="justify-between">
              <CardDescription>
                Update your account information.
              </CardDescription>

              <VCenterRow className="gap-x-2">
                <IconButton
                  size="icon-lg"
                  onClick={() => {
                    refreshSession()
                  }}
                  title="Reload account information"
                >
                  <ReloadIcon />
                </IconButton>
                <Button
                  variant="theme"
                  size="lg"
                  //className="w-full"
                  onClick={() => btnRef.current?.click()}
                >
                  {TEXT_SAVE}
                </Button>
              </VCenterRow>
            </VCenterRow>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                className="flex flex-col gap-y-4 text-xs"
                onSubmit={form.handleSubmit(onSubmit)}
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-4 items-center">
                  <Label className="font-medium">First Name</Label>
                  <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
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
                            id="firstName"
                            placeholder="First Name..."
                            readOnly={session?.user.isLocked}
                            variant="underline"
                            {...field}
                          />

                          <FormInputError
                            error={form.formState.errors.firstName}
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      rules={{
                        pattern: {
                          value: NAME_PATTERN,
                          message: 'This does not seem like a valid name',
                        },
                      }}
                      render={({ field }) => (
                        <FormItem>
                          <Input
                            id="lastName"
                            placeholder="Last Name..."
                            readOnly={session?.user.isLocked}
                            variant="underline"
                            {...field}
                          />

                          <FormInputError
                            error={form.formState.errors.lastName}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div />
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
                      <FormItem className="col-span-1 md:col-span-2">
                        <Input
                          id="name"
                          placeholder="Username..."
                          readOnly={session?.user.isLocked}
                          variant="underline"
                          {...field}
                        />
                        <FormInputError
                          error={form.formState.errors.username}
                        />
                      </FormItem>
                    )}
                  />
                  <div />
                  <Label className="font-medium">Email</Label>
                  <div className="col-span-1 md:col-span-2">
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
                            readOnly
                            variant="underline"
                            {...field}
                          />
                          <FormInputError error={form.formState.errors.email} />
                        </FormItem>
                      )}
                    />
                  </div>
                  {/* <LinkButton
                      onClick={() =>
                        setShowDialog({ id: randId('email'), params: {} })
                      }
                    >
                      Change
                    </LinkButton> */}
                  <div />

                  <Label className="font-medium">Roles</Label>
                  <FormField
                    control={form.control}
                    name="roles"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <Input
                          id="roles"
                          value={field.value.join(', ')}
                          placeholder="Roles..."
                          readOnly
                          variant="underline"
                          //{...field}
                        />
                      </FormItem>
                    )}
                  />
                  <div />
                  <Label className="font-medium">API Keys</Label>
                  <FormField
                    control={form.control}
                    name="apiKeys"
                    render={({ field }) => (
                      <FormItem className="col-span-1 md:col-span-2">
                        <Textarea
                          id="apiKeys"
                          value={field.value.join(', ')}
                          readOnly
                          variant="underline"
                          className="h-12"
                          //{...field}
                        />
                      </FormItem>
                    )}
                  />
                  <div />

                  <Label className="font-medium">Account</Label>
                  <div className="col-span-1 md:col-span-2 grid grid-cols-4 gap-4 items-center">
                    <FormField
                      control={form.control}
                      name="publicId"
                      render={({ field }) => (
                        <FormItem className="col-span-3">
                          <Input
                            id="publicId"
                            variant="underline"
                            value={field.value}
                            placeholder="Account Status"
                            readOnly
                          />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isLocked"
                      render={({ field }) => (
                        <FormItem>
                          <span>{field.value ? 'Locked' : 'Unlocked'}</span>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div />
                </div>

                <button ref={btnRef} type="submit" className="hidden" />
              </form>
            </Form>
          </CardContent>
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
        </Card>

        <PasswordCard />

        <BaseCol className="gap-y-2 text-xs">
          <CardTitle>Session</CardTitle>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-start text-xs">
            {/* <div>Created</div>
              <div className="col-span-2">
                {format(session?.createdAt ?? now, 'MMM, dd yyyy')} (Local time:{' '}
                {format(session?.createdAt ?? now, 'HH:mm:ss')}, UTC:{' '}
                {formatInTimeZone(session?.createdAt ?? now, 'UTC', 'HH:mm:ss')}
                )
              </div>
              <div /> */}

            <div>Expires</div>
            <div className="col-span-2">
              {format(session?.expiresAt ?? now, 'MMM, dd yyyy')} (Local time:{' '}
              {format(session?.expiresAt ?? now, 'HH:mm:ss')}, UTC:{' '}
              {formatInTimeZone(session?.expiresAt ?? now, 'UTC', 'HH:mm:ss')})
            </div>
          </div>
        </BaseCol>

        <VCenterRow className="justify-end">
          <Button
            variant="secondary"
            size="lg"
            onClick={() => {
              fetchToken()
            }}
            title="Generate a new CSRF token"
          >
            New CSRF Token
          </Button>
        </VCenterRow>

        {/* <p className="text-xs text-foreground/50">
            Some options cannot be changed unless you contact your
            administrator.
          </p> */}

        {/* <VCenterRow className="justify-end">
    

            <Button
              variant="destructive"
              className="text-sm"
              onClick={() =>
                setShowDialog({ id: randId('signout'), params: {} })
              }
              size="lg"
            >
              {TEXT_SIGN_OUT}
            </Button>
          </VCenterRow> */}
      </BaseCol>
    </CenterLayout>
  )
}
