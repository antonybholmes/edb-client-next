import {
  DEFAULT_EDB_SESSION,
  DEFAULT_EDB_USER,
  fetchAccessTokenUsingSession,
  type IBasicEdbUser,
  type IEdbSessionInfo,
  type IEdbUser,
  SESSION_API_KEY_SIGNIN_URL,
  SESSION_AUTH0_SIGNIN_URL,
  SESSION_AUTH_SIGNIN_URL,
  SESSION_INFO_URL,
  SESSION_REFRESH_URL,
  SESSION_SIGNOUT_URL,
  validateToken,
} from '@/lib/edb/edb'
import { httpFetch } from '@/lib/http/http-fetch'
import { bearerHeaders, JSON_HEADERS } from '@/lib/http/urls'
import { type IChildrenProps } from '@interfaces/children-props'

import { EdbSettingsContext } from '@/lib/edb/edb-settings-provider'
import { useQueryClient } from '@tanstack/react-query'
import { produce } from 'immer'
import { createContext, useContext, useEffect, useState } from 'react'

export interface IEdbAuthContext {
  edbUser: IEdbUser
  edbSession: IEdbSessionInfo
  accessToken: string
  apiKey: string
  signInWithApiKey: (key: string) => Promise<void>
  signInWithUsernamePassword: (
    username: string,
    password: string
  ) => Promise<void>
  signInWithAuth0Token: (auth0Token: string) => Promise<void>
  //fetchUser: () => Promise<void>
  refreshSession: () => Promise<void>
  fetchSessionInfo: () => Promise<void>
  //updateUser: (user: IUser) => void
  getAccessTokenAutoRefresh: () => Promise<string>
  signoutUser: () => Promise<void>
}

export const EdbAuthContext = createContext<IEdbAuthContext>({
  edbUser: { ...DEFAULT_EDB_USER },
  edbSession: { ...DEFAULT_EDB_SESSION },
  accessToken: '',
  apiKey: '',
  signInWithApiKey: () => new Promise((resolve) => resolve()),
  signInWithUsernamePassword: () => new Promise((resolve) => resolve()),
  signInWithAuth0Token: () => new Promise((resolve) => resolve()),
  //fetchUser: () => new Promise(resolve => resolve()),
  refreshSession: () => new Promise((resolve) => resolve()),
  fetchSessionInfo: () => new Promise((resolve) => resolve()),
  //updateUser: () => {},
  getAccessTokenAutoRefresh: async () => new Promise((resolve) => resolve('')),
  signoutUser: () => new Promise((resolve) => resolve()),
})

interface IProps extends IChildrenProps {
  cacheSession?: boolean
}

export function EdbAuthProvider({ cacheSession = true, children }: IProps) {
  const queryClient = useQueryClient()

  const [edbUser, setEdbUser] = useState<IEdbUser>({ ...DEFAULT_EDB_USER })

  const { settings, updateSettings } = useContext(EdbSettingsContext)

  const [edbSession, setEdbSession] = useState<IEdbSessionInfo>({
    ...DEFAULT_EDB_SESSION,
  })

  const [accessToken, setAccessToken] = useState('')

  const [apiKey, setApiKey] = useState('')

  useEffect(() => {
    // cache user on startup
    if (cacheSession) {
      fetchSessionInfo()
    }
  }, [cacheSession])

  /**
   * Attempts to return cached access token, but if it determines
   * it is expired, attempts to refresh it.
   * @returns
   */
  async function getAccessTokenAutoRefresh() {
    //console.log(accessToken, validateToken(accessToken))
    if (validateToken(accessToken)) {
      return accessToken
    }

    const token = await fetchAccessTokenUsingSession(queryClient)

    setAccessToken(token)

    return token
  }

  /**
   * Reload the user only if it appears user
   * is currently invalid, otherwise use the
   * cached version.
   * If the user has already reguest the access token previously,
   * they can supply this as an argument to save having to
   * request it again
   */
  // async function fetchUser(accessToken: string = '') {
  //   if (!accessToken) {
  //     accessToken = await getAccessTokenAutoRefresh()
  //   }

  //   if (!accessToken) {
  //     return
  //   }

  //   try {
  //     const res = await queryClient.fetchQuery({
  //       queryKey: ['user'],
  //       queryFn: () =>
  //         httpFetch.getJson(SESSION_USER_URL, {
  //           //headers: bearerHeaders(accessToken),
  //           // the server is allowed access to the session in local
  //           // storage so it knows we are logged in. Since the session
  //           // is validated on the server, we don't need to provide
  //           // extra credentials. If we are logged in, we will get
  //           // the account info back.
  //           headers:JSON_HEADERS,
  //           withCredentials: true,
  //         }),
  //     })

  //     console.log("getting user", res.data)

  //     let ret: IEdbUser = res.data

  //     setEdbUser(ret)
  //   } catch (err) {
  //     console.error('cannot fetch user from remote')
  //   }
  // }

  async function fetchSessionInfo(accessToken: string = '') {
    if (!accessToken) {
      accessToken = await getAccessTokenAutoRefresh()
    }

    if (!accessToken) {
      return
    }

    try {
      const res = await queryClient.fetchQuery({
        queryKey: ['session'],
        queryFn: () =>
          httpFetch.getJson<{ data: IEdbSessionInfo }>(SESSION_INFO_URL, {
            //headers: bearerHeaders(accessToken),
            // the server is allowed access to the session in local
            // storage so it knows we are logged in. Since the session
            // is validated on the server, we don't need to provide
            // extra credentials. If we are logged in, we will get
            // the account info back.

            withCredentials: true,
          }),
      })

      //console.log('getting session', res.data)

      const s: IEdbSessionInfo = {
        user: res.data.user,
        createdAt: new Date(res.data.createdAt),
        expiresAt: new Date(res.data.expiresAt),
      }

      setEdbSession(s)
      setEdbUser(s.user)

      //console.log(settings)

      if (settings.users.length === 0) {
        updateSettings(
          produce(settings, (draft) => {
            draft.users = [
              {
                username: s.user.username,
                email: s.user.email,
                firstName: s.user.firstName,
                lastName: s.user.lastName,
                roles: s.user.roles,
              } as IBasicEdbUser,
            ]
          })
        )
      }
    } catch {
      console.error('cannot fetch user from remote')
    }
  }

  async function refreshSession() {
    await queryClient.fetchQuery({
      queryKey: ['renew-session'],
      queryFn: () =>
        httpFetch.post(SESSION_REFRESH_URL, {
          headers: JSON_HEADERS,
          withCredentials: true,
        }),
    })

    await fetchSessionInfo()
  }

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

    await fetchSessionInfo()

    setApiKey(apiKey)
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

    await fetchSessionInfo()
  }

  async function signInWithAuth0Token(auth0Token: string) {
    await queryClient.fetchQuery({
      queryKey: ['update'],
      queryFn: () =>
        httpFetch.post(
          SESSION_AUTH0_SIGNIN_URL, //SESSION_UPDATE_USER_URL,
          {
            headers: bearerHeaders(auth0Token),
            withCredentials: true,
          }
        ),
    })

    await fetchSessionInfo()
  }

  async function signoutUser() {
    await queryClient.fetchQuery({
      queryKey: ['signout'],
      queryFn: () =>
        httpFetch.post(SESSION_SIGNOUT_URL, {
          headers: JSON_HEADERS,
          withCredentials: true,
        }),
    })

    setEdbUser({ ...DEFAULT_EDB_USER })
    setEdbSession({ ...DEFAULT_EDB_SESSION })
    setAccessToken('')
    // remove user from cache
    updateSettings(
      produce(settings, (draft) => {
        draft.users = []
      })
    )
  }

  return (
    <EdbAuthContext.Provider
      value={{
        edbUser,
        edbSession,
        accessToken,
        apiKey,
        signInWithApiKey,
        signInWithUsernamePassword,
        signInWithAuth0Token,
        //fetchUser,
        fetchSessionInfo,
        refreshSession,
        getAccessTokenAutoRefresh,
        signoutUser,
      }}
    >
      {children}
    </EdbAuthContext.Provider>
  )
}

// export function useEdbAuth(
//   context: Context<IEdbAuthContext> = EdbAuthContext
// ): IEdbAuthContext {
//   return useContext(context)
// }
