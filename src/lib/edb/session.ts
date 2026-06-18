import { httpFetch } from '../http/http-fetch'
import { csfrHeaders } from '../http/urls'
import { getCSRFToken } from './csrf'
import { SESSION_URL } from './edb'

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
