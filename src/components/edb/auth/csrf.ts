import { httpFetch } from '@/lib/http/http-fetch'
import Cookies from 'js-cookie'
import { EDB_SEP, SESSION_URL } from '../edb'

export const SESSION_REFRESH_CSRF_TOKENS_URL = `${SESSION_URL}/csrf`
export const CSRF_COOKIE_NAME = 'csrf-token'

// type CSRFState = {
//   token: string | null
//   tokenPromise: Promise<string> | null

//   getCSRFToken: () => Promise<string>
//   fetchTokenFromServer: () => Promise<string>
// }

// export const useCSRFStore = create<CSRFState>((set, get) => ({
//   token: null,
//   tokenPromise: null,

//   getCSRFToken: async () => {
//     const { token, tokenPromise, fetchTokenFromServer } = get()

//     // 1. In-memory cache
//     if (token) {
//       return token
//     }

//     // 2. Cookie
//     const cookie = Cookies.get(CSRF_COOKIE_NAME)
//     const cookieToken = cookie?.split('|')[0]

//     if (cookieToken) {
//       set({ token: cookieToken })
//       return cookieToken
//     }

//     // 3. Single-flight request
//     if (!tokenPromise) {
//       // clear tokenPromise when done to allow future refreshes
//       const promise = fetchTokenFromServer().finally(() => {
//         set({ tokenPromise: null })
//       })

//       set({ tokenPromise: promise })
//       return promise
//     }

//     return tokenPromise
//   },

//   fetchTokenFromServer: async () => {

//     const res = await httpFetch.getJson<{ data: { csrfToken: string } }>(
//       SESSION_REFRESH_CSRF_TOKENS_URL,
//       { withCredentials: true }
//     )

//     const token = res.data.csrfToken

//     // cache in store
//     set({ token })

//     return token
//   },
// }))

// export function useCSRF() {
//   const getCSRFToken = useCSRFStore(state => state.getCSRFToken)
//   const fetchTokenFromServer = useCSRFStore(state => state.fetchTokenFromServer)

//   return { getCSRFToken, fetchTokenFromServer }
// }

let tokenPromise: Promise<string> | null = null

export async function getCSRFToken(): Promise<string> {
  // 1. Read from cookie (source of truth)
  const cookie = Cookies.get(CSRF_COOKIE_NAME)
  const token = cookie?.split(EDB_SEP)[0]

  if (token) {
    return token
  }

  // 2. Single-flight fetch
  if (!tokenPromise) {
    tokenPromise = fetchCSRFTokenFromServer().finally(() => {
      tokenPromise = null
    })
  }

  return tokenPromise
}

export async function fetchCSRFTokenFromServer(): Promise<string> {
  const res = await httpFetch.getJson<{ data: { csrfToken: string } }>(
    SESSION_REFRESH_CSRF_TOKENS_URL,
    { withCredentials: true }
  )

  const token = res.data.csrfToken

  if (!token) {
    throw new Error('No CSRF token returned')
  }

  return token
}
