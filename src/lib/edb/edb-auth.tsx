import {
  SESSION_API_KEY_SIGNIN_URL,
  SESSION_AUTH0_SIGNIN_URL,
  SESSION_AUTH_OTP_SEND_URL,
  SESSION_AUTH_OTP_SIGNIN_URL,
  SESSION_AUTH_SIGNIN_URL,
  SESSION_CLERK_SIGNIN_URL,
  SESSION_COGNITO_SIGNIN_URL,
  SESSION_INFO_URL,
  SESSION_REFRESH_URL,
  SESSION_SIGNOUT_URL,
  SESSION_SUPABASE_SIGNIN_URL,
  validateToken,
  type IBasicEdbUser,
  type IEdbSession,
} from '@/lib/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import {
  bearerHeaders,
  csfrHeaders,
  JSON_CONTENT_HEADERS,
} from '@/lib/http/urls'

//import { useQueryClient } from '@tanstack/react-query'

import { produce } from 'immer'
import { useEffect } from 'react'
import { create } from 'zustand'
import { logger } from '../logger'
import { useEdbSettings, useEdbSettingsStore } from './edb-settings'

import { persist } from 'zustand/middleware'

import { getCSRFToken } from './csrf'
import {
  DEFAULT_AUDIENCE,
  getAccessToken,
  getUpdateToken,
  type TokenOpts,
} from './session'

type SigninMethod =
  | 'google'
  | 'github'
  | 'cognito'
  | 'clerk'
  | 'auth0'
  | 'supabase'
  | 'api-key'
  | 'username-password'
  | 'email-otp'
  | ''

export const SIGNIN_METHOD_MAP: Record<SigninMethod, string> = {
  google: 'Google',
  github: 'GitHub',
  cognito: 'Cognito',
  clerk: 'Clerk',
  auth0: 'Auth0',
  supabase: 'Supabase',
  'api-key': 'API Key',
  'username-password': 'Username/Password',
  'email-otp': 'Email OTP',
  '': 'Default',
}

interface IEdbSignInStore {
  signinMethod: SigninMethod
  setSignInMethod: (method: SigninMethod) => void
  clearSignInMethod: () => void
}

export const useEdbSignInStore = create<IEdbSignInStore>()(
  persist(
    set => ({
      signinMethod: 'auth0',
      setSignInMethod: method => set({ signinMethod: method }),
      clearSignInMethod: () => set({ signinMethod: '' }),
    }),
    {
      name: 'edb-signin', // localStorage key
    }
  )
)

interface ISigninHook extends IEdbSignInStore {
  isOAuth: boolean
  isGoogle: boolean
  isGithub: boolean
  isCognito: boolean
  isClerk: boolean
  isApiKey: boolean
  isUsernamePassword: boolean
  isEmailOtp: boolean
}

export function useEdbSignIn(): ISigninHook {
  const signinMethod = useEdbSignInStore(s => s.signinMethod)
  const setSignInMethod = useEdbSignInStore(s => s.setSignInMethod)
  const clearSignInMethod = useEdbSignInStore(s => s.clearSignInMethod)

  return {
    signinMethod,
    setSignInMethod,
    clearSignInMethod,
    isOAuth: signinMethod === 'auth0',
    isGoogle: signinMethod === 'google',
    isGithub: signinMethod === 'github',
    isCognito: signinMethod === 'cognito',
    isClerk: signinMethod === 'clerk',
    isApiKey: signinMethod === 'api-key',
    isUsernamePassword: signinMethod === 'username-password',
    isEmailOtp: signinMethod === 'email-otp',
  }
}

/**
 * Fetches the CSRF token from the server or returns the existing one from cookies.
 * This method may throw an error if the token cannot be fetched.
 *
 * @returns a promise to a string of the token
 */
// export async function fetchCSRFToken(): Promise<string> {
//   const cookie = Cookies.get(CSRF_COOKIE_NAME)
//   const token = cookie?.split('|')[0]

//   if (token) {
//     return token
//   }

//   // this will also refresh the cookie
//   logger.log('Fetching CSRF token from server...')

//   const res = await httpFetch.getJson<{
//     data: { csrfToken: string }
//   }>(SESSION_REFRESH_CSRF_TOKENS_URL, { withCredentials: true })

//   token = res.data.csrfToken

//   logger.log('CSRF token fetched:', token)

//   return token
// }

export interface IEdbAuthStore {
  session: IEdbSession | null
  loaded: boolean
  accessTokens: Record<string, string>
  error: string

  //csrfToken: string
  //setAccessToken: (token: string, audience?: string) => void
  refreshSession: () => Promise<IEdbSession | null>
  invalidateSession: () => void
  fetchSession: () => Promise<IEdbSession | null>
  fetchAccessToken: (audience?: string) => Promise<string>
}

export const useEdbAuthStore = create<IEdbAuthStore>((set, get) => ({
  session: null,
  loaded: false,
  accessTokens: {},
  error: '',

  //csrfToken: '',

  // setAccessToken: (token: string, audience: string = 'edb') => {
  //   set(
  //     produce((state: IEdbAuthStore) => {
  //       state.accessTokens[audience] = token
  //     })
  //   )
  // },

  /**
   * Fetches the current session from the server.
   *
   * @returns Returns the current session if it exists, otherwise
   * attempts to refresh the session by making a request to the server.
   * If the session is refreshed, it will also update the settings
   * with the current user information.
   */
  fetchSession: async () => {
    let s: IEdbSession | null = null

    //const csrfToken = getCsrfToken()

    // After refreshing the session, we can fetch the session info
    // to ensure we have the latest user information.
    // This is useful if the user has updated their profile or roles.
    //console.log('fetching session info after refresh')

    try {
      const res = await httpFetch.getJson<{ data: IEdbSession }>(
        SESSION_INFO_URL,
        {
          //headers: csfrHeaders(csrfToken),
          withCredentials: true,
        }
      )

      s = res.data

      //console.log('Session info fetched:', s)

      set({ session: s, loaded: true, error: '' })

      if (useEdbSettingsStore.getState().users.length === 0) {
        useEdbSettingsStore.setState({
          users: [
            {
              username: s!.user.username,
              email: s!.user.email,
              name: s!.user.name,
              pictureUrl: s!.user.pictureUrl,
              groups: s!.user.groups,
            } as IBasicEdbUser,
          ],
        })
      }
    } catch {
      set({ error: 'Failed to fetch session' })
      s = null
    }

    return s
  },

  /**
   * Forces a refresh of the current session.
   * This is useful if the session has expired or if you want to ensure
   * that the session is up to date with the server.
   * @returns
   */
  refreshSession: async () => {
    let csrfToken = await getCSRFToken() //token

    // If the CSRF token is not available, attempt to fetch it.
    //if (!csrfToken) {
    //  csrfToken = await await fetchCSRFToken()
    //}

    if (!csrfToken) {
      //console.warn('No CSRF token available to fetch access token')
      set({ error: 'No CSRF token available to refresh session' })
      return null
    }

    try {
      logger.debug('refreshSession', csrfToken)

      await httpFetch.post(SESSION_REFRESH_URL, {
        headers: csfrHeaders(csrfToken),
        withCredentials: true,
      })

      return get().fetchSession()
    } catch (err: any) {
      logger.warn('Failed to refresh session', err)
      set({ error: 'Failed to refresh session' })
      return null
    }
  },

  invalidateSession: () => {
    set({
      session: null,
      loaded: false,
      accessTokens: {},
      error: '',
    })
  },

  /**
   * Attempts to return cached access token, but if it determines
   * it is expired, attempts to refresh it.
   * @returns
   */
  fetchAccessToken: async (opts: TokenOpts = {}) => {
    const { audience = DEFAULT_AUDIENCE } = opts
    let accessToken = get().accessTokens[audience] ?? ''

    if (validateToken(accessToken)) {
      return accessToken
    }

    accessToken = await getAccessToken(opts)

    set(
      produce(state => {
        state.accessTokens[audience] = accessToken
      })
    )

    return accessToken
  },
}))

export interface IEdbAuthHook extends Omit<
  IEdbAuthStore,
  'setSigninMethod' | 'accessTokens' | 'invalidateSession'
> {
  sendOTP: (email: string) => Promise<void>
  signInWithEmailOTP: (email: string, otp: string) => Promise<void>
  signInWithApiKey: (key: string) => Promise<void>
  signInWithUsernamePassword: (
    username: string,
    password: string
  ) => Promise<void>
  signInWithAuth0: (token: string) => Promise<IEdbSession | null>
  signInWithCognito: (token: string) => Promise<IEdbSession | null>
  signInWithClerk: (token: string) => Promise<IEdbSession | null>
  signInWithSupabase: (token: string) => Promise<IEdbSession | null>
  fetchUpdateToken: () => Promise<string>
  signout: () => Promise<void>
}

export function useEdbAuth(autoRefresh: boolean = true): IEdbAuthHook {
  const session = useEdbAuthStore(state => state.session)
  const invalidateSession = useEdbAuthStore(state => state.invalidateSession)
  const loaded = useEdbAuthStore(state => state.loaded)
  const fetchSession = useEdbAuthStore(state => state.fetchSession)
  const refreshSession = useEdbAuthStore(state => state.refreshSession)

  const error = useEdbAuthStore(state => state.error)

  const { setSignInMethod } = useEdbSignInStore()

  const fetchAccessToken = useEdbAuthStore(state => state.fetchAccessToken)

  const { settings, updateSettings } = useEdbSettings()

  useEffect(() => {
    async function setup() {
      //console.log('useEdbAuth autoRefresh', autoRefresh)

      if (autoRefresh) {
        await fetchSession()
      }
    }

    setup()
  }, [autoRefresh])

  async function fetchUpdateToken(opts: TokenOpts = {}): Promise<string> {
    return await getUpdateToken(opts)
  }

  async function signInWithApiKey(apiKey: string) {
    await httpFetch.post(SESSION_API_KEY_SIGNIN_URL, {
      body: { apiKey },
      headers: JSON_CONTENT_HEADERS,
      withCredentials: true,
    })

    await fetchSession()

    setSignInMethod('api-key')
  }

  async function signInWithUsernamePassword(
    username: string,
    password: string
  ) {
    await httpFetch.post(SESSION_AUTH_SIGNIN_URL, {
      body: { username, password },
      headers: JSON_CONTENT_HEADERS,
      withCredentials: true,
    })

    await fetchSession()

    setSignInMethod('username-password')
  }

  async function sendOTP(email: string) {
    await httpFetch.post(SESSION_AUTH_OTP_SEND_URL, {
      body: { email },
      headers: JSON_CONTENT_HEADERS,
    })

    await fetchSession()
  }

  async function signInWithEmailOTP(email: string, otp: string) {
    await httpFetch.post(SESSION_AUTH_OTP_SIGNIN_URL, {
      body: { email, otp },
      headers: JSON_CONTENT_HEADERS,
      withCredentials: true,
    })

    await fetchSession()
    setSignInMethod('email-otp')
  }

  async function signInWithAuth0(token: string): Promise<IEdbSession | null> {
    await httpFetch.post(SESSION_AUTH0_SIGNIN_URL, {
      headers: bearerHeaders(token),
      withCredentials: true,
    })

    console.log('Signed in with Auth0, fetching session...')

    const session = await fetchSession()
    setSignInMethod('auth0')

    return session
  }

  async function signInWithCognito(token: string): Promise<IEdbSession | null> {
    await httpFetch.post(SESSION_COGNITO_SIGNIN_URL, {
      headers: bearerHeaders(token),
      withCredentials: true,
    })

    const session = await fetchSession()

    console.log('Signed in with Cognito:', session)
    setSignInMethod('cognito')

    return session
  }

  async function signInWithClerk(token: string): Promise<IEdbSession | null> {
    await httpFetch.post(SESSION_CLERK_SIGNIN_URL, {
      headers: bearerHeaders(token),
      withCredentials: true,
    })

    const session = await fetchSession()
    setSignInMethod('clerk')

    return session
  }

  async function signInWithSupabase(
    token: string
  ): Promise<IEdbSession | null> {
    await httpFetch.postJson(SESSION_SUPABASE_SIGNIN_URL, {
      headers: bearerHeaders(token),
      withCredentials: true,
    })

    // get a new token for this session
    //await fetchCsrfToken()

    const session = await fetchSession()
    setSignInMethod('supabase')

    return session
  }

  async function signout() {
    const csrfToken = await getCSRFToken()

    await httpFetch.post(SESSION_SIGNOUT_URL, {
      headers: csfrHeaders(csrfToken),
      withCredentials: true,
    })

    invalidateSession()

    // remove user from cache
    updateSettings(
      produce(settings, draft => {
        draft.users = []
      })
    )
  }

  return {
    session,
    loaded,
    error,
    sendOTP,
    signInWithEmailOTP,
    signInWithApiKey,
    signInWithUsernamePassword,
    signInWithAuth0,
    signInWithCognito,
    signInWithClerk,
    signInWithSupabase,
    fetchSession,
    refreshSession,
    fetchAccessToken,
    fetchUpdateToken,
    signout,
  }
}
