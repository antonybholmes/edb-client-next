import { useEffect, useState } from 'react'

import { SignInIcon } from '@/components/icons/sign-in-icon'
import { UserIcon } from '@/components/icons/user-icon'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/shadcn/ui/themed/v2/popover'
import {
  IS_DEV_MODE,
  TEXT_EMAIL,
  TEXT_OK,
  TEXT_SIGN_IN,
  TEXT_SIGN_OUT,
} from '@/consts'
import { SignOutIcon } from '@/icons/sign-out-icon'
import {
  ICON_TRANSITION_FROM_CLS,
  ICON_TRANSITION_TO_CLS,
} from '@/interfaces/icon-props'
import { cn } from '@/lib/shadcn-utils'
import { UserRound } from 'lucide-react'

import { BaseCol } from '@/components/layout/base-col'
import { BaseRow } from '@/components/layout/base-row'
import { ThemeLink } from '@/components/link/theme-link'
import { Auth0SignInButton } from '@/components/pages/account/auth/oauth2/auth0/auth0-signin-button'
import { CognitoSignInButton } from '@/components/pages/account/auth/oauth2/cognito/cognito-signin-button'

import { SupabaseSignInButton } from '@/components/pages/account/auth/oauth2/supabase/supabase-signin-button'
import { StrikeThroughMenuItem } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { HeaderIconButton } from '@/layouts/header-icon-button'
import {
  fromBase64Url,
  redirect,
  REDIRECT_DELAY_MS,
  toBase64Url,
} from '@/lib/http/urls'
import { Button } from '@/themed/v2/button'

import { useDialogs } from '@/components/dialogs/dialogs'
import { VCenterRow } from '@/components/layout/v-center-row'
import { AuthProvider } from '@/providers/auth-provider'
import { useAtom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import {
  APP_ACCOUNT_AUTH_SIGNED_OUT_URL,
  DEFAULT_BASIC_EDB_USER,
  hasAdminPermission,
  MYACCOUNT_PATH,
  OAUTH2_AUTH0_SIGN_OUT_PATH,
  OAUTH2_CLERK_SIGN_OUT_PATH,
  OAUTH2_COGNITO_SIGN_OUT_PATH,
  OAUTH2_SUPABASE_SIGN_OUT_PATH,
  OTP_SIGN_IN_PATH,
  SIGNED_OUT_PATH,
  TEXT_MY_ACCOUNT,
  type IBasicEdbUser,
} from '../edb'
import { useEdbAuth, useEdbSignIn } from '../edb-auth'
import { useEdbSettings } from '../edb-settings'
import { SignInWithApiKeyPopover } from './signin-with-api-key-popover'

export type SignInMode = 'username-password' | 'api' | 'auth0' | 'oauth2'

export const STATE_PARAM = 'state'
export const REDIRECT_PARAM = 'redirect'
export const TITLE_PARAM = 'title'

export interface IRedirectTarget {
  title: string // display title
  path: string // relative path
}

export interface IRedirectState {
  target: IRedirectTarget
}

export const DEFAULT_REDIRECT_TARGET: IRedirectTarget = {
  title: 'Home',
  path: '/',
}

export const NULL_REDIRECT_TARGET: IRedirectTarget = {
  title: '',
  path: '',
}

export const DEFAULT_REDIRECT_STATE: IRedirectState = {
  target: DEFAULT_REDIRECT_TARGET,
}

export const NULL_REDIRECT_STATE: IRedirectState = {
  target: NULL_REDIRECT_TARGET,
}

// Create an atom synced with sessionStorage
export const signinStateAtom = atomWithStorage<IRedirectState>(
  'edb:auth:signin-state',
  NULL_REDIRECT_STATE
)

// Create an atom synced with sessionStorage
export const signOutStateAtom = atomWithStorage<IRedirectState>(
  'edb:auth:sign-out-state',
  NULL_REDIRECT_STATE
)

/**
 * Hook for triggering sign out process. It will sign out the user
 * from the application and redirect to the appropriate sign out URL
 * for the current authentication provider.
 * @param state - The redirect state to be used after sign out.
 *
 * @returns An object containing the signOut function.
 */
export function useSignOut(): {
  signOut: (state: IRedirectState) => Promise<void>
} {
  const { signinMethod } = useEdbSignIn()
  const { signout } = useEdbAuth()
  const [, setLogoutState] = useAtom(signOutStateAtom)

  async function signOut(state: IRedirectState) {
    console.log('Signing out using method:', signinMethod)

    try {
      await signout()
    } catch (error) {
      console.error('Error during signout:', error)
    }

    if (!isSafeRelativeUrl(state.target.path)) {
      state.target = DEFAULT_REDIRECT_TARGET
    }

    // Cache state for post-logout
    setLogoutState(state)

    // Determine provider logout URL
    let path = ''
    switch (signinMethod) {
      case 'cognito':
        path = OAUTH2_COGNITO_SIGN_OUT_PATH
        break
      case 'supabase':
        path = OAUTH2_SUPABASE_SIGN_OUT_PATH
        break
      case 'clerk':
        path = OAUTH2_CLERK_SIGN_OUT_PATH
        break
      default:
        path = OAUTH2_AUTH0_SIGN_OUT_PATH
        break
    }

    console.log('Redirecting to logout URL:', path, state)

    if (path) {
      path = addRedirectStateToUrl(path, state)
      redirect(path)
    }
  }

  return { signOut }
}

/**
 * Redirects to the signed out uri. This is for auth0
 * and services that need the full uri
 * @param state
 * @returns
 */
export function makeSignedOutRedirectUri(
  state: IRedirectState = DEFAULT_REDIRECT_STATE
): IRedirectState {
  return {
    target: {
      title: state.target.title,
      path: addRedirectStateToUrl(APP_ACCOUNT_AUTH_SIGNED_OUT_URL, state),
    },
  }
}

/**
 * Redirects to the signed out route with the given state.
 * @param state
 * @returns
 */
export function makeSignedOutRedirectRoute(
  state: IRedirectState = DEFAULT_REDIRECT_STATE
): IRedirectState {
  return {
    target: {
      title: state.target.title,
      path: addRedirectStateToUrl(SIGNED_OUT_PATH, state),
    },
  }
}

/**
 * Retrieves and validates the redirect URL from the query parameters.
 *
 * @param defaultState  The default URL to use if no valid redirect is found, defaults to '/'.
 * @returns The validated redirect URL.
 */
export function getRedirectStateFromURI(
  defaultState: IRedirectState = DEFAULT_REDIRECT_STATE
): IRedirectState {
  const params = new URLSearchParams(window.location.search)

  let state = decodeRedirectState(params.get(STATE_PARAM)) ?? defaultState

  if (!state) {
    state = defaultState
  }

  return state
}

export function encodeRedirectState(state: IRedirectState | null): string {
  if (!state) {
    return ''
  }

  return encodeURIComponent(JSON.stringify(state))
}

export function addRedirectStateToUrl(
  url: string,
  state: IRedirectState | null
): string {
  // return (
  //   url +
  //   (state
  //     ? `?${STATE_PARAM}=` + encodeURIComponent(JSON.stringify(state))
  //     : '')
  // )

  return (
    url + (state ? `?${STATE_PARAM}=` + toBase64Url(JSON.stringify(state)) : '')
  )
}

export function decodeRedirectState(
  param: string | null
): { target: IRedirectTarget } | null {
  if (!param) {
    return null
  }

  try {
    // Decode URL and parse JSON
    const decoded = fromBase64Url(param) // decodeURIComponent(param)
    const parsed = JSON.parse(decoded)

    // typeof null is 'object', so need extra checks
    if (
      parsed === null ||
      typeof parsed !== 'object' ||
      Array.isArray(parsed)
    ) {
      return null
    }

    const { target } = parsed as { target: IRedirectTarget }

    if (
      target === null ||
      typeof target !== 'object' ||
      Array.isArray(target)
    ) {
      return null
    }

    const { title, path } = target as Partial<IRedirectTarget>

    if (typeof title !== 'string' || typeof path !== 'string') {
      return null
    }

    if (!isSafeRelativeUrl(target.path)) {
      return null
    }

    return parsed
  } catch (e) {
    // Catch decodeURIComponent or JSON.parse errors
    console.error('Error decoding state parameter:', e)
    return null
  }
}

/**
 * Checks if a redirect URL is invalid to prevent open redirect attacks.
 * The URL must be a relative path and not contain signin/signout/callback
 * to prevent open redirect attacks and looping redirects.
 *
 * @param url  The redirect URL to validate.
 * @returns True if the URL is invalid, false otherwise.
 */
// export function invalidRedirectUrl(url: string): boolean {
//   // redirec url must be a relative path and not contain
//   // signin/signout/callback to prevent open redirect attacks
//   // and looping redirects

//   const lurl = url.toLowerCase().trim()

//   return (
//     !lurl.startsWith('/') || // must be a relative path
//     lurl.includes('signin') || // prevent sign-in URLs
//     lurl.includes('signout') || // prevent sign-in/sign-out URLs
//     lurl.includes('signedout') || // prevent signedout URLs
//     lurl.includes('callback') || // prevent callback URLs
//     lurl.includes(' ') || // prevent spaces
//     lurl.includes('..') || // prevent directory traversal
//     lurl.includes(':') || // prevent full URLs with protocol
//     lurl.includes('//') || // prevent full URLs with protocol
//     lurl.includes('\\') || // prevent backslashes
//     lurl.includes('%2f') || // prevent encoded slashes
//     lurl.includes('%5c')
//     // prevent encoded backslashes
//   )
// }

export function isSafeRelativeUrl(url: string): boolean {
  // Empty is not valid
  if (!url) return false

  // // Reject protocol-relative URLs (e.g. "//evil.com")
  // if (value.startsWith('//')) {
  //   return false
  // }

  // // Reject absolute URLs (e.g. "http://...", "https://...", "ftp://...")
  // // Detect any scheme-like pattern: "<letters>:" before a slash
  // if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) {
  //   return false
  // }

  // Reject encoded attempts to hide a scheme (e.g. "%2f%2fevil.com")
  // %2f = "/", so after decoding it might start with "//"
  let decoded: string

  try {
    decoded = decodeURIComponent(url)
  } catch {
    return false // bad encoding → reject
  }

  // Reject URLs with spaces
  if (/\s/.test(decoded)) {
    return false
  }

  // Reject ASCII control characters
  if (/[\u0000-\u001F]/.test(decoded)) {
    return false
  }

  // Reject absolute URLs
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(decoded)) {
    return false
  }

  // Allow ONLY URLs starting with a slash
  if (!decoded.startsWith('/')) {
    return false
  }

  // Reject protocol-relative URLs like //evil.com
  if (decoded.startsWith('//')) {
    return false
  }

  const ld = decoded.toLowerCase()

  if (
    ld.includes('signin') || // prevent sign-in URLs
    ld.includes('signout') || // prevent sign-in/sign-out URLs
    ld.includes('sign-out') || // prevent sign-in/sign-out URLs
    ld.includes('signedout') || // prevent signedout URLs
    ld.includes('signed-out') || // prevent signedout URLs
    ld.includes('callback')
  ) {
    // prevent callback URLs
    return false
  }

  return true
}

/**
 * Safely redirects to a given URL after validating it, i.e. needs to be
 * a safe relative URL.
 *
 * @param url
 * @param delayMs
 */
export function safeRedirect(url: string, delayMs: number = REDIRECT_DELAY_MS) {
  if (!isSafeRelativeUrl(url)) {
    throw new Error('unsafe redirect url: ' + url)
  }

  redirect(url, delayMs)
}

interface IProps {
  apiKey?: string
  signInMode?: SignInMode
  redirectUrl?: string
}

export function EDBSignIn({ apiKey = '', signInMode = 'auth0' }: IProps) {
  const [open, setOpen] = useState(false)

  const { settings } = useEdbSettings()
  const { session } = useEdbAuth()
  const [, setSigninState] = useAtom(signinStateAtom)
  //const { loginWithRedirect } = useAuth0()
  const { signOut } = useSignOut()
  const { open: openDialog } = useDialogs()

  const [state, setState] = useState<IRedirectState>(DEFAULT_REDIRECT_STATE)

  //const [pathname, setPathName] = useState('/')

  useEffect(() => {
    if (window) {
      setState({
        target: {
          title: document.title.replace(/ [-|].*$/, ''), // remove app name suffix,
          path: window.location.pathname,
        },
      })
    }
  }, [])

  const cachedUserInfo: IBasicEdbUser =
    settings.users.length > 0
      ? settings.users[0]!
      : { ...DEFAULT_BASIC_EDB_USER }

  const isAdmin = session ? hasAdminPermission(session?.user) : false

  let name: string = ''

  if (cachedUserInfo.name) {
    name = cachedUserInfo.name
  } else {
    name = cachedUserInfo.username.replace(/@.*/, '') // remove domain from email
  }

  const isSignedIn = session !== null //userIsSignedInWithSession()

  let initials = ''

  if (isSignedIn) {
    initials =
      cachedUserInfo.name ?? cachedUserInfo.username ?? cachedUserInfo.email

    if (initials.includes(' ')) {
      // use first letters of part of name
      initials = initials
        .split(' ')
        .map(word => word[0])
        .join('')
    }

    initials = initials.toUpperCase().slice(0, 3)
  }

  if (isSignedIn) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <HeaderIconButton
              id="edb-signin-button"
              checked={open}
              //rounded="full"
              // ripple={false}
              title={isSignedIn ? TEXT_MY_ACCOUNT : TEXT_SIGN_IN}
            >
              {cachedUserInfo.pictureUrl ? (
                <img
                  src={cachedUserInfo.pictureUrl}
                  alt={name}
                  className="rounded-full w-7 h-7"
                />
              ) : (
                <span className="rounded-full bg-theme/70 w-7 h-7 group-hover:bg-theme group-focus-visible:bg-theme group-data-[checked=true]:bg-theme trans-color aspect-square flex items-center justify-center text-xs font-semibold overflow-hidden text-background">
                  {initials}
                </span>
              )}
              {/* <UserIcon
              className={cn(
                'w-5 h-5 aspect-square rounded-full overflow-hidden',
                ICON_TRANSITION_TO_CLS
              )}
            /> */}
            </HeaderIconButton>
          }
        />

        <PopoverContent
          //onEscapeKeyDown={() => setOpen(false)}
          //onInteractOutside={() => setOpen(false)}
          align="end"
          className="w-96 gap-y-4 flex flex-col"
          variant="header"
        >
          <BaseRow className="gap-x-4">
            {cachedUserInfo.pictureUrl ? (
              <img
                src={cachedUserInfo.pictureUrl}
                alt={name}
                className="rounded-full w-18 h-18 aspect-square"
              />
            ) : (
              <VCenterRow className="w-20 h-20 aspect-square border border-border/50 rounded-full overflow-hidden justify-center relative">
                <UserRound className="w-18 h-18 aspect-square absolute top-1/2 left-1/2 -translate-1/2 z-0 stroke-foreground rounded-full overflow-hidden" />
                <span className="absolute w-full h-full backdrop-blur-sm bg-white/20 z-10" />
                <span className=" absolute top-1/2 left-1/2 -translate-1/2 z-20 truncate text-3xl font-bold">
                  {initials}
                </span>
              </VCenterRow>
            )}

            <BaseCol className="gap-y-2">
              <BaseCol className="gap-y-0.5">
                <span className="font-semibold truncate">{name}</span>
                <span className="truncate">{cachedUserInfo.email}</span>
              </BaseCol>

              <ThemeLink href={MYACCOUNT_PATH} aria-label={TEXT_MY_ACCOUNT}>
                {TEXT_MY_ACCOUNT}
              </ThemeLink>

              {isAdmin && (
                // <DropdownMenuItem
                //   onClick={() => {
                //     window.location.href = '/admin/users'
                //   }}
                //   aria-label="Admin users"
                // >
                //   Users
                // </DropdownMenuItem>

                <ThemeLink href="/admin/users" aria-label="Users">
                  Admin
                </ThemeLink>
              )}
            </BaseCol>
          </BaseRow>

          <BaseCol className="gap-y-2">
            {IS_DEV_MODE && (
              <>
                <AuthProvider>
                  <Auth0SignInButton state={state} />
                </AuthProvider>
                <CognitoSignInButton state={state} />

                {/* <ClerkSignInButton state={state} /> */}

                <SupabaseSignInButton state={state} />

                <Button
                  variant="secondary"
                  size="lg"
                  aria-label={TEXT_SIGN_IN}
                  onClick={() => {
                    setSigninState(state)
                    redirect(addRedirectStateToUrl(OTP_SIGN_IN_PATH, state))
                  }}
                >
                  <span>
                    {TEXT_SIGN_IN} with {TEXT_EMAIL}
                  </span>
                </Button>
              </>
            )}

            <Button
              variant="theme"
              size="lg"
              aria-label={TEXT_SIGN_OUT}
              onClick={() =>
                openDialog({
                  type: 'warning',
                  payload: {
                    title: TEXT_SIGN_OUT,
                    content: 'Are you sure you want to sign out?',
                    callback: r => {
                      if (r === TEXT_OK && state) {
                        signOut(state)
                      }
                    },
                  },
                })
              }
            >
              <SignOutIcon stroke="" />

              {TEXT_SIGN_OUT}
            </Button>
          </BaseCol>
        </PopoverContent>
      </Popover>
    )
  } else {
    const button = (
      <HeaderIconButton
        id="edb-signin-button"
        checked={open}
        // ripple={false}
        title={TEXT_SIGN_IN}
        //rounded="full"
      >
        <UserIcon
          className={cn(
            'w-5 h-5 aspect-square rounded-full overflow-hidden fill-foreground',
            ICON_TRANSITION_FROM_CLS
          )}
        />
        <SignInIcon className={cn('w-5 h-5', ICON_TRANSITION_TO_CLS)} />
        {/* <LockOpen className={cn('w-4 h-4', ICON_TRANSITION_TO_CLS)} /> */}
      </HeaderIconButton>
    )

    switch (signInMode) {
      case 'api':
        return (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger render={button} />

            <PopoverContent
              //onEscapeKeyDown={() => setOpen(false)}
              //onInteractOutside={() => setOpen(false)}
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
            <PopoverTrigger render={button} />

            <PopoverContent
              //onEscapeKeyDown={() => setOpen(false)}
              //onInteractOutside={() => setOpen(false)}
              align="end"
              className="w-90 gap-y-4"
              variant="header"
            >
              <BaseCol className="gap-y-2">
                <span className="font-bold text-xl text-center text-foreground/75">
                  {TEXT_SIGN_IN}
                </span>
                <AuthProvider>
                  <Auth0SignInButton state={state} />
                </AuthProvider>

                <StrikeThroughMenuItem>Or</StrikeThroughMenuItem>

                {IS_DEV_MODE && (
                  <>
                    <CognitoSignInButton state={state} />
                    {/* <ClerkSignInButton state={state} /> */}
                    <SupabaseSignInButton state={state} />
                  </>
                )}

                <Button
                  variant="secondary"
                  size="lg"
                  aria-label={TEXT_SIGN_IN}
                  onClick={() => {
                    setSigninState(state)
                    redirect(addRedirectStateToUrl(OTP_SIGN_IN_PATH, state))
                  }}
                >
                  <span>
                    {TEXT_SIGN_IN} with {TEXT_EMAIL}
                  </span>
                </Button>
              </BaseCol>

              {IS_DEV_MODE && (
                <Button
                  size="lg"
                  aria-label={TEXT_SIGN_OUT}
                  onClick={() => {
                    openDialog({
                      type: 'warning',
                      payload: {
                        title: TEXT_SIGN_OUT,
                        content: 'Are you sure you want to sign out?',
                        callback: r => {
                          if (r === TEXT_OK && state) {
                            signOut(state)
                          }
                        },
                      },
                    })
                  }}
                >
                  {TEXT_SIGN_OUT}
                </Button>
              )}
            </PopoverContent>
          </Popover>
        )
    }
  }
}
