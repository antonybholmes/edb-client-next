import {
  API_UPDATE_EMAIL_URL,
  EDB_TOKEN_PARAM,
  MYACCOUNT_PATH,
  getJwtContents,
  type IResetJwtPayload,
} from '@/components/edb/edb'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CenteredCardContainer,
} from '@/themed/card'

import { useRef, useState, type BaseSyntheticEvent } from 'react'

import { FormInputError } from '@/components/input-error'
import {
  Form,
  FormField,
  FormItem,
} from '@/components/shadcn/ui/themed/v2/form'
import { TEXT_CANCEL, TEXT_CONFIRM } from '@/consts'

import { VCenterRow } from '@/layout/v-center-row'

import { WarningButtonLink } from '@/components/link/warning-button-link'
import { Label } from '@/components/shadcn/ui/themed/v2/label'
import {
  EMAIL_PATTERN,
  FORWARD_DELAY_MS,
  SignInLayout,
  TEXT_EMAIL_ERROR,
} from '@/layouts/signin-layout'
import { bearerHeaders, redirect } from '@/lib/http/urls'
import { CoreProviders } from '@/providers/core-providers'

import { httpFetch } from '@/lib/http/http-fetch'
import { makeUuid } from '@/lib/id'
import { Button } from '@/themed/v2/button'
import { Input } from '@/themed/v2/input'
import { Toast } from '@base-ui/react/toast'
import { useForm } from 'react-hook-form'

interface IFormInput {
  email1: string
  email2: string
}

export function UpdateEmailPage() {
  const queryParameters = new URLSearchParams(window.location.search)

  const accessToken = queryParameters.get(EDB_TOKEN_PARAM) ?? ''
  const { add: addToast } = Toast.useToastManager()
  const jwtData: IResetJwtPayload | null =
    getJwtContents<IResetJwtPayload>(accessToken)

  //const { accessToken } = useAccessTokenStore()
  //const { account } = useUserStore(accessToken)

  const btnRef = useRef<HTMLButtonElement>(null)

  const [, setHasErrors] = useState(false)

  const form = useForm<IFormInput>({
    defaultValues: {
      email1: jwtData ? jwtData.data! : '',
      email2: '',
    },
  })

  async function update(data: IFormInput) {
    try {
      await httpFetch.post(API_UPDATE_EMAIL_URL, {
        body: { email: data.email1 },
        headers: bearerHeaders(accessToken),
      })

      addToast({
        id: makeUuid(),
        title: 'Your email address was updated',
        description: 'Please use your new email address to sign in.',
        type: 'success',
      })

      setTimeout(() => {
        redirect(`${MYACCOUNT_PATH}?refresh=true`)
      }, FORWARD_DELAY_MS)
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

    if (jwtData) {
      update(data)
    }
  }

  return (
    <SignInLayout title="Change Email Address">
      <>
        <CenteredCardContainer>
          <Card>
            <CardHeader>
              <CardTitle>Change Email Address</CardTitle>

              <CardDescription>
                If you wish to change your email address to the one shown below,
                please click Confirm to continue. Otherwise, click Cancel or
                navigate away from this page to prevent changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  className="flex flex-col gap-y-2"
                  onSubmit={form.handleSubmit(onSubmit)}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Label className="font-medium">New Email Address</Label>
                    <FormField
                      control={form.control}
                      name="email1"
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
                        <FormItem className="col-span-2">
                          <Input
                            id="email1"
                            //error={"email1" in form.formState.errors}
                            readOnly
                            placeholder="New Email address"
                            {...field}
                          >
                            {/* {"email1" in form.formState.errors && <WarningIcon />} */}
                          </Input>
                          <FormInputError
                            error={form.formState.errors.email1}
                          />
                        </FormItem>
                      )}
                    />
                  </div>
                  <button ref={btnRef} type="submit" className="hidden" />
                </form>
              </Form>
            </CardContent>
            <CardFooter>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center w-full">
                <div></div>
                <div className="col-span-2">
                  <Button size="lg" onClick={() => btnRef.current?.click()}>
                    {TEXT_CONFIRM}
                  </Button>
                </div>
              </div>
            </CardFooter>
          </Card>
          <VCenterRow className="justify-end">
            <WarningButtonLink
              href="/"
              aria-label="Cancel changing email address"
              size="lg"
            >
              {TEXT_CANCEL}
            </WarningButtonLink>
          </VCenterRow>
        </CenteredCardContainer>
      </>
    </SignInLayout>
  )
}

export function UpdateEmailQueryPage() {
  return (
    <CoreProviders>
      <UpdateEmailPage />
    </CoreProviders>
  )
}
