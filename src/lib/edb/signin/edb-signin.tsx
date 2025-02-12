import { UserIcon } from '@components/icons/user-icon'
import { Button } from '@components/shadcn/ui/themed/button'

import { useContext, useState } from 'react'

import { OKCancelDialog } from '@/components/dialog/ok-cancel-dialog'
import { SignOutIcon } from '@/components/icons/sign-out-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { BaseLink } from '@/components/link/base-link'
import {
  DropdownMenuAnchorItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  MenuSeparator,
} from '@/components/shadcn/ui/themed/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/popover'
import {
  APP_NAME,
  NO_DIALOG,
  TEXT_OK,
  TEXT_SIGN_IN,
  TEXT_SIGN_OUT,
  type IDialogParams,
} from '@/consts'
import { EdbSettingsContext } from '@/lib/edb/edb-settings-provider'
import { makeRandId } from '@/lib/utils'
import { AuthProvider } from '@/providers/auth-provider'
import { useAuth0 } from '@auth0/auth0-react'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import { truncate } from '../../text/text'
import {
  APP_ACCOUNT_SIGNED_OUT_URL,
  APP_SIGNIN_URL,
  DEFAULT_BASIC_EDB_USER,
  MYACCOUNT_ROUTE,
  TEXT_MY_ACCOUNT,
  type IBasicEdbUser,
} from '../edb'
import { EdbAuthContext } from '../edb-auth-provider'
import { SignInWithApiKeyPopover } from './signin-with-api-key-popover'
import { SignInWithUsernamePasswordPopover } from './signin-with-username-password-popover'

const SIGNED_IN_ICON_CLS =
  'rounded-full border border-foreground/75 flex flex-row items-center justify-center w-7 h-7 aspect-square text-xs font-medium bg-background trans-color overflow-hidden'

export type SignInMode = 'username-password' | 'api' | 'auth0'

interface IProps {
  apiKey?: string
  signInMode?: SignInMode
  callbackUrl?: string
}

export function EDBSignIn({
  callbackUrl = '',
  apiKey = '',
  signInMode = 'auth0',
}: IProps) {
  const [open, setOpen] = useState(false)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { settings } = useContext(EdbSettingsContext)

  const { edbUser } = useContext(EdbAuthContext)

  const { loginWithRedirect, logout } = useAuth0()

  const cachedUserInfo: IBasicEdbUser =
    settings.users.length > 0
      ? settings.users[0]!
      : { ...DEFAULT_BASIC_EDB_USER }

  const roles = cachedUserInfo.roles.join(',')

  if (!callbackUrl) {
    callbackUrl = window.location.href
  }

  let name: string = ''

  if (cachedUserInfo.firstName) {
    name = `${cachedUserInfo.firstName} ${cachedUserInfo.lastName}` // user.firstName.split(' ')[0]!
  } else {
    name = cachedUserInfo.username
  }

  const isSignedIn = edbUser.uuid !== '' //userIsSignedInWithSession()

  const initials =
    isSignedIn &&
    cachedUserInfo.firstName !== '' &&
    cachedUserInfo.lastName !== ''
      ? `${cachedUserInfo.firstName[0]!.toUpperCase()}${cachedUserInfo.lastName[0]!.toUpperCase()}`
      : cachedUserInfo.username.slice(0, 2).toUpperCase()

  const button = (
    <Button
      variant="accent"
      size="header"
      pad="none"
      rounded="none"
      selected={open}
      ripple={false}
      // @ts-ignore
      title={isSignedIn ? TEXT_MY_ACCOUNT : TEXT_SIGN_IN}
    >
      <VCenterRow data-selected={open} className={SIGNED_IN_ICON_CLS}>
        {initials ? (
          <span>{initials}</span>
        ) : (
          <UserIcon className="fill-foreground/90 -mb-1" />
        )}
      </VCenterRow>
    </Button>
  )

  if (isSignedIn) {
    return (
      <>
        <OKCancelDialog
          open={showDialog.id.startsWith('signout')}
          title={APP_NAME}
          onReponse={(r) => {
            if (r === TEXT_OK) {
              //signoutUser()
              logout({ logoutParams: { returnTo: APP_ACCOUNT_SIGNED_OUT_URL } })
            }

            setShowDialog({ ...NO_DIALOG })
          }}
        >
          Are you sure you want to {TEXT_SIGN_OUT}?
        </OKCancelDialog>

        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>

          <DropdownMenuContent
            onEscapeKeyDown={() => setOpen(false)}
            onInteractOutside={() => setOpen(false)}
            align="end"
            className="w-64"
          >
            <DropdownMenuLabel>
              Hi, {truncate(name, { length: 22 })}
            </DropdownMenuLabel>

            <DropdownMenuAnchorItem
              href={MYACCOUNT_ROUTE}
              aria-label={TEXT_MY_ACCOUNT}
            >
              {TEXT_MY_ACCOUNT}
            </DropdownMenuAnchorItem>

            {(roles.includes('Super') || roles.includes('Admin')) && (
              <DropdownMenuItem
                onClick={() => {
                  window.location.href = '/admin/users'
                }}
                aria-label="Admin users"
              >
                Users
              </DropdownMenuItem>
            )}

            <MenuSeparator />

            <AuthProvider callbackUrl={''}>
              <DropdownMenuItem
                aria-label={TEXT_SIGN_OUT}
                onClick={() =>
                  setShowDialog({ id: makeRandId('signout'), params: {} })
                }
              >
                <SignOutIcon className="w-4" />

                <>{TEXT_SIGN_OUT}</>
              </DropdownMenuItem>
            </AuthProvider>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    )
  } else {
    switch (signInMode) {
      case 'auth0':
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{button}</PopoverTrigger>

            <PopoverContent
              onEscapeKeyDown={() => setOpen(false)}
              onInteractOutside={() => setOpen(false)}
              align="end"
              className="w-64 text-xs gap-y-4 flex flex-col px-3 py-4"
            >
              {/* <Label className="font-semibold">{TEXT_SIGN_IN} with email</Label> */}
              <Button
                variant="theme"
                //className="w-full"
                size="lg"
                onClick={() => {
                  const state = {
                    callbackUrl,
                  }

                  loginWithRedirect({ appState: state })
                }}
                aria-label={TEXT_SIGN_IN}
              >
                {TEXT_SIGN_IN}
              </Button>

              {/* <PasswordlessSignInButton /> */}

              <BaseLink
                href={APP_SIGNIN_URL}
                aria-label="Passwordless sign in"
                data-underline="hover"
              >
                Passwordless
              </BaseLink>
            </PopoverContent>
          </Popover>
        )
      case 'api':
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{button}</PopoverTrigger>

            <PopoverContent
              onEscapeKeyDown={() => setOpen(false)}
              onInteractOutside={() => setOpen(false)}
              align="end"
              className="w-80 text-xs gap-y-2 flex flex-col px-3 py-4"
            >
              <SignInWithApiKeyPopover apiKey={apiKey} />
            </PopoverContent>
          </Popover>
        )
      default:
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>{button}</PopoverTrigger>

            <PopoverContent
              onEscapeKeyDown={() => setOpen(false)}
              onInteractOutside={() => setOpen(false)}
              align="end"
              className="w-80 text-xs gap-y-2 flex flex-col px-3 py-4"
            >
              <SignInWithUsernamePasswordPopover />
            </PopoverContent>
          </Popover>
        )
    }
  }
}
