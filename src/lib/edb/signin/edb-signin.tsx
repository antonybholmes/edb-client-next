import { UserIcon } from '@icons/user-icon'
import { Button } from '@themed/button'

import { useState, type ReactNode } from 'react'

import { SignInIcon } from '@/components/icons/sign-in-icon'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import {
  APP_NAME,
  NO_DIALOG,
  TEXT_OK,
  TEXT_SIGN_IN,
  TEXT_SIGN_OUT,
  type IDialogParams,
} from '@/consts'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { SignOutIcon } from '@icons/sign-out-icon'
import { randId } from '@lib/id'
import { DropdownMenu } from '@radix-ui/react-dropdown-menu'
import {
  DropdownMenuAnchorItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  MenuSeparator,
} from '@themed/dropdown-menu'
import { Popover, PopoverContent, PopoverTrigger } from '@themed/popover'
import { UserRound } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { truncate } from '../../text/text'
import {
  APP_ACCOUNT_AUTH0_CALLBACK_URL,
  APP_ACCOUNT_AUTH_SIGN_OUT_URL,
  AUTH0_TOOLKIT_LOGIN_ROUTE,
  AUTH0_TOOLKIT_LOGOUT_ROUTE,
  DEFAULT_BASIC_EDB_USER,
  MYACCOUNT_ROUTE,
  OAUTH2_SIGN_IN_ROUTE,
  OTP_SIGN_IN_ROUTE,
  REDIRECT_URL_PARAM,
  TEXT_MY_ACCOUNT,
  type IBasicEdbUser,
} from '../edb'
import { useEdbAuth } from '../edb-auth'
import { useEdbSettings } from '../edb-settings'
import { SignInWithApiKeyPopover } from './signin-with-api-key-popover'

const SIGNED_IN_ICON_CLS =
  'rounded-full border border-foreground flex flex-row items-center justify-center w-6 h-6 aspect-square text-xs font-medium overflow-hidden'

export type SignInMode = 'username-password' | 'api' | 'auth0' | 'oauth2'

interface IProps {
  apiKey?: string
  signInMode?: SignInMode
  redirectUrl?: string
}

export function EDBSignIn({ apiKey = '', signInMode = 'auth0' }: IProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [showDialog, setShowDialog] = useState<IDialogParams>({ ...NO_DIALOG })

  const { settings } = useEdbSettings()

  const { session } = useEdbAuth()

  //console.log('pathname', pathname)

  // useEffect(() => {
  //   if (!redirectUrl) {
  //     redirectUrl = window.location.pathname //window.location.href
  //   }
  // }, [])

  const cachedUserInfo: IBasicEdbUser =
    settings.users.length > 0
      ? settings.users[0]!
      : { ...DEFAULT_BASIC_EDB_USER }

  const roles = cachedUserInfo.roles.join(',')

  let name: string = ''

  if (cachedUserInfo.firstName) {
    name = `${cachedUserInfo.firstName} ${cachedUserInfo.lastName}` // user.firstName.split(' ')[0]!
  } else {
    name = cachedUserInfo.username
  }

  const isSignedIn = session !== null //userIsSignedInWithSession()

  const initials =
    isSignedIn &&
    cachedUserInfo.firstName !== '' &&
    cachedUserInfo.lastName !== ''
      ? `${cachedUserInfo.firstName[0]!.toUpperCase()}${cachedUserInfo.lastName[0]!.toUpperCase()}`
      : cachedUserInfo.username.slice(0, 2).toUpperCase()

  let menu: ReactNode = null

  if (isSignedIn) {
    menu = (
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <IconButton
            id="edb-signin-button"
            variant="muted"
            size="header"
            rounded="none"
            checked={open}
            // ripple={false}
            title={isSignedIn ? TEXT_MY_ACCOUNT : TEXT_SIGN_IN}
          >
            <span className={SIGNED_IN_ICON_CLS}>{initials}</span>
          </IconButton>
        </DropdownMenuTrigger>

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
            <UserRound className="w-4.5 h-4.5" />
            <span>{TEXT_MY_ACCOUNT}</span>
          </DropdownMenuAnchorItem>

          {(roles.includes('Super') || roles.includes('Admin')) && (
            // <DropdownMenuItem
            //   onClick={() => {
            //     window.location.href = '/admin/users'
            //   }}
            //   aria-label="Admin users"
            // >
            //   Users
            // </DropdownMenuItem>

            <DropdownMenuAnchorItem href={'/admin/users'} aria-label="Users">
              Users
            </DropdownMenuAnchorItem>
          )}

          <MenuSeparator />

          <DropdownMenuItem
            aria-label={TEXT_SIGN_OUT}
            onClick={() => setShowDialog({ id: randId('signout'), params: {} })}
          >
            <SignOutIcon stroke="" />

            {TEXT_SIGN_OUT}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  } else {
    const button = (
      <Button
        id="edb-signin-button"
        variant="muted"
        size="header"
        rounded="none"
        checked={open}
        // ripple={false}
        title={TEXT_SIGN_IN}
        //disabled={!loaded}
      >
        <span className={SIGNED_IN_ICON_CLS}>
          <UserIcon className="fill-foreground -mb-2 w-5 h-5" />
        </span>
      </Button>
    )

    switch (signInMode) {
      case 'auth0':
        menu = (
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>

            <DropdownMenuContent
              onEscapeKeyDown={() => setOpen(false)}
              onInteractOutside={() => setOpen(false)}
              align="end"
              //className="w-64"
            >
              <DropdownMenuItem
                aria-label={TEXT_SIGN_IN}
                onClick={() => {
                  // const state = {
                  //   redirectUrl: MYACCOUNT_ROUTE, //window.location.href
                  // }

                  // console.log('EDBSignIn: loginWithRedirect state', state)
                  // loginWithRedirect({ appState: state })

                  console.log(
                    'redirecting to auth0 login',
                    `${AUTH0_TOOLKIT_LOGIN_ROUTE}?returnTo=${APP_ACCOUNT_AUTH0_CALLBACK_URL}?${REDIRECT_URL_PARAM}=${window.location.pathname}`
                  )

                  router.push(
                    `${AUTH0_TOOLKIT_LOGIN_ROUTE}?returnTo=${APP_ACCOUNT_AUTH0_CALLBACK_URL}?${REDIRECT_URL_PARAM}=${window.location.pathname}`
                  )
                }}
              >
                <SignInIcon stroke="" />
                <span>{TEXT_SIGN_IN} with Auth0</span>
              </DropdownMenuItem>

              <DropdownMenuItem
                aria-label={TEXT_SIGN_IN}
                onClick={() => {
                  router.push(
                    OTP_SIGN_IN_ROUTE + `?${REDIRECT_URL_PARAM}=` + pathname
                  )
                }}
              >
                <span>{TEXT_SIGN_IN} with Email+OTP</span>
              </DropdownMenuItem>

              <MenuSeparator />

              <DropdownMenuItem
                aria-label={TEXT_SIGN_OUT}
                onClick={() =>
                  setShowDialog({ id: randId('signout'), params: {} })
                }
              >
                {TEXT_SIGN_OUT}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          // <Popover open={open} onOpenChange={setOpen}>
          //   <PopoverTrigger asChild>{button}</PopoverTrigger>

          //   <PopoverContent
          //     onEscapeKeyDown={() => setOpen(false)}
          //     onInteractOutside={() => setOpen(false)}
          //     align="end"
          //     variant="content"
          //     className="w-64 text-xs gap-y-1"
          //     //variant="glass"
          //   >
          //     <Button
          //       variant="theme"
          //       //className="w-full"
          //       size="lg"
          //       onClick={() => {
          //         const state = {
          //           redirectUrl,
          //         }

          //         loginWithRedirect({ appState: state })
          //       }}
          //       aria-label={TEXT_SIGN_IN}
          //     >
          //       {TEXT_SIGN_IN}
          //     </Button>

          //     {/* <PasswordlessSignInButton /> */}

          //     {/* <ButtonLink
          //       href={APP_CLERK_SIGN_IN_ROUTE}
          //       aria-label="Passwordless sign in"
          //       //data-underline="hover"
          //     >
          //       {TEXT_SIGN_IN}
          //     </ButtonLink> */}

          //     <ButtonLink
          //       variant="ghost"
          //       href={APP_AUTH_PASSWORDLESS_SIGN_IN_ROUTE}
          //       aria-label="Passwordless sign in"
          //       //data-underline="hover"
          //     >
          //       {TEXT_PASSWORDLESS}
          //     </ButtonLink>

          //     <MenuSeparator />

          //     <Button
          //       variant="menu"
          //       justify="start"
          //       aria-label={TEXT_SIGN_OUT}
          //       animation="none"
          //       onClick={() =>
          //         setShowDialog({ id: randId('signout'), params: {} })
          //       }
          //     >
          //       <span className={DROPDOWN_MENU_ICON_CONTAINER_CLS}>
          //         <SignOutIcon stroke="" />
          //       </span>

          //       {TEXT_SIGN_OUT}
          //     </Button>
          //   </PopoverContent>
          // </Popover>
        )
        break
      case 'api':
        menu = (
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
        break
      default:
        menu = (
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>{button}</DropdownMenuTrigger>

            <DropdownMenuContent
              onEscapeKeyDown={() => setOpen(false)}
              onInteractOutside={() => setOpen(false)}
              align="end"
              //className="w-64"
            >
              <DropdownMenuAnchorItem
                href={OAUTH2_SIGN_IN_ROUTE}
                aria-label={TEXT_SIGN_IN}
              >
                <SignInIcon stroke="" />
                <span>{TEXT_SIGN_IN}</span>
              </DropdownMenuAnchorItem>

              {/* <MenuSeparator />

              <DropdownMenuItem
                aria-label={TEXT_SIGN_OUT}
                onClick={() =>
                  setShowDialog({ id: randId('signout'), params: {} })
                }
              >
                  <SignOutIcon stroke="" />  

                <span>{TEXT_SIGN_OUT}</span>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        )
        break
    }
  }

  return (
    <>
      <OKCancelDialog
        open={showDialog.id.startsWith('signout')}
        title={APP_NAME}
        //contentVariant="glass"
        //bodyVariant="card"
        modalType="Warning"
        onResponse={(r) => {
          if (r === TEXT_OK) {
            //redirect(APP_OAUTH2_SIGN_OUT_ROUTE)
            console.log(
              `${AUTH0_TOOLKIT_LOGOUT_ROUTE}?returnTo=${APP_ACCOUNT_AUTH_SIGN_OUT_URL}?${REDIRECT_URL_PARAM}=${window.location.pathname}`
            )

            router.push(
              `${AUTH0_TOOLKIT_LOGOUT_ROUTE}?returnTo=${APP_ACCOUNT_AUTH_SIGN_OUT_URL}` //?${REDIRECT_URL_PARAM}=${window.location.pathname}`
            )
          }

          setShowDialog({ ...NO_DIALOG })
        }}
      >
        Are you sure you want to {TEXT_SIGN_OUT}?
      </OKCancelDialog>

      {menu}
    </>
  )
}
