import { APP_ID } from '@/consts'
import { httpFetch } from '@lib/http/http-fetch'

import type { UndefNullStr } from '@lib/text/text'
import type { QueryClient } from '@tanstack/react-query'

//import { useUserStore } from "@/stores/account-store"

import Cookies from 'js-cookie'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import { csfrHeaders } from '../http/urls'
//import { CSRF_COOKIE_NAME } from './edb-auth'

export interface IBasicEdbUser {
  //uuid: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

// Properties we're ok caching in local storage
export const DEFAULT_BASIC_EDB_USER: IBasicEdbUser = {
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  roles: [],
}

// Adds properties obtained from querying the edb server
// session for user info such as API keys that should not be
// cached. These are stored in memory only in a context only
// and are lost on a page refresh/change
export interface IEdbUser extends IBasicEdbUser {
  //id: number
  publicId: string
  apiKeys: string[]
  isLocked: boolean
}

export const DEFAULT_EDB_USER: IEdbUser = {
  ...DEFAULT_BASIC_EDB_USER,
  publicId: '',
  isLocked: false,
  apiKeys: [],
  //id: 0,
}

export const EPOCH_DATE = new Date('1970-01-01T00:00:00Z')

export interface IEdbSession {
  user: IEdbUser
  createdAt: Date
  expiresAt: Date
}

export const DEFAULT_EDB_SESSION: IEdbSession = {
  user: { ...DEFAULT_EDB_USER },
  createdAt: EPOCH_DATE,
  expiresAt: EPOCH_DATE,
}

export const EDB_API_URL = process.env.NEXT_PUBLIC_EDB_API_URL //import.meta.env.PUBLIC_EDB_API_URL
export const APP_URL = process.env.NEXT_PUBLIC_SITE_URL //import.meta.env.PUBLIC_SITE_URL

export const ROLE_SUPER = 'Super'
export const ROLE_ADMIN = 'Admin'

export const TEXT_PASSWORDLESS = 'Passwordless'

export const TEXT_SIGN_UP = 'Sign Up'
export const TEXT_CONNECTION_ISSUE = 'Connection issue with server'

export const TEXT_ACCOUNT = 'Account'

export const TEXT_MY_ACCOUNT = 'My Account'

export const EDB_TOKEN_PARAM = 'jwt'
export const REDIRECT_URL_PARAM = 'redirectUrl'

export const TEXT_SERVER_ISSUE =
  'The server does not seem to be available. Please try again at a later time.'

export const ACCOUNT_ROUTE = '/account'

export const SIGN_OUT_ROUTE = '/account/signout'
export const SIGNED_OUT_ROUTE = '/account/signedout'
//export const SIGNEDIN_ROUTE = '/account/signedin'
export const MYACCOUNT_ROUTE = '/account/myaccount'
export const SIGN_UP_ROUTE = `${ACCOUNT_ROUTE}/signup`
export const RESET_PASSWORD_ROUTE = '/account/password/reset'

export const AUTH_ROUTE = `${ACCOUNT_ROUTE}/auth`

export const AUTH_PASSWORDLESS_ROUTE = `${AUTH_ROUTE}/passwordless`
export const AUTH_PASSWORDLESS_SIGN_IN_ROUTE = `${AUTH_PASSWORDLESS_ROUTE}/signin`

export const OTP_ROUTE = `${AUTH_ROUTE}/otp`
export const OTP_SIGN_IN_ROUTE = `${OTP_ROUTE}/signin`

export const OAUTH2_ROUTE = `${AUTH_ROUTE}/oauth2`

export const OAUTH2_CLERK_ROUTE = `${OAUTH2_ROUTE}/clerk`
export const OAUTH2_CLERK_SIGN_IN_ROUTE = `${OAUTH2_CLERK_ROUTE}/signin`
export const OAUTH2_CLERK_CALLBACK_ROUTE = `${OAUTH2_CLERK_ROUTE}/callback`

export const OAUTH2_SUPABASE_ROUTE = `${OAUTH2_ROUTE}/supabase`
export const OAUTH2_SUPABASE_SIGN_IN_ROUTE = `${OAUTH2_SUPABASE_ROUTE}/signin`
export const OAUTH2_SUPABASE_CALLBACK_ROUTE = `${OAUTH2_SUPABASE_ROUTE}/callback`

export const OAUTH2_SIGN_IN_ROUTE = `${OAUTH2_ROUTE}/signin`
export const OAUTH2_CALLBACK_ROUTE = `${OAUTH2_ROUTE}/callback`
export const OAUTH2_SIGN_OUT_ROUTE = `${OAUTH2_ROUTE}/signout`
export const OAUTH2_SIGNED_OUT_ROUTE = `${OAUTH2_ROUTE}/signedout`

export const EDB_ACCESS_TOKEN_COOKIE = `${APP_ID}.access-token-v1`
export const EDB_SESSION_COOKIE = `${APP_ID}.session-v2`
export const EDB_USER_COOKIE = `${APP_ID}.user-v1`

export const AUTH0_TOOLKIT_LOGIN = '/auth/login'

//export const EDB_REFRESH_TOKEN_COOKIE = "edb-refresh-token"

//export const EDB_NAME_COOKIE = "edb-name"
//export const EDB_EMAIL_COOKIE = "edb-email"
//export const EDB_USERNAME_COOKIE = "edb-username"
//export const EDB_USER_INFO_COOKIE = "edb-user-info"
export const APP_ACCOUNT_URL = `${APP_URL}/account`
export const APP_AUTH_URL = `${APP_ACCOUNT_URL}/auth`
export const APP_HELP_API_URL = `${APP_URL}/api/help`

export const APP_VERIFY_EMAIL_URL = `${APP_AUTH_URL}/email/verify`
export const APP_ACCOUNT_SIGN_IN_URL = `${APP_ACCOUNT_URL}/signin`

export const APP_ACCOUNT_SIGNED_IN_URL = `${APP_ACCOUNT_URL}/signedin`
export const APP_ACCOUNT_SIGNED_OUT_URL = `${APP_ACCOUNT_URL}/signedout`
export const APP_MYACCOUNT_URL = `${APP_ACCOUNT_URL}/myaccount`
export const APP_ACCOUNT_AUTH_URL = `${APP_ACCOUNT_URL}/auth`

export const APP_ACCOUNT_OAUTH2_URL = `${APP_ACCOUNT_AUTH_URL}/oauth2`
export const APP_ACCOUNT_AUTH0_URL = `${APP_ACCOUNT_OAUTH2_URL}/auth0`
export const APP_ACCOUNT_AUTH0_SIGNIN_URL = `${APP_ACCOUNT_AUTH0_URL}/signin`
export const APP_ACCOUNT_AUTH0_CALLBACK_URL = `${APP_ACCOUNT_AUTH0_URL}/callback`

export const APP_OAUTH2_SUPABASE_URL = `${APP_ACCOUNT_OAUTH2_URL}/supabase`
export const APP_OAUTH2_SUPABASE_SIGN_IN_URL = `${APP_OAUTH2_SUPABASE_URL}/signin`
export const APP_OAUTH2_SUPABASE_CALLBACK_URL = `${APP_OAUTH2_SUPABASE_URL}/callback`
export const APP_OAUTH2_SUPABASE_SIGNOUT_URL = `${APP_OAUTH2_SUPABASE_URL}/signout`

export const APP_OAUTH2_SIGN_IN_URL = `${APP_ACCOUNT_OAUTH2_URL}/signin`
export const APP_OAUTH2_CALLBACK_URL = `${APP_ACCOUNT_OAUTH2_URL}/callback`
export const APP_OAUTH2_SIGN_OUT_URL = `${APP_ACCOUNT_OAUTH2_URL}/signout`
export const APP_OAUTH2_SIGNED_OUT_URL = `${APP_ACCOUNT_OAUTH2_URL}/signedout`

export const APP_ADMIN_USERS_URL = `${APP_URL}/admin/users`

export const API_ABOUT_URL = `${EDB_API_URL}/about`
export const API_AUTH_URL = `${EDB_API_URL}/auth`
export const API_EMAIL_VERIFIED_URL = `${API_AUTH_URL}/email/verified`
export const API_USER_URL = `${API_AUTH_URL}/users`
export const API_UPDATE_USER_URL = `${API_USER_URL}/update`

export const API_AUTH0_URL = `${API_AUTH_URL}/auth0`
export const API_AUTH0_VALIDATE_TOKEN_URL = `${API_AUTH0_URL}/validate`

export const API_RESET_PASSWORD_URL = `${API_AUTH_URL}/passwords/reset`
export const API_RESET_EMAIL_URL = `${API_AUTH_URL}/email/reset`

// the urls that perform the updates when signed with a jwt
export const API_UPDATE_PASSWORD_URL = `${API_AUTH_URL}/passwords/update`
export const API_UPDATE_EMAIL_URL = `${API_AUTH_URL}/email/update`

export const API_UTILS_URL = `${EDB_API_URL}/utils`
export const API_XLSX_URL = `${API_UTILS_URL}/xlsx`
export const API_XLSX_TO_JSON_URL = `${API_XLSX_URL}/to/json`

export const API_MODULES_URL = `${EDB_API_URL}/modules`
export const API_DNA_URL = `${API_MODULES_URL}/dna`
export const API_DNA_GENOMES_URL = `${API_MODULES_URL}/dna/genomes`
export const API_GENECONV_URL = `${API_MODULES_URL}/geneconv`

export const API_MUTATIONS_URL = `${API_MODULES_URL}/mutations`
export const API_MUTATIONS_DATABASES_URL = `${API_MUTATIONS_URL}/datasets`

export const API_ADMIN_URL = `${EDB_API_URL}/admin`
export const API_ADMIN_ROLES_URL = `${API_ADMIN_URL}/roles`
export const API_ADMIN_USERS_URL = `${API_ADMIN_URL}/users`
export const API_ADMIN_ADD_USER_URL = `${API_ADMIN_USERS_URL}/add`
export const API_ADMIN_UPDATE_USER_URL = `${API_ADMIN_USERS_URL}/update`
export const API_ADMIN_DELETE_USER_URL = `${API_ADMIN_USERS_URL}/delete`
export const API_ADMIN_USER_STATS_URL = `${API_ADMIN_USERS_URL}/stats`

export const API_HUBS_URL = `${EDB_API_URL}/modules/hubs`

export const API_GEX_URL = `${EDB_API_URL}/modules/gex`
export const API_GEX_TECHNOLOGIES_URL = `${API_GEX_URL}/technologies`
//export const API_GEX_VALUE_TYPES_URL = `${API_GEX_URL}/types`
export const API_GEX_DATASETS_URL = `${API_GEX_URL}/datasets`
export const API_GEX_EXP_URL = `${API_GEX_URL}/exp`

export const API_SCRNA_URL = `${EDB_API_URL}/modules/scrna`
export const API_SCRNA_ASSEMBLIES_URL = `${API_SCRNA_URL}/assemblies`
//export const API_GEX_VALUE_TYPES_URL = `${API_GEX_URL}/types`
export const API_SCRNA_DATASETS_URL = `${API_SCRNA_URL}/datasets`
//export const API_SCRNA_CLUSTERS_URL = `${API_SCRNA_URL}/clusters`
export const API_SCRNA_METADATA_URL = `${API_SCRNA_URL}/metadata`
export const API_SCRNA_GENES_URL = `${API_SCRNA_URL}/genes`
export const API_SCRNA_SEARCH_GENES_URL = `${API_SCRNA_GENES_URL}/search`
export const API_SCRNA_GEX_URL = `${API_SCRNA_URL}/gex`

export const API_MOTIFS_URL = `${EDB_API_URL}/modules/motifs`
export const API_MOTIF_DATASETS_URL = `${API_MOTIFS_URL}/datasets`
export const API_MOTIF_SEARCH_URL = `${API_MOTIFS_URL}/search`

export const API_SEQS_URL = `${EDB_API_URL}/modules/seqs`
export const API_SEQS_SEARCH_URL = `${API_SEQS_URL}/search`
export const API_SEQS_BINS_URL = `${API_SEQS_URL}/bins`

export const API_BEDS_URL = `${EDB_API_URL}/modules/beds`
export const API_SEARCH_BEDS_URL = `${API_BEDS_URL}/search`
export const API_BEDS_REGIONS_URL = `${API_BEDS_URL}/regions`

export const API_PATHWAY_URL = `${EDB_API_URL}/modules/pathway`
export const API_PATHWAY_GENES_URL = `${API_PATHWAY_URL}/genes`
export const API_PATHWAY_DATASET_URL = `${API_PATHWAY_URL}/dataset`
export const API_PATHWAY_DATASETS_URL = `${API_PATHWAY_URL}/datasets`
export const API_PATHWAY_OVERLAP_URL = `${API_PATHWAY_URL}/overlap`

export const API_GENOME_URL = `${EDB_API_URL}/modules/genome`
export const API_GENOME_GENOMES_URL = `${API_GENOME_URL}/genomes`
export const API_GENOME_OVERLAP_URL = `${API_GENOME_URL}/overlap`
export const API_GENOME_INFO_URL = `${API_GENOME_URL}/info`
//export const API_GENES_DB_URL = `${API_GENES_URL}/db`

export const API_CYTOBANDS_URL = `${EDB_API_URL}/modules/cytobands`

export const API_MUTATIONS_PILEUP_URL = `${API_MUTATIONS_URL}/pileup`
export const API_MICROARRAY_URL = `${EDB_API_URL}/modules/microarray`
export const API_MICROARRAY_EXPRESSION_URL = `${API_MICROARRAY_URL}/expression`
export const API_TOKEN_VALIDATE_URL = `${EDB_API_URL}/tokens/validate`

export const SESSION_URL = `${EDB_API_URL}/sessions`
export const SESSION_INIT_URL = `${SESSION_URL}/init`
export const SESSION_INFO_URL = `${SESSION_URL}/info`
export const SESSION_REFRESH_CSRF_TOKEN_URL = `${SESSION_URL}/csrf-token/refresh`
export const SESSION_REFRESH_URL = `${SESSION_URL}/refresh`

export const SESSION_API_KEY_SIGNIN_URL = `${SESSION_URL}/api/keys/signin`
export const SESSION_AUTH_URL = `${SESSION_URL}/auth`
export const SESSION_OAUTH2_URL = `${SESSION_AUTH_URL}/oauth2`
export const SESSION_AUTH0_SIGNIN_URL = `${SESSION_OAUTH2_URL}/auth0/signin`
export const SESSION_CLERK_SIGNIN_URL = `${SESSION_OAUTH2_URL}/clerk/signin`
export const SESSION_SUPABASE_SIGNIN_URL = `${SESSION_OAUTH2_URL}/supabase/signin`
export const SESSION_SUPABASE_CALLBACK_URL = `${SESSION_OAUTH2_URL}/supabase/callback`

export const SESSION_SIGNOUT_URL = `${SESSION_URL}/signout`

export const SESSION_AUTH_SIGNIN_URL = `${SESSION_AUTH_URL}/signin`

export const SESSION_AUTH_OTP_URL = `${SESSION_AUTH_URL}/otp`
export const SESSION_AUTH_OTP_SEND_URL = `${SESSION_AUTH_OTP_URL}/send`
export const SESSION_AUTH_OTP_SIGNIN_URL = `${SESSION_AUTH_OTP_URL}/signin`

export const SESSION_AUTH_PASSWORDLESS_VALIDATE_URL = `${SESSION_AUTH_URL}/passwordless/validate`

export const SESSION_USER_URL = `${SESSION_URL}/user`
export const SESSION_UPDATE_USER_URL = `${SESSION_USER_URL}/update`
export const SESSION_UPDATE_PASSWORD_URL = `${SESSION_USER_URL}/passwords/update`

export const SESSION_TOKENS_URL = `${SESSION_URL}/tokens`
//export const SESSION_ACCESS_TOKEN_URL = `${SESSION_TOKENS_URL}/access`
export const SESSION_CREATE_TOKEN_URL = `${SESSION_TOKENS_URL}/create`

// initiate resets
//export const SESSION_RESET_PASSWORD_URL = `${SESSION_URL}/password/reset`
//export const SESSION_UPDATE_EMAIL_URL = `${SESSION_URL}/email/reset`

export const API_SIGNUP_URL = `${EDB_API_URL}/signup`

export const APP_RESET_PASSWORD_URL = `${APP_URL}/account/password/reset`
export const APP_UPDATE_EMAIL_URL = `${APP_URL}/account/email/update`

export const COOKIE_EXPIRE_DAYS = 365

export interface IRole {
  publicId: string
  name: string
  description: string
}

export interface IEdbJwtPayload extends JwtPayload {
  userId: string
}

export interface IAccessJwtPayload extends IEdbJwtPayload {
  roles: string
}

export interface IResetJwtPayload extends IEdbJwtPayload {
  data?: string
}

// export function validateRefreshToken(): boolean {
//   //check token exists
//   return validateToken(localStorage.getItem(EDB_REFRESH_TOKEN_COOKIE))
// }

export function sessionCookieExists(): boolean {
  //check token exists

  return (
    Cookies.get(EDB_SESSION_COOKIE) !== undefined &&
    Cookies.get(EDB_SESSION_COOKIE) !== null
  )
}

export function validateAccessToken(): boolean {
  //check token exists
  return validateToken(Cookies.get(EDB_ACCESS_TOKEN_COOKIE))
}

/**
 * Checks if a jwt string is a valid token by decoding and checking
 * the exp parameter.
 *
 * @param token
 * @returns
 */
export function validateToken(token: UndefNullStr): boolean {
  if (!token) {
    return false
  }

  try {
    return validateJwt(jwtDecode<IEdbJwtPayload>(token))
  } catch (err) {
    throw err
  }
}

/**
 * Determines if a jwt is valid.
 * @param jwt
 * @param renewWinSecs  window before expiry within which jwt will be declared invalid
 *                      so that renewal is forced before jwt expires to make user
 *                      experience more seamless, i.e. user can do something and
 *                      jwt will be renewed so that on the next call it is fresh.
 *                      This is to stop a scenario where the frontend says the
 *                      jwt is invalid, but it becomes invalid on the (short) round
 *                      trip request to the server and doesn't allow an action to
 *                      happen making the UI between server and frontend disconnected.
 * @returns
 */
export function validateJwt(
  jwt: IEdbJwtPayload,
  renewWinSecs: number = 60
): boolean {
  if (!jwt) {
    return false
  }

  const jwtExpInSeconds = jwt.exp ?? 0

  const nowInSeconds = Math.floor(new Date().getTime() / 1000)

  // invalidate if now is within window seconds of expiry date.
  // we use 60 secs for example to ensure that the accesstoken is
  // valid into the future so that (hopefully) if a function makes
  // use of the token, it will be refreshed rather than being
  // used when invalid
  return nowInSeconds < jwtExpInSeconds - renewWinSecs
}

/**
 * Checks a user's jwt is valid and if not, will attempt to renew it.
 *
 * @returns A valid jwt token or null if user is not allowed a token
 */
export async function fetchAccessTokenUsingSession(
  queryClient: QueryClient,
  csrfToken: string
): Promise<string> {
  // let token: string = ''

  // //const queryClient = useQueryClient()

  // try {
  //   // token not valid so attempt to use session to refresh
  //   const res = await queryClient.fetchQuery({
  //     queryKey: ['access_token'],
  //     queryFn: () =>
  //       httpFetch.postJson<{ data: { accessToken: string } }>(
  //         SESSION_ACCESS_TOKEN_URL,
  //         {
  //           withCredentials: true,
  //         }
  //       ),
  //   })

  //   token = res.data.accessToken
  // } catch {
  //   console.error('cannot fetch access token from remote')
  // }

  return fetchTokenUsingSession(queryClient, csrfToken, 'access')
}

export async function fetchUpdateTokenUsingSession(
  queryClient: QueryClient,
  csrfToken: string
): Promise<string> {
  return fetchTokenUsingSession(queryClient, csrfToken, 'update')
}

export async function fetchTokenUsingSession(
  queryClient: QueryClient,
  csrfToken: string,
  tokenType: 'access' | 'update' | 'refresh'
): Promise<string> {
  //const queryClient = useQueryClient()

  if (!csrfToken) {
    console.warn(`No CSRF token available, cannot fetch ${tokenType} token.`)
    throw new Error('No CSRF token available')
  }

  // token not valid so attempt to use session to refresh
  const res = await queryClient.fetchQuery({
    queryKey: ['token', tokenType],
    staleTime: 0,
    queryFn: () =>
      httpFetch.postJson<{ data: { token: string } }>(
        `${SESSION_CREATE_TOKEN_URL}/${tokenType}`,
        {
          headers: csfrHeaders(csrfToken),
          withCredentials: true,
        }
      ),
  })

  return res.data.token ?? ''
}

/**
 * Returns true if user has signed in and has a valid session.
 *
 * @returns true if signed in with session
 */
export function userIsSignedInWithSession(): boolean {
  return Boolean(Cookies.get(EDB_SESSION_COOKIE))
}

/**
 * Force load account info from server, so cache the the
 * account where possible.
 *
 * @returns The account info
 */
// export async function loadAccount(): Promise<IAccount> {
//   const res = await queryClient.fetchQuery("info", () =>
//     axios.get(SESSION_USER_URL, {
//       // the server is allowed access to the session in local
//       // storage so it knows we are logged in. Since the session
//       // is validated on the server, we don't need to provide
//       // extra credentials. If we are logged in, we will get
//       // the account info back.
//       withCredentials: true,
//     }),
//   )

//   const userInfo: IAccount = res.data

//   console.log("user", userInfo)

//   return userInfo
// }

// export async function loadAccount(): Promise<IUser> {
//   try {
//     const token = await fetchAccessToken()

//     const res = await queryClient.fetchQuery({
//       queryKey: ["info"],
//       queryFn: () =>
//         axios.post(
//           API_USER_URL,
//           {},
//           {
//             headers: bearerHeaders(token),
//             // the server is allowed access to the session in local
//             // storage so it knows we are logged in. Since the session
//             // is validated on the server, we don't need to provide
//             // extra credentials. If we are logged in, we will get
//             // the account info back.
//             //withCredentials: true,
//           },
//         ),
//     })

//     const userInfo: IUser = res.data

//     return userInfo
//   } catch (err) {
//     throw err
//   }
// }

// export async function loadAccountFromCookie(
//   force: boolean = false,
// ): Promise<IUser> {
//   if (!force) {
//     //check token exists
//     const token = Cookies.get(EDB_USER_COOKIE)

//     if (token) {
//       return JSON.parse(token)
//     }
//   }

//   try {
//     const userInfo: IUser = await loadAccount()

//     Cookies.set(EDB_USER_COOKIE, JSON.stringify(userInfo))

//     return userInfo
//   } catch (err) {
//     throw err
//   }
// }

// interface IUseAccountReturnType {
//   account: IUser
//   refreshAccount: () => void
//   isLoading: boolean
//   error: Error | null
// }

// export function useAccount(): IUseAccountReturnType {
//   const [account, setAccount] = useState<IAccount>({ ...DEFAULT_ACCOUNT })
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<Error | null>(null)

//   useEffect(() => {
//     async function fetch() {
//       try {
//         const ac = await loadAccountFromCookie()

//         setAccount(ac)
//       } catch (err) {
//         setError(err)
//       } finally {
//         setIsLoading(false)
//       }
//     }

//     if (isLoading) {
//       fetch()
//     }
//   }, [isLoading])

//   function refreshAccount() {
//     setIsLoading(true)
//   }

//   return { account, refreshAccount, isLoading, error }
// }

// export function useLoadUserInfo(
//   setUserInfo: Dispatch<SetStateAction<IUserInfo | null>>,
// ) {
//   useEffect(() => {
//     async function load() {
//       setUserInfo(await LoadUserInfo())
//     }

//     load()
//   }, [])
// }

// export async function getAuthJWT(): Promise<string> {
//   const dj = await queryClient.fetchQuery("login", async () => {
//     const data = new FormData()
//     data.append("email", "antony@antonyholmes.dev")
//     data.append("password", "tod4EwVHEyCRK8encuLE")

//     const res = await fetch(API_LOGIN_URL, {
//       method: "POST",
//       body: data,
//     })

//     if (!res.ok) {
//       throw null
//     }

//     return res.json()
//   })

//   console.log(dj)

//   const jwt = dj.data.jwt

//   const jwtData = jwtDecode(jwt)

//   console.log(jwtData)

//   return jwt
// }

/**
 * Log user out of EDB service
 */

/**
 * Log user out of EDB service
 */

// export function isAdmin(account: IAccount) {
//   for (let role of account.roles) {
//     if (role.includes(ROLE_SUPER) || role.includes(ROLE_ADMIN)) {
//       return true
//     }
//   }

//   return false
// }

export function rolesFromAccessToken(accessToken: string): string[] {
  if (accessToken === '') {
    return []
  }

  try {
    const contents = jwtDecode<IAccessJwtPayload>(accessToken)
    return contents.roles.split(' ')
  } catch {
    return []
  }
}

export function isAdminFromAccessToken(
  contents: IAccessJwtPayload | null
): boolean {
  if (!contents) {
    return false
  }

  const roles = contents.roles

  return roles.includes(ROLE_SUPER) || roles.includes(ROLE_ADMIN)
}

/**
 * Returns the payload of a JWT.
 *
 * @param jwt
 * @returns the payload based on the generic type T or null if
 *          there is an error.
 */
export function getJwtContents<T extends IEdbJwtPayload>(
  jwt: string
): T | null {
  if (!jwt) {
    return null
  }

  try {
    return jwtDecode<T>(jwt)
  } catch {
    return null
  }
}

/**
 * Given an access jwt, return the contents to look at roles, claims etc.
 *
 * @param jwt
 * @returns  the jwt payload or null if the jwt is invalid
 */
export function getAccessTokenContents(jwt: string): IAccessJwtPayload | null {
  return getJwtContents<IAccessJwtPayload>(jwt)
}

// export function isAdmin(claim: string) {
//   return claim.includes(ROLE_SUPER) || claim.includes(ROLE_ADMIN)
// }
