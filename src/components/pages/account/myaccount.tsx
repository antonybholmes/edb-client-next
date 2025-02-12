"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@components/shadcn/ui/themed/card";

import {
  EMAIL_PATTERN,
  NAME_PATTERN,
  SignInLayout,
  TEXT_EMAIL_ERROR,
  TEXT_NAME_REQUIRED,
  TEXT_USERNAME_DESCRIPTION,
  TEXT_USERNAME_REQUIRED,
  USERNAME_PATTERN,
} from "@layouts/signin-layout";

import {
  API_UPDATE_USER_URL,
  APP_ACCOUNT_SIGNED_OUT_URL,
  DEFAULT_EDB_USER,
  TEXT_MY_ACCOUNT,
  type IEdbUser,
} from "@/lib/edb/edb";

import {
  useContext,
  useEffect,
  useRef,
  useState,
  type BaseSyntheticEvent,
} from "react";

import { PasswordDialog } from "./password-dialog";

import { VCenterRow } from "@/components/layout/v-center-row";
import { FormInputError } from "@components/input-error";
import { Button } from "@components/shadcn/ui/themed/button";
import { Form, FormField, FormItem } from "@components/shadcn/ui/themed/form";

import { Input } from "@components/shadcn/ui/themed/input";
import { Label } from "@components/shadcn/ui/themed/label";

import { EdbAuthContext } from "@/lib/edb/edb-auth-provider";
import { httpFetch } from "@/lib/http/http-fetch";
import { bearerHeaders } from "@/lib/http/urls";
import { CoreProviders } from "@providers/core-providers";
import { useQueryClient } from "@tanstack/react-query";

import { useForm } from "react-hook-form";

import { OKCancelDialog } from "@/components/dialog/ok-cancel-dialog";
import { ReloadIcon } from "@/components/icons/reload-icon";
import { BaseCol } from "@/components/layout/base-col";
import { BaseGrid } from "@/components/layout/base-grid";
import { Textarea } from "@/components/shadcn/ui/themed/textarea";
import {
  APP_NAME,
  NO_DIALOG,
  TEXT_OK,
  TEXT_SAVE,
  TEXT_SIGN_OUT,
  type IDialogParams,
} from "@/consts";
import { useToast } from "@/hooks/use-toast";
import { makeRandId } from "@/lib/utils";
import { useAuth0 } from "@auth0/auth0-react";
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { EmailDialog } from "./email-dialog";

// interface IFormInput {
//   uuid: string
//   username: string
//   email: string
//   firstName: string
//   lastName: string
//   roles: string
// }

function MyAccountPage() {
  const queryClient = useQueryClient();

  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG });

  //const [password, setPassword] = useState("")
  const { toast } = useToast();

  //const [account, accountDispatch] = useContext(AccountContext)

  const btnRef = useRef<HTMLButtonElement>(null);

  //const [user, setUser] = useState<IUser | null>(null)

  //const [account, setAccount] = useState<IAccount>({...DEFAULT_ACCOUNT})
  const {
    edbSession,
    refreshSession,
    fetchSessionInfo,
    getAccessTokenAutoRefresh,
  } = useContext(EdbAuthContext);

  const { logout } = useAuth0();

  //const [roles, setRoles] = useState<string[]>([])
  //const roles = useMemo(() => rolesFromAccessToken(accessToken), [accessToken])

  const form = useForm<IEdbUser>({
    defaultValues: {
      ...DEFAULT_EDB_USER,
    },
  });

  // useEffect(() => {
  //   async function fetch() {
  //     const accessToken = await getAccessTokenAutoRefresh()

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
    form.reset({
      ...edbSession.user,
    });
  }, [edbSession]);

  async function updateRemoteUser(
    username: string,
    firstName: string,
    lastName: string
  ) {
    // force load of token in case it expired and needs
    // refresh
    const accessToken = await getAccessTokenAutoRefresh();

    try {
      // write update to remote
      await queryClient.fetchQuery({
        queryKey: ["update"],
        queryFn: () =>
          httpFetch.post(
            API_UPDATE_USER_URL, //SESSION_UPDATE_USER_URL,
            {
              body: {
                username,
                firstName,
                lastName,
              },

              headers: bearerHeaders(accessToken),
              //withCredentials: true,
            }
          ),
      });

      // what is returned is the updated user
      //const user: IUser = res.data

      // force update
      fetchSessionInfo();

      toast({
        title: "Your account information was updated",
      });
    } catch (err) {
      console.log("update err", err);

      // toast({
      //   type: 'add',
      //   alert: makeAlertFromAxiosError(err as AxiosError),
      // })
    }
  }

  async function onSubmit(data: IEdbUser, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault();

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

    updateRemoteUser(data.username, data.firstName, data.lastName);
  }

  // async function reloadAccount() {
  //   const account = await loadAccountFromCookie(true)

  //   setAccount(account)
  // }

  return (
    <SignInLayout title={TEXT_MY_ACCOUNT} showSignInError={true}>
      <>
        <PasswordDialog
          open={showDialog.id.startsWith("password")}
          onOpenChange={() => setShowDialog({ ...NO_DIALOG })}
          onReponse={() => setShowDialog({ ...NO_DIALOG })}
        />

        <EmailDialog
          open={showDialog.id.startsWith("email")}
          onOpenChange={() => setShowDialog({ ...NO_DIALOG })}
          onReponse={() => setShowDialog({ ...NO_DIALOG })}
        />

        <OKCancelDialog
          open={showDialog.id.startsWith("signout")}
          title={APP_NAME}
          modalType="Warning"
          onReponse={(r) => {
            if (r === TEXT_OK) {
              //signoutUser()
              logout({
                logoutParams: { returnTo: APP_ACCOUNT_SIGNED_OUT_URL },
              });
            }

            setShowDialog({ ...NO_DIALOG });
          }}
        >
          Are you sure you want to {TEXT_SIGN_OUT}?
        </OKCancelDialog>

        <BaseGrid className="grid-col-1 lg:grid-cols-6 p-8 gap-4 xl:gap-16 items-start">
          <BaseCol className="text-sm col-span-1 lg:col-span-5 grow gap-y-6">
            <Card>
              <CardHeader>
                <VCenterRow className="justify-between">
                  <CardTitle>{TEXT_MY_ACCOUNT}</CardTitle>
                  <Button
                    onClick={() => {
                      refreshSession();
                    }}
                    variant="muted"
                    size="icon"
                    title="Reload account information"
                  >
                    <ReloadIcon />
                  </Button>
                </VCenterRow>
                <CardDescription>
                  Update your account information. Some options cannot be
                  changed unless you contact your administrator.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <Form {...form}>
                  <form
                    className="flex flex-col gap-y-4 text-xs"
                    onSubmit={form.handleSubmit(onSubmit)}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                      <Label className="font-medium">First Name</Label>
                      <FormField
                        control={form.control}
                        name="firstName"
                        rules={{
                          required: {
                            value: true,
                            message: TEXT_NAME_REQUIRED,
                          },
                          minLength: {
                            value: 1,
                            message: TEXT_NAME_REQUIRED,
                          },
                          pattern: {
                            value: NAME_PATTERN,
                            message: "This does not seem like a valid name",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <Input
                              id="firstName"
                              className="w-full rounded-theme"
                              placeholder="First Name..."
                              readOnly={edbSession.user.isLocked}
                              {...field}
                            />

                            <FormInputError
                              error={form.formState.errors.firstName}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                      <Label className="font-medium">Last Name</Label>
                      <FormField
                        control={form.control}
                        name="lastName"
                        rules={{
                          pattern: {
                            value: NAME_PATTERN,
                            message: "This does not seem like a valid name",
                          },
                        }}
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <Input
                              id="lastName"
                              className="w-full rounded-theme"
                              placeholder="Last Name..."
                              readOnly={edbSession.user.isLocked}
                              {...field}
                            />

                            <FormInputError
                              error={form.formState.errors.lastName}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                    <span className="bg-border h-px w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
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
                          <FormItem className="col-span-1">
                            <Input
                              id="name"
                              placeholder="Username..."
                              className="w-full rounded-theme"
                              readOnly={edbSession.user.isLocked}
                              {...field}
                            />
                            <FormInputError
                              error={form.formState.errors.username}
                            />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                      <Label className="font-medium">Email</Label>
                      <div className="col-span-1">
                        <FormField
                          control={form.control}
                          name="email"
                          rules={{
                            required: {
                              value: true,
                              message: "An email address is required",
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
                                className="grow rounded-theme"
                                {...field}
                              />
                              <FormInputError
                                error={form.formState.errors.email}
                              />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        multiProps="link"
                        onClick={() =>
                          setShowDialog({ id: makeRandId("email"), params: {} })
                        }
                      >
                        Change
                      </Button>
                    </div>

                    <span className="bg-border h-px w-full" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                      <Label className="font-medium">Roles</Label>
                      <FormField
                        control={form.control}
                        name="roles"
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <Input
                              id="roles"
                              value={field.value.join(", ")}
                              className="w-full rounded-theme"
                              placeholder="Roles..."
                              readOnly

                              //{...field}
                            />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                      <Label className="font-medium">API Keys</Label>
                      <FormField
                        control={form.control}
                        name="apiKeys"
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <Textarea
                              id="apiKeys"
                              value={field.value.join(", ")}
                              className="w-full rounded-theme"
                              readOnly

                              //{...field}
                            />
                          </FormItem>
                        )}
                      />
                    </div>

                    <span className="bg-border h-px w-full" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                      <Label className="font-medium">Account Status</Label>
                      <FormField
                        control={form.control}
                        name="isLocked"
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <Input
                              id="status"
                              value={field.value ? "Locked" : "Unlocked"}
                              className="w-full rounded-theme"
                              placeholder="Account Status..."
                              readOnly
                            />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                      <Label className="font-medium">User Id</Label>

                      <FormField
                        control={form.control}
                        name="uuid"
                        render={({ field }) => (
                          <FormItem className="col-span-1">
                            <Input
                              id="uuid"
                              value={field.value}
                              className="w-full rounded-theme"
                              placeholder="Account Status"
                              readOnly
                            />
                          </FormItem>
                        )}
                      />
                    </div>

                    <button ref={btnRef} type="submit" className="hidden" />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                      <div></div>
                      <div></div>
                    </div>
                  </form>

                  <VCenterRow className="justify-between text-sm mt-8">
                    <VCenterRow className="gap-x-4">
                      <Button
                        variant="theme"
                        size="lg"
                        //className="w-full"
                        onClick={() => btnRef.current?.click()}
                      >
                        {TEXT_SAVE}
                      </Button>

                      <Button
                        variant="secondary"
                        onClick={() =>
                          setShowDialog({
                            id: makeRandId("password"),
                            params: {},
                          })
                        }
                        size="lg"
                      >
                        Change Password
                      </Button>
                    </VCenterRow>
                  </VCenterRow>
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

            <Card>
              <CardHeader>
                <CardTitle>Session</CardTitle>
              </CardHeader>

              <CardContent className="flex flex-col gap-y-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                  <div>Created</div>
                  <div className="col-span-2">
                    {format(edbSession.createdAt, "MMM, dd yyyy")} (Local time:{" "}
                    {format(edbSession.createdAt, "HH:mm:ss")}, UTC:{" "}
                    {formatInTimeZone(edbSession.createdAt, "UTC", "HH:mm:ss")})
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-start">
                  <div>Expires</div>
                  <div className="col-span-2">
                    {format(edbSession.expiresAt, "MMM, dd yyyy")} (Local time:{" "}
                    {format(edbSession.expiresAt, "HH:mm:ss")}, UTC:{" "}
                    {formatInTimeZone(edbSession.expiresAt, "UTC", "HH:mm:ss")})
                  </div>
                </div>
              </CardContent>
            </Card>
          </BaseCol>

          <div className="flex flex-row justify-between lg:flex-col lg:justify-start  gap-y-8">
            {/* <Button
              variant="theme"
              className="text-sm"
              onClick={() => refreshSession()}
              size="lg"
            >
              Renew Session
            </Button> */}

            <Button
              variant="destructive"
              className="text-sm"
              onClick={() =>
                setShowDialog({ id: makeRandId("signout"), params: {} })
              }
              size="lg"
            >
              {TEXT_SIGN_OUT}
            </Button>
          </div>
        </BaseGrid>
      </>
    </SignInLayout>
  );
}

export function MyAccountQueryPage() {
  return (
    <CoreProviders>
      <MyAccountPage />
    </CoreProviders>
  );
}
