import {
  fetchAccessTokenUsingSession,
  fetchUpdateTokenUsingSession,
  type IBasicEdbUser,
  type IEdbSession,
  SESSION_API_KEY_SIGNIN_URL,
  SESSION_AUTH0_SIGNIN_URL,
  SESSION_AUTH_SIGNIN_URL,
  SESSION_CLERK_SIGNIN_URL,
  SESSION_CSRF_TOKEN_URL,
  SESSION_INFO_URL,
  SESSION_REFRESH_URL,
  SESSION_SIGNOUT_URL,
  SESSION_SUPABASE_SIGNIN_URL,
  validateToken,
} from '@lib/edb/edb'
import { httpFetch } from '@lib/http/http-fetch'
import { bearerHeaders, csfrHeaders, JSON_HEADERS } from '@lib/http/urls'

import { APP_ID } from '@/consts'
//import { useQueryClient } from '@tanstack/react-query'

import { queryClient } from '@/query'
import { produce } from 'immer'
import { useEffect } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useEdbSettings } from './edb-settings'

// Cross-Site Request Forgery
export const CSRF_KEY = `${APP_ID}:csrf:v2`

interface ICsrfStore {
  token: string
  loaded: boolean
  error: string | null
  fetchToken: () => Promise<string>
}

export const useCsrfStore = create<ICsrfStore>()(
  persist(
    (set, get) => ({
      token: '',
      loaded: false,
      error: null,

      fetchToken: async () => {
        //const { token } = get()

        if (get().loaded) {
          return get().token
        }

        try {
          console.log('Fetching CSRF token from server...')
          // const res = await httpFetch.getJson<{ data: { csrfToken: string } }>(
          //   SESSION_CSRF_TOKEN_URL,
          //   { withCredentials: true }
          // )

          const token = await queryClient.fetchQuery({
            queryKey: ['csrf-token'],
            queryFn: async () => {
              const res = await httpFetch.getJson<{
                data: { csrfToken: string }
              }>(SESSION_CSRF_TOKEN_URL, { withCredentials: true })

              return res.data.csrfToken
            },
          })

          set({ token, loaded: true })
        } catch (err: any) {
          set({
            error: err?.message || 'Failed to fetch CSRF token',
          })
        }

        return get().token
      },
    }),
    {
      name: CSRF_KEY, // name in localStorage
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export function useCsrf() {
  const { token, loaded, error, fetchToken } = useCsrfStore()

  // automatically fetch the token if not loaded or if there's an error
  useEffect(() => {
    if (!token || !loaded || !error) {
      fetchToken()
    }
  }, [token, loaded, error, fetchToken])

  return { token, loaded, error, fetchToken }
}

export interface IEdbAuthStore {
  session: IEdbSession | null
  loaded: boolean
  accessToken: string
  //csrfToken: string
  setSession: (session: IEdbSession | null) => void
  setLoaded: () => void
  setAccessToken: (token: string) => void
}

export const useEdbAuthStore = create<IEdbAuthStore>((set) => ({
  session: null,
  loaded: false,
  accessToken: '',
  //csrfToken: '',
  setSession: (session: IEdbSession | null) => {
    set(
      produce((state: IEdbAuthStore) => {
        state.session = session
      })
    )
  },
  setLoaded: () => {
    set(
      produce((state: IEdbAuthStore) => {
        state.loaded = true
      })
    )
  },
  setAccessToken: (token: string) => {
    set(
      produce((state: IEdbAuthStore) => {
        state.accessToken = token
      })
    )
  },
}))

export interface IEdbAuthHook {
  session: IEdbSession | null
  loaded: boolean
  csrfToken: string
  signInWithApiKey: (key: string) => Promise<void>
  signInWithUsernamePassword: (
    username: string,
    password: string
  ) => Promise<void>
  signInWithAuth0: (token: string) => Promise<IEdbSession | null>
  signInWithClerk: (token: string) => Promise<IEdbSession | null>
  signInWithSupabase: (token: string) => Promise<IEdbSession | null>
  //fetchUser: () => Promise<void>
  fetchSession: () => Promise<IEdbSession | null>
  refreshSession: () => Promise<IEdbSession | null>
  //updateUser: (user: IUser) => void
  //autoRefreshSession: () => Promise<IEdbSession | null>
  fetchAccessToken: () => Promise<string>
  fetchUpdateToken: () => Promise<string>
  signout: () => Promise<void>
}

export function useEdbAuth(autoRefresh: boolean = true): IEdbAuthHook {
  const session = useEdbAuthStore((state) => state.session)
  const setSession = useEdbAuthStore((state) => state.setSession)
  const loaded = useEdbAuthStore((state) => state.loaded)
  const setLoaded = useEdbAuthStore((state) => state.setLoaded)
  const accessToken = useEdbAuthStore((state) => state.accessToken)
  //const csrfToken = useEdbAuthStore(state => state.csrfToken)
  //const setCsrfToken = useEdbAuthStore(state => state.setCsrfToken)
  const setAccessToken = useEdbAuthStore((state) => state.setAccessToken)

  const { settings, updateSettings } = useEdbSettings()

  //const { isAuthenticated, logout } = useAuth0()
  //const { isSignedIn, signOut } = useClerk()

  //const [session, setEdbSession] = useState<IEdbSessionInfo|null>(null)

  //const [apiKey, setApiKey] = useState('')

  const { token: csrfToken, loaded: csrfLoaded } = useCsrf()

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
      console.log('useEdbAuth setup')
      if (!csrfLoaded) {
        return
      }

      console.log('useEdbAuth autoRefresh', autoRefresh)

      //setCsrfToken(getCsrfToken())

      if (autoRefresh && csrfToken) {
        try {
          //console.log('useEdbAuth autoRefreshSession')
          await fetchSession()
        } catch (e) {
          console.error(e)
        }
      }

      setLoaded()
    }

    setup()
  }, [autoRefresh, csrfToken, csrfLoaded])

  /**
   * Attempts to return cached access token, but if it determines
   * it is expired, attempts to refresh it.
   * @returns
   */
  async function fetchAccessToken(): Promise<string> {
    //console.log(accessToken, validateToken(accessToken))
    if (validateToken(accessToken)) {
      return accessToken
    }

    if (csrfLoaded && !csrfToken) {
      console.warn('No CSRF token available to fetch access token')
      throw new Error('No CSRF token available')
    }

    const t = await fetchAccessTokenUsingSession(queryClient, csrfToken)

    setAccessToken(t)

    return t
  }

  async function fetchUpdateToken(): Promise<string> {
    if (csrfLoaded && !csrfToken) {
      console.warn('No CSRF token available to fetch access token')
      throw new Error('No CSRF token available')
    }

    return fetchUpdateTokenUsingSession(queryClient, csrfToken)
  }

  function removeData() {
    setSession(null)
    setAccessToken('')
    //setCsrfToken('')

    //Cookies.remove(CSRF_COOKIE_NAME)
  }

  /**
   * Forces a refresh of the current session.
   * This is useful if the session has expired or if you want to ensure
   * that the session is up to date with the server.
   * @returns
   */
  async function refreshSession(): Promise<IEdbSession | null> {
    if (csrfLoaded && !csrfToken) {
      console.warn('No CSRF token available to fetch access token')
      throw new Error('No CSRF token available')
    }

    console.log('refreshSession', csrfToken)

    await httpFetch.post(SESSION_REFRESH_URL, {
      headers: csfrHeaders(csrfToken),
      withCredentials: true,
    })

    return fetchSession()
  }

  /**
   * Fetches the current session from the server.
   *
   * @returns Returns the current session if it exists, otherwise
   * attempts to refresh the session by making a request to the server.
   * If the session is refreshed, it will also update the settings
   * with the current user information.
   */
  async function fetchSession(): Promise<IEdbSession | null> {
    let s: IEdbSession | null = null

    //const csrfToken = getCsrfToken()

    // After refreshing the session, we can fetch the session info
    // to ensure we have the latest user information.
    // This is useful if the user has updated their profile or roles.
    //console.log('fetching session info after refresh')
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

    console.log('getting session', s)

    setSession(s)

    //console.log(settings)

    if (settings.users.length === 0) {
      updateSettings(
        produce(settings, (draft) => {
          draft.users = [
            {
              username: s!.user.username,
              email: s!.user.email,
              firstName: s!.user.firstName,
              lastName: s!.user.lastName,
              roles: s!.user.roles,
            } as IBasicEdbUser,
          ]
        })
      )
    }

    return s
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

  async function signInWithAuth0(token: string): Promise<IEdbSession | null> {
    const csrfToken = await queryClient.fetchQuery({
      queryKey: ['auth0-signin', token],
      queryFn: async () => {
        const res = await httpFetch.postJson<{ data: { csrfToken: string } }>(
          SESSION_AUTH0_SIGNIN_URL, //SESSION_UPDATE_USER_URL,
          {
            headers: bearerHeaders(token),
            withCredentials: true,
          }
        )

        console.log('signInWithAuth0', res)

        const csrfToken = res.data.csrfToken ?? ''

        return csrfToken
      },
    })

    console.log('signInWithAuth0 csrfToken', csrfToken)

    //setCsrfToken(csrfToken)

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

    const session = await fetchSession()

    return session
  }

  async function signInWithSupabase(
    token: string
  ): Promise<IEdbSession | null> {
    const csrfToken = await queryClient.fetchQuery({
      queryKey: ['supabase-signin', token],
      queryFn: async () => {
        // force session creation
        const res = await httpFetch.postJson<{ data: { csrfToken: string } }>(
          SESSION_SUPABASE_SIGNIN_URL,
          {
            headers: bearerHeaders(token),
            withCredentials: true,
          }
        )

        const csrfToken = res.data.csrfToken || ''

        return csrfToken
      },
    })

    //setCsrfToken(csrfToken)

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

    removeData()

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
