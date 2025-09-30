import {
  fetchAccessTokenUsingSession,
  fetchUpdateTokenUsingSession,
  type IBasicEdbUser,
  type IEdbSession,
  SESSION_API_KEY_SIGNIN_URL,
  SESSION_AUTH0_SIGNIN_URL,
  SESSION_AUTH_OTP_SEND_URL,
  SESSION_AUTH_OTP_SIGNIN_URL,
  SESSION_AUTH_SIGNIN_URL,
  SESSION_CLERK_SIGNIN_URL,
  SESSION_INFO_URL,
  SESSION_REFRESH_CSRF_TOKEN_URL,
  SESSION_REFRESH_URL,
  SESSION_SIGNOUT_URL,
  SESSION_SUPABASE_SIGNIN_URL,
  validateToken,
} from '@lib/edb/edb'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders, csfrHeaders, JSON_HEADERS } from '@lib/http/urls'

//import { useQueryClient } from '@tanstack/react-query'

import { queryClient } from '@/query'
import { produce } from 'immer'
import { useEffect } from 'react'
import { create } from 'zustand'
import { logger } from '../logger'
import { useEdbSettings, useEdbSettingsStore } from './edb-settings'

import Cookies from 'js-cookie'

export const CSRF_COOKIE_NAME = 'csrf_token'

interface ICSRFStore {
  token: string
  error: string
  setToken: (token: string) => void
  fetchToken: () => Promise<string>
  invalidateToken: () => void
}

export const useCSRFStore = create<ICSRFStore>((set) => ({
  token: Cookies.get(CSRF_COOKIE_NAME) || '',
  error: '',
  setToken: (token: string) => set({ token }),
  fetchToken: async () => {
    // if token still exists, return it
    // let token = Cookies.get(CSRF_COOKIE_NAME) || ''

    // if (token) {
    //   logger.log('CSRF token already set:', token)
    //   set({ token, error: '' })
    //   return token
    // }

    try {
      logger.log('Fetching CSRF token from server...')
      const token = await queryClient.fetchQuery({
        queryKey: ['csrf-token'],
        queryFn: async () => {
          const res = await httpFetch.postJson<{
            data: { csrfToken: string }
          }>(SESSION_REFRESH_CSRF_TOKEN_URL, { withCredentials: true })

          return res.data.csrfToken
        },
      })

      logger.log('CSRF token fetched:', token)

      //Cookies.set(CSRF_COOKIE_NAME, token)

      set({ token, error: '' })

      return token
    } catch {
      set({ token: '', error: 'Failed to fetch CSRF token' })

      return ''
    }
    // Cookie will update automatically; we just update the cache
    //Cookies.set('csrf_token', data.csrf_token); // optional
  },
  invalidateToken: () => {
    set({ token: '', error: '' })
  },
}))

// // Cross-Site Request Forgery
// export const CSRF_KEY = `${APP_ID}:csrf:v2`

// interface ICsrfStore {
//   token: string
//   loaded: boolean
//   error: string
//   fetchToken: () => Promise<string>
//   invalidateToken: () => void
// }

// export const useCsrfStore = create<ICsrfStore>()(
//   persist(
//     (set, get) => ({
//       token: '',
//       loaded: false,
//       error: '',

//       fetchToken: async () => {
//         //const { token } = get()

//         if (get().loaded) {
//           return get().token
//         }

//         try {
//           logger.debug('Fetching CSRF token from server...')
//           // const res = await httpFetch.getJson<{ data: { csrfToken: string } }>(
//           //   SESSION_CSRF_TOKEN_URL,
//           //   { withCredentials: true }
//           // )

//           const token = await queryClient.fetchQuery({
//             queryKey: ['csrf-token'],
//             queryFn: async () => {
//               const res = await httpFetch.getJson<{
//                 data: { csrfToken: string }
//               }>(SESSION_CSRF_TOKEN_URL, { withCredentials: true })

//               return res.data.csrfToken
//             },
//           })

//           set({ token, loaded: true, error: '' })
//         } catch (err: any) {
//           set({ token: '', loaded: false, error: 'Failed to fetch CSRF token' })
//         }

//         return get().token
//       },
//       invalidateToken: () => {
//         set({ token: '', loaded: false, error: '' })
//       },
//     }),
//     {
//       name: CSRF_KEY, // name in localStorage
//       storage: createJSONStorage(() => sessionStorage),
//     }
//   )
// )

export function useCSRF(autoRefresh: boolean = true) {
  const token = useCSRFStore((state) => state.token)

  const error = useCSRFStore((state) => state.error)
  const fetchToken = useCSRFStore((state) => state.fetchToken)
  const invalidateToken = useCSRFStore((state) => state.invalidateToken)

  // automatically fetch the token if not loaded or if there's an error
  useEffect(() => {
    if (autoRefresh && (!token || error)) {
      logger.log('Auto-refreshing CSRF token...')
      fetchToken()
    }
  }, [autoRefresh, token, error, fetchToken])

  return { token, error, fetchToken, invalidateToken }
}

export interface IEdbAuthStore {
  session: IEdbSession | null
  loaded: boolean
  accessToken: string
  error: string
  //csrfToken: string

  refreshSession: () => Promise<IEdbSession | null>
  invalidateSession: () => void
  fetchSession: () => Promise<IEdbSession | null>
  fetchAccessToken: () => Promise<string>
}

export const useEdbAuthStore = create<IEdbAuthStore>((set, get) => ({
  session: null,
  loaded: false,
  accessToken: '',
  error: '',
  //csrfToken: '',

  setAccessToken: (token: string) => {
    set(
      produce((state: IEdbAuthStore) => {
        state.accessToken = token
      })
    )
  },

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
      s = await queryClient.fetchQuery({
        queryKey: ['session-info'],

        queryFn: async () => {
          const res = await httpFetch.getJson<{ data: IEdbSession }>(
            SESSION_INFO_URL,
            {
              //headers: csfrHeaders(csrfToken),
              withCredentials: true,
            }
          )

          return res.data
        },
      })

      set({ session: s, loaded: true, error: '' })

      //console.log(settings)

      if (useEdbSettingsStore.getState().users.length === 0) {
        useEdbSettingsStore.setState({
          users: [
            {
              username: s!.user.username,
              email: s!.user.email,
              firstName: s!.user.firstName,
              lastName: s!.user.lastName,
              roles: s!.user.roles,
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
    let csrfToken = useCSRFStore.getState().token

    // If the CSRF token is not available, attempt to fetch it.
    //if (!csrfToken) {
    //  csrfToken = await useCSRFStore.getState().fetchToken()
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
    set({ session: null, loaded: false, accessToken: '', error: '' })
  },

  /**
   * Attempts to return cached access token, but if it determines
   * it is expired, attempts to refresh it.
   * @returns
   */
  fetchAccessToken: async () => {
    let accessToken = get().accessToken

    //console.log(accessToken, validateToken(accessToken))
    if (validateToken(accessToken)) {
      return accessToken
    }

    let csrfToken = useCSRFStore.getState().token

    // If the CSRF token is not available, attempt to fetch it.
    //if (!useCSRFStore.getState().token) {
    //  csrfToken = await useCSRFStore.getState().fetchToken()
    //}

    if (!csrfToken) {
      set({ error: 'No CSRF token available to fetch access token' })
      return accessToken
    }

    try {
      accessToken = await fetchAccessTokenUsingSession(queryClient, csrfToken)

      set({ accessToken })
    } catch {
      //console.error('Failed to fetch access token', err)
      set({ error: 'Failed to fetch access token' })
    }

    return accessToken
  },
}))

export interface IEdbAuthHook
  extends Omit<IEdbAuthStore, 'accessToken' | 'invalidateSession'> {
  csrfToken: string
  sendOTP: (email: string) => Promise<void>
  signInWithEmailOTP: (email: string, otp: string) => Promise<void>
  signInWithApiKey: (key: string) => Promise<void>
  signInWithUsernamePassword: (
    username: string,
    password: string
  ) => Promise<void>
  signInWithAuth0: (token: string) => Promise<IEdbSession | null>
  signInWithClerk: (token: string) => Promise<IEdbSession | null>
  signInWithSupabase: (token: string) => Promise<IEdbSession | null>
  fetchUpdateToken: () => Promise<string>
  signout: () => Promise<void>
}

export function useEdbAuth(autoRefresh: boolean = true): IEdbAuthHook {
  const session = useEdbAuthStore((state) => state.session)
  const invalidateSession = useEdbAuthStore((state) => state.invalidateSession)
  const loaded = useEdbAuthStore((state) => state.loaded)
  const fetchSession = useEdbAuthStore((state) => state.fetchSession)
  const refreshSession = useEdbAuthStore((state) => state.refreshSession)

  const error = useEdbAuthStore((state) => state.error)

  //const csrfToken = useEdbAuthStore(state => state.csrfToken)
  //const setCsrfToken = useEdbAuthStore(state => state.setCsrfToken)
  const fetchAccessToken = useEdbAuthStore((state) => state.fetchAccessToken)

  const { settings, updateSettings } = useEdbSettings()

  //const { isAuthenticated, logout } = useAuth0()
  //const { isSignedIn, signOut } = useClerk()

  //const [session, setEdbSession] = useState<IEdbSessionInfo|null>(null)

  //const [apiKey, setApiKey] = useState('')

  const {
    token: csrfToken,
    fetchToken: fetchCsrfToken,
    invalidateToken: invalidateCsrfToken,
  } = useCSRF(autoRefresh)

  // const [csrfToken, setCsrfToken] = useState(() => {
  //   return localStorage.getItem(CSRF_KEY) || ''
  // })

  // useEffect(() => {
  //   try {
  //     localStorage.setItem(CSRF_KEY, csrfToken)
  //   } catch (err) {
  //     console.warn('Error writing to localStorage key:', CSRF_KEY, err)
  //   }
  // }, [csrfToken])

  useEffect(() => {
    async function setup() {
      //console.log('useEdbAuth autoRefresh', autoRefresh)

      if (autoRefresh) {
        await fetchSession()
      }
    }

    setup()
  }, [autoRefresh])

  async function fetchUpdateToken(): Promise<string> {
    if (!csrfToken) {
      throw new Error('No CSRF token available to fetch update token')
    }

    return fetchUpdateTokenUsingSession(queryClient, csrfToken)
  }

  // async function autoRefreshSession(): Promise<IEdbSession | null> {
  //   if (session !== null) {
  //     return session
  //   }

  //   const s = await fetchSession()

  //   //setSession(session)

  //   return s
  // }

  // async function refreshSession(): Promise<IEdbSession | null> {
  //   await queryClient.fetchQuery({
  //     queryKey: ['refresh-session'],
  //     queryFn: () =>
  //       httpFetch.post(SESSION_REFRESH_URL, {
  //         withCredentials: true,
  //       }),
  //   })

  //   return await autoRefreshSession()
  // }

  async function signInWithApiKey(apiKey: string) {
    await queryClient.fetchQuery({
      queryKey: ['signin-api-key'],
      queryFn: () =>
        httpFetch.post(SESSION_API_KEY_SIGNIN_URL, {
          body: { apiKey },
          headers: JSON_HEADERS,
          withCredentials: true,
        }),
    })

    await fetchSession()

    //setApiKey(apiKey)
  }

  async function signInWithUsernamePassword(
    username: string,
    password: string
  ) {
    await queryClient.fetchQuery({
      queryKey: ['signin-username-password'],
      queryFn: () =>
        httpFetch.post(SESSION_AUTH_SIGNIN_URL, {
          body: { username, password },
          headers: JSON_HEADERS,
          withCredentials: true,
        }),
    })

    await fetchSession()
  }

  async function sendOTP(email: string) {
    //console.log('sendOTP', email)

    await queryClient.fetchQuery({
      queryKey: ['signin-username-otp'],
      queryFn: () =>
        httpFetch.postJson(SESSION_AUTH_OTP_SEND_URL, {
          body: { email },
          headers: JSON_HEADERS,
        }),
    })

    await fetchSession()
  }

  async function signInWithEmailOTP(email: string, otp: string) {
    await queryClient.fetchQuery({
      queryKey: ['signin-username-otp'],
      queryFn: () =>
        httpFetch.post(SESSION_AUTH_OTP_SIGNIN_URL, {
          body: { email, otp },
          headers: JSON_HEADERS,
          withCredentials: true,
        }),
    })

    await fetchSession()
  }

  async function signInWithAuth0(token: string): Promise<IEdbSession | null> {
    await httpFetch.post(
      SESSION_AUTH0_SIGNIN_URL, //SESSION_UPDATE_USER_URL,
      {
        headers: bearerHeaders(token),
        withCredentials: true,
      }
    )

    //setCsrfToken(csrfToken)

    // get a new token for this session
    await fetchCsrfToken()

    const session = await fetchSession()

    return session
  }

  async function signInWithClerk(token: string): Promise<IEdbSession | null> {
    await queryClient.fetchQuery({
      queryKey: ['clerk-signin', token],
      queryFn: () =>
        httpFetch.post(
          SESSION_CLERK_SIGNIN_URL, //SESSION_UPDATE_USER_URL,
          {
            headers: bearerHeaders(token),
            withCredentials: true,
          }
        ),
    })

    // get a new token for this session
    //await fetchCsrfToken()

    const session = await fetchSession()

    return session
  }

  async function signInWithSupabase(
    token: string
  ): Promise<IEdbSession | null> {
    await queryClient.fetchQuery({
      queryKey: ['supabase-signin', token],
      queryFn: async () => {
        // force session creation
        await httpFetch.post(SESSION_SUPABASE_SIGNIN_URL, {
          headers: bearerHeaders(token),
          withCredentials: true,
        })
      },
    })

    // get a new token for this session
    //await fetchCsrfToken()

    const session = await fetchSession()

    return session
  }

  // async function signoutAuth0() {

  //   // sign out of clerk
  //   if (isAuthenticated) {
  //     signOut() //{redirectUrl: APP_ACCOUNT_SIGNED_OUT_URL})
  //   }

  //   signout()
  // }

  //  async function signoutClerk() {

  //   // sign out of auth0
  //   if (isSignedIn) {
  //     logout()
  //   }

  //   signout()
  // }

  async function signout() {
    await httpFetch.post(SESSION_SIGNOUT_URL, {
      headers: csfrHeaders(csrfToken ?? ''),
      withCredentials: true,
    })

    invalidateSession()
    invalidateCsrfToken()

    // remove user from cache
    updateSettings(
      produce(settings, (draft) => {
        draft.users = []
      })
    )

    // // sign out of auth0
    // if (isAuthenticated) {
    //   signOut() //{redirectUrl: APP_ACCOUNT_SIGNED_OUT_URL})
    // }

    // // sign out of clerk
    // if (isSignedIn) {
    //   logout()
    // }
  }

  return {
    session,
    loaded,
    csrfToken,
    error,
    sendOTP,
    signInWithEmailOTP,
    signInWithApiKey,
    signInWithUsernamePassword,
    signInWithAuth0,
    signInWithClerk,
    signInWithSupabase,
    //fetchUser,
    //autoRefreshSession,
    fetchSession,
    refreshSession,
    fetchAccessToken,
    fetchUpdateToken,
    signout,
  }
}
