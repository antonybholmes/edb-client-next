import { config } from '@/config'
import { httpFetch } from '@/lib/http/http-fetch'
import { csfrHeaders } from '@/lib/http/urls'
import { createJSONStorage, persist } from 'zustand/middleware'
import { create } from 'zustand/react'
import { SESSION_URL } from '../edb'
import { getCSRFToken } from './csrf'

export const SESSION_TOKENS_URL = `${SESSION_URL}/tokens`
export const DEFAULT_AUDIENCE = '*'

export type TokenType = 'access' | 'update' | 'refresh'
export type TokenOpts = { audience?: string }

// type SessionTokenState = {
//   tokenPromises: Record<string, Promise<string>>

//   getAccessToken: (opts?: TokenOpts) => Promise<string>
//   getUpdateToken: (opts?: TokenOpts) => Promise<string>
//   getToken: (type: TokenType, opts?: TokenOpts) => Promise<string>

//   fetchTokenFromServer: (type: TokenType, opts?: TokenOpts) => Promise<string>
// }

// export const useSessionTokenStore = create<SessionTokenState>((set, get) => ({
//   tokenPromises: {},

//   getAccessToken: (opts = {}) => {
//     return get().getToken('access', opts)
//   },

//   getUpdateToken: (opts = {}) => {
//     return get().getToken('update', opts)
//   },

//   getToken: async (type, opts = {}) => {
//     const { audience = DEFAULT_AUDIENCE } = opts
//     const { tokenPromises, fetchTokenFromServer } = get()

//     const key = JSON.stringify({ type, audience })

//     if (!(key in tokenPromises)) {
//       const promise = fetchTokenFromServer(type, opts).finally(() => {
//         const newMap = { ...get().tokenPromises }
//         delete newMap[key]
//         set({ tokenPromises: newMap })
//       })

//       // add the new promise to the map
//       const newMap = { ...tokenPromises }
//       newMap[key] = promise
//       set({ tokenPromises: newMap })
//     }

//     return get().tokenPromises[key]!
//   },

//   fetchTokenFromServer: async (type, opts = {}) => {
//     const { audience = DEFAULT_AUDIENCE } = opts

//     const csrfToken = await useCSRFStore.getState().getCSRFToken()

//     const body: Record<string, any> = { type }

//     if (audience !== DEFAULT_AUDIENCE) {
//       body.audience = audience
//     }

//     const res = await httpFetch.postJson<{ data: { token: string } }>(
//       SESSION_TOKENS_URL,
//       {
//         headers: csfrHeaders(csrfToken),
//         withCredentials: true,
//         body,
//       }
//     )

//     return res.data.token ?? ''
//   },
// }))

// export function useSessionToken() {
//   const getAccessToken = useSessionTokenStore(state => state.getAccessToken)
//   const getUpdateToken = useSessionTokenStore(state => state.getUpdateToken)

//   return { getAccessToken, getUpdateToken }
// }

const tokenPromises: Record<string, Promise<string>> = {}

export async function getToken(type: TokenType, opts: TokenOpts = {}) {
  const { audience = DEFAULT_AUDIENCE } = opts
  const key = `${type}:${audience}`

  if (!tokenPromises[key]) {
    tokenPromises[key] = fetchTokenFromServer(type, opts).finally(() => {
      delete tokenPromises[key]
    })
  }

  return tokenPromises[key]
}

export async function getAccessToken(opts: TokenOpts = {}) {
  return getToken('access', opts)
}

export async function getUpdateToken(opts: TokenOpts = {}) {
  return getToken('update', opts)
}

async function fetchTokenFromServer(
  type: TokenType,
  opts: TokenOpts = {}
): Promise<string> {
  const { audience = DEFAULT_AUDIENCE } = opts

  const csrfToken = await getCSRFToken()

  const body: Record<string, any> = { type }

  if (audience !== DEFAULT_AUDIENCE) {
    body.audience = audience
  }

  const res = await httpFetch.postJson<{ data: { token: string } }>(
    SESSION_TOKENS_URL,
    {
      headers: csfrHeaders(csrfToken),
      withCredentials: true,
      body,
    }
  )

  return res.data.token ?? ''
}

export interface IRedirectTarget {
  title: string // display title
  path: string // relative path
}

export interface IRedirectState {
  target: IRedirectTarget
}

export const HOME_REDIRECT_TARGET: IRedirectTarget = {
  title: 'Home',
  path: '/',
}

export const HOME_REDIRECT_STATE: IRedirectState = {
  target: HOME_REDIRECT_TARGET,
}

type IEdbSessionStore = {
  redirectTarget: IRedirectTarget | null
  setRedirect: (target: IRedirectTarget) => void
  setHomeRedirect: () => void
  clearRedirect: () => void
}

const SETTINGS_KEY = `${config.appId}:session:v2`

export const useEdbSessionStore = create<IEdbSessionStore>()(
  persist(
    (set) => ({
      redirectTarget: null,
      setRedirect: (target: IRedirectTarget) => {
        if (!isSafeRelativeUrl(target.path)) {
          target = HOME_REDIRECT_TARGET
        }

        set({ redirectTarget: target })
      },
      setHomeRedirect: () => set({ redirectTarget: HOME_REDIRECT_TARGET }),
      clearRedirect: () => set({ redirectTarget: null }),
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export function useEdbSession() {
  const redirectTarget = useEdbSessionStore((state) => state.redirectTarget)
  const setRedirect = useEdbSessionStore((state) => state.setRedirect)
  const setHomeRedirect = useEdbSessionStore((state) => state.setHomeRedirect)
  const clearRedirect = useEdbSessionStore((state) => state.clearRedirect)

  return { redirectTarget, setRedirect, setHomeRedirect, clearRedirect }
}

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
