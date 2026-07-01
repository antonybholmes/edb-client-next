import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import { API_RESET_EMAIL_URL, APP_UPDATE_EMAIL_URL } from '@/components/edb/edb'
import { TEXT_OK } from '@/consts'

import { FormInputError } from '@/components/input-error'
import {
  Form,
  FormField,
  FormItem,
} from '@/components/shadcn/ui/themed/v2/form'
import { Input } from '@/themed/v2/input'
//import { AccountContext } from "@/hooks/use-account"
import { EMAIL_PATTERN } from '@/layouts/signin-layout'

import { useEdbAuth } from '@/components/edb/auth/edb-auth'
import { bearerHeaders } from '@/lib/http/urls'

import { httpFetch } from '@/lib/http/http-fetch'
import { makeUuid } from '@/lib/id'
import { Toast } from '@base-ui/react/toast'
import { useRef, type BaseSyntheticEvent } from 'react'
import { useForm } from 'react-hook-form'

export const TEXT_EMAIL_DESCRIPTION =
  'To change your email address, a link will be sent to your new email address to verify ownership. Click the Ok button to send the link.'

export type IPasswordAction = {
  type: 'email'
  password: string
}

// interface PasswordState {
//   password: string
//   password1: string
//   password2: string
// }

// function passwordReducer(state: PasswordState, action: IPasswordAction) {
//   switch (action.type) {
//     case "password":
//       return { ...state, password: action.password }
//     case "password1":
//       return { ...state, password1: action.password }
//     case "password2":
//       return { ...state, password2: action.password }
//     default:
//       return state
//   }
// }

interface IFormInput {
  email: string
}

export function EmailDialog({
  open = false,
  onOpenChange = () => {},
  onResponse = () => {},
}: IModalProps) {
  const { add: addToast } = Toast.useToastManager()

  //const [settings, settingsDispatch] = useContext(SettingsContext)
  //const [account, accountDispatch] = useContext(AccountContext)
  const { fetchAccessToken } = useEdbAuth()

  //const [passwordless, setPasswordless] = useState(settings.passwordless)

  const form = useForm<IFormInput>({
    defaultValues: {
      email: '',
    },
  })

  const btnRef = useRef<HTMLButtonElement>(null)

  function _resp(resp: string) {
    onResponse?.(resp)
  }

  async function sendResetEmailLink(email: string) {
    const accessToken = await fetchAccessToken()

    try {
      await httpFetch.post(API_RESET_EMAIL_URL, {
        headers: bearerHeaders(accessToken),
        body: {
          email,
          callbackUrl: APP_UPDATE_EMAIL_URL,
        },
      })

      addToast({
        id: makeUuid(),
        title:
          'Please check your email for a link to change your email address',
        type: 'success',
      })
    } catch (error) {
      addToast({
        id: makeUuid(),
        title: error as string,
        type: 'destructive',
      })
      console.error(error)
    }
  }

  async function onSubmit(data: IFormInput, e: BaseSyntheticEvent | undefined) {
    e?.preventDefault()

    sendResetEmailLink(data.email)
  }

  return (
    <OKCancelDialog
      title="Change Email Address"
      description={TEXT_EMAIL_DESCRIPTION}
      showClose={true}
      open={open}
      onOpenChange={onOpenChange}
      //contentVariant="glass"
      //buttons={[TEXT_SAVE, TEXT_CANCEL]}
      onResponse={(response) => {
        switch (response) {
          case TEXT_OK:
            //update()
            btnRef.current?.click()
            break
          default:
            _resp(response)
            break
        }
      }}
    >
      <Form {...form}>
        <form
          className="flex flex-col gap-y-2 text-sm"
          onSubmit={form.handleSubmit(onSubmit)}
        >
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
                message: TEXT_EMAIL_DESCRIPTION,
              },
            }}
            render={({ field }) => (
              <FormItem className="flex flex-col gap-y-1">
                <Input
                  id="email"
                  placeholder="New email address"
                  className="rounded-theme"
                  //error={"email" in form.formState.errors}
                  {...field}
                ></Input>
                <FormInputError error={form.formState.errors.email} />
              </FormItem>
            )}
          />

          <button ref={btnRef} type="submit" className="hidden" />
        </form>
      </Form>
    </OKCancelDialog>
  )
}
