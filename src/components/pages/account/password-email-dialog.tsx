import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'

import {
  API_RESET_PASSWORD_URL,
  APP_RESET_PASSWORD_URL,
} from '@/components/edb/edb'
import { TEXT_OK } from '@/consts'

//import { AccountSettingsContext } from "@/context/account-settings-context"

import { useState } from 'react'

import { useEdbAuth } from '@/components/edb/auth/edb-auth'
import { bearerHeaders } from '@/lib/http/urls'

import { httpFetch } from '@/lib/http/http-fetch'
import { makeUuid } from '@/lib/id'
import { Toast } from '@base-ui/react/toast'

export const MIN_PASSWORD_LENGTH = 8
export const TEXT_MIN_PASSWORD_LENGTH =
  'A password must contain at least 8 characters'
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
      type: 'password1'
      password: string
    }
  | {
      type: 'password2'
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

// interface IFormInput {
//   password: string
//   password1: string
//   password2: string
//   passwordless: boolean
// }

export function PasswordDialog({
  open = false,
  onOpenChange = () => {},
  onResponse = () => {},
}: IModalProps) {
  // const [passwords, passwordDispatch] = useReducer(passwordReducer, {
  //   password: "",
  //   password1: "",
  //   password2: "",
  // })

  const [accessToken] = useState<string>('')
  //const [user, setUser] = useState<IUser | null>(null)

  const { add: addToast } = Toast.useToastManager()

  const { session } = useEdbAuth()

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

  function _resp(resp: string) {
    onResponse?.(resp)
  }

  async function sendResetPasswordLink() {
    try {
      await httpFetch.post(API_RESET_PASSWORD_URL, {
        body: {
          username: session?.user.username,

          callbackUrl: APP_RESET_PASSWORD_URL,
        },

        //withCredentials: true,
        headers: bearerHeaders(accessToken),
      })

      addToast({
        id: makeUuid(),
        title: 'Please check your email for a link to reset your password',
        type: 'destructive',
      })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <OKCancelDialog
      title="Change Password"
      description={TEXT_PASSWORD_DESCRIPTION}
      showClose={true}
      open={open}
      //contentVariant="glass"
      //bodyVariant="card"
      onOpenChange={onOpenChange}
      onResponse={(response) => {
        switch (response) {
          case TEXT_OK:
            //update()
            //btnRef.current?.click()
            sendResetPasswordLink()
            break
          default:
            _resp(response)
            break
        }
      }}
    >
      <p>A password reset link will be sent to your email address.</p>
    </OKCancelDialog>
  )
}
