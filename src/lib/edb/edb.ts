import { config } from '../../config'

import type { UndefNullStr } from '../text/text'

import Cookies from 'js-cookie'
import { jwtDecode, type JwtPayload } from 'jwt-decode'
import type { IDBEntity } from '../../interfaces/db-entity'
//import { CSRF_COOKIE_NAME } from './edb-auth'

export interface INewUser extends IEdbUser {
  password: string
  // we need to track selected groups  as strings
  // to make toggle group work
  selectedGroups: string[]
}

export interface IAuthProvider extends IDBEntity {
  updatedAt: string
}

// export interface IRBACEntity {
//   id: string
//   name: string
// }

// export interface IRBACPermission {
//   id: string
//   name: string
//   //action: string
// }

export interface IRBACRole extends IDBEntity {
  permissions: IDBEntity[]
}

export interface IRBACGroup extends IDBEntity {
  roles: IRBACRole[]
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

export interface RolePermissions {
  name: string
  permissions: string[]
}

export interface IBasicEdbUser {
  //uuid: string
  username: string
  email: string
  name: string
  pictureUrl?: string
  groups: IRBACGroup[]
  authProviders: IAuthProvider[]
}

// Properties we're ok caching in local storage
export const DEFAULT_BASIC_EDB_USER: IBasicEdbUser = {
  username: '',
  email: '',
  name: '',
  groups: [],
  authProviders: [],
}

// Adds properties obtained from querying the edb server
// session for user info such as API keys that should not be
// cached. These are stored in memory only in a context only
// and are lost on a page refresh/change
export interface IEdbUser extends IBasicEdbUser {
  //id: number
  id: string
  apiKeys: string[]
  isLocked: boolean
}

export const DEFAULT_EDB_USER: INewUser = {
  ...DEFAULT_BASIC_EDB_USER,
  id: '',
  isLocked: false,
  apiKeys: [],
  password: '',
  selectedGroups: [],
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

export const EDB_API_URL = process.env.NEXT_PUBLIC_EDB_API_URL //process.env.NEXT_PUBLIC_EDB_API_URL
export const APP_URL = process.env.NEXT_PUBLIC_SITE_URL //process.env.NEXT_PUBLIC_SITE_URL

export const PERMISSION_ALL = '*:*'
export const ROLE_SUPER = 'SuperAccess::*:*'
export const ROLE_ADMIN = 'AdminAccess::*:*'

export const TEXT_PASSWORDLESS = 'Passwordless'

export const TEXT_SIGN_UP = 'Sign Up'
export const TEXT_CONNECTION_ISSUE = 'Connection issue with server'

export const TEXT_ACCOUNT = 'Account'

export const TEXT_MY_ACCOUNT = 'My Account'

export const EDB_TOKEN_PARAM = 'jwt'
export const REDIRECT_URL_PARAM = 'redirectUrl'

export const TEXT_SERVER_ISSUE =
  'The server does not seem to be available. Please try again at a later time.'

export const ACCOUNT_PATH = '/account'

export const APPS_ROUTE = `/apps`

//export const SIGNEDIN_ROUTE = '/account/signedin'
export const MYACCOUNT_PATH = '/account/myaccount'
export const SIGN_UP_PATH = `${ACCOUNT_PATH}/signup`
export const RESET_PASSWORD_PATH = `${ACCOUNT_PATH}/password/reset`

export const AUTH_PATH = `${ACCOUNT_PATH}/auth`
//export const SIGNED_OUT_ROUTE = `${AUTH_PATH}/signed-out`
export const SIGNED_OUT_PATH = `${AUTH_PATH}/signed-out`

export const AUTH_PASSWORDLESS_ROUTE = `${AUTH_PATH}/passwordless`
export const AUTH_PASSWORDLESS_SIGN_IN_ROUTE = `${AUTH_PASSWORDLESS_ROUTE}/signin`

export const OTP_PATH = `${AUTH_PATH}/otp`
export const OTP_SIGN_IN_PATH = `${OTP_PATH}/signin`

export const OAUTH2_PATH = `${AUTH_PATH}/oauth2`

export const OAUTH2_AUTH0_PATH = `${OAUTH2_PATH}/auth0`
export const OAUTH2_AUTH0_SIGN_IN_PATH = `${OAUTH2_AUTH0_PATH}/signin`
export const OAUTH2_AUTH0_SIGN_OUT_PATH = `${OAUTH2_AUTH0_PATH}/sign-out`

export const OAUTH2_COGNITO_PATH = `${OAUTH2_PATH}/cognito`
export const OAUTH2_COGNITO_SIGN_IN_PATH = `${OAUTH2_COGNITO_PATH}/signin`
export const OAUTH2_COGNITO_SIGN_OUT_PATH = `${OAUTH2_COGNITO_PATH}/sign-out`

export const OAUTH2_CLERK_PATH = `${OAUTH2_PATH}/clerk`
export const OAUTH2_CLERK_SIGN_IN_PATH = `${OAUTH2_CLERK_PATH}/signin`
export const OAUTH2_CLERK_SIGN_OUT_PATH = `${OAUTH2_CLERK_PATH}/sign-out`
export const OAUTH2_CLERK_CALLBACK_PATH = `${OAUTH2_CLERK_PATH}/callback`

export const OAUTH2_SUPABASE_PATH = `${OAUTH2_PATH}/supabase`
export const OAUTH2_SUPABASE_SIGN_IN_PATH = `${OAUTH2_SUPABASE_PATH}/signin`
export const OAUTH2_SUPABASE_SIGN_OUT_PATH = `${OAUTH2_SUPABASE_PATH}/sign-out`
export const OAUTH2_SUPABASE_CALLBACK_PATH = `${OAUTH2_SUPABASE_PATH}/callback`

//export const OAUTH2_SIGN_IN_PATH = `${OAUTH2_PATH}/signin`
//export const OAUTH2_CALLBACK_ROUTE = `${OAUTH2_PATH}/callback`
//export const OAUTH2_SIGN_OUT_ROUTE = `${OAUTH2_PATH}/sign-out`
//export const OAUTH2_SIGNED_OUT_ROUTE = `${OAUTH2_PATH}/signed-out`

export const EDB_ACCESS_TOKEN_COOKIE = `${config.appId}.access-token-v1`
export const EDB_SESSION_COOKIE = `${config.appId}.session-v2`
export const EDB_USER_COOKIE = `${config.appId}.user-v1`

export const AUTH0_TOOLKIT_LOGIN_ROUTE = '/auth/login'
export const AUTH0_TOOLKIT_LOGOUT_ROUTE = '/auth/logout'

export const APP_ADMIN_USERS_ROUTE = `${APPS_ROUTE}/admin/users`

//export const EDB_REFRESH_TOKEN_COOKIE = "edb-refresh-token"

//export const EDB_NAME_COOKIE = "edb-name"
//export const EDB_EMAIL_COOKIE = "edb-email"
//export const EDB_USERNAME_COOKIE = "edb-username"
//export const EDB_USER_INFO_COOKIE = "edb-user-info"
export const APP_ACCOUNT_URL = `${APP_URL}/account`
//export const APP_AUTH_URL = `${APP_ACCOUNT_URL}/auth`
export const APP_HELP_API_URL = `${APP_URL}/api/help`

export const APP_ACCOUNT_SIGN_IN_URL = `${APP_ACCOUNT_URL}/signin`

//export const APP_ACCOUNT_SIGNED_IN_URL = `${APP_ACCOUNT_URL}/signedin`

export const APP_MYACCOUNT_URL = `${APP_ACCOUNT_URL}/myaccount`
export const APP_ACCOUNT_AUTH_URL = `${APP_ACCOUNT_URL}/auth`
export const APP_VERIFY_EMAIL_URL = `${APP_ACCOUNT_AUTH_URL}/email/verify`
//export const APP_ACCOUNT_AUTH_SIGNIN_CALLBACK_URL = `${APP_ACCOUNT_AUTH_URL}/signin/callback`
//export const APP_ACCOUNT_AUTH_SIGN_OUT_URL = `${APP_ACCOUNT_AUTH_URL}/sign-out`
//export const APP_ACCOUNT_AUTH_SIGN_OUT_CALLBACK_URL = `${APP_ACCOUNT_AUTH_SIGN_OUT_URL}/callback`
export const APP_ACCOUNT_AUTH_SIGNED_OUT_URL = `${APP_ACCOUNT_AUTH_URL}/signed-out`

export const APP_ACCOUNT_OAUTH2_URL = `${APP_ACCOUNT_AUTH_URL}/oauth2`
export const APP_ACCOUNT_OAUTH2_SIGNOUT_URL = `${APP_ACCOUNT_OAUTH2_URL}/sign-out`
export const APP_ACCOUNT_OAUTH2_SIGNOUT_CALLBACK_URL = `${APP_ACCOUNT_OAUTH2_SIGNOUT_URL}/callback`

export const APP_ACCOUNT_OAUTH2_AUTH0_URL = `${APP_ACCOUNT_OAUTH2_URL}/auth0`
export const APP_ACCOUNT_OAUTH2_AUTH0_SIGNIN_URL = `${APP_ACCOUNT_OAUTH2_AUTH0_URL}/signin`
export const APP_ACCOUNT_OAUTH2_AUTH0_CALLBACK_URL = `${APP_ACCOUNT_OAUTH2_AUTH0_SIGNIN_URL}/callback`
export const APP_ACCOUNT_OAUTH2_AUTH0_SIGN_OUT_URL = `${APP_ACCOUNT_OAUTH2_AUTH0_URL}/sign-out`

export const APP_ACCOUNT_OAUTH2_COGNITO_URL = `${APP_ACCOUNT_OAUTH2_URL}/cognito`
export const APP_ACCOUNT_COGNITO_SIGNIN_URL = `${APP_ACCOUNT_OAUTH2_COGNITO_URL}/signin`
export const APP_ACCOUNT_OAUTH2_COGNITO_SIGNIN_CALLBACK_URL = `${APP_ACCOUNT_COGNITO_SIGNIN_URL}/callback`
export const APP_ACCOUNT_OAUTH2_COGNITO_SIGN_OUT_URL = `${APP_ACCOUNT_OAUTH2_COGNITO_URL}/sign-out`

export const APP_ACCOUNT_OAUTH2_SUPABASE_URL = `${APP_ACCOUNT_OAUTH2_URL}/supabase`
export const APP_ACCOUNT_OAUTH2_SUPABASE_SIGNIN_URL = `${APP_ACCOUNT_OAUTH2_SUPABASE_URL}/signin`
export const APP_ACCOUNT_OAUTH2_SUPABASE_SIGNIN_CALLBACK_URL = `${APP_ACCOUNT_OAUTH2_SUPABASE_SIGNIN_URL}/callback`
export const APP_ACCOUNT_OAUTH2_SUPABASE_SIGN_OUT_URL = `${APP_ACCOUNT_OAUTH2_SUPABASE_URL}/sign-out`

export const APP_ACCOUNT_OAUTH2_CLERK_URL = `${APP_ACCOUNT_OAUTH2_URL}/clerk`
export const APP_ACCOUNT_OAUTH2_CLERK_SIGNIN_URL = `${APP_ACCOUNT_OAUTH2_CLERK_URL}/signin`
export const APP_ACCOUNT_OAUTH2_CLERK_SIGNIN_CALLBACK_URL = `${APP_ACCOUNT_OAUTH2_CLERK_SIGNIN_URL}/callback`
export const APP_ACCOUNT_OAUTH2_CLERK_SIGN_OUT_URL = `${APP_ACCOUNT_OAUTH2_CLERK_URL}/sign-out`

export const APP_ACCOUNT_OAUTH2_SIGN_IN_URL = `${APP_ACCOUNT_OAUTH2_URL}/signin`
export const APP_ACCOUNT_OAUTH2_CALLBACK_URL = `${APP_ACCOUNT_OAUTH2_URL}/callback`
export const APP_ACCOUNT_OAUTH2_SIGN_OUT_URL = `${APP_ACCOUNT_OAUTH2_URL}/sign-out`
//export const APP_ACCOUNT_OAUTH2_SIGNED_OUT_URL = `${APP_ACCOUNT_OAUTH2_URL}/signedout`

export const APP_ADMIN_USERS_URL = `${APP_URL}/apps/admin/users`

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

export const API_WGS_URL = `${API_MODULES_URL}/wgs`
//export const API_MUTATIONS_DATABASES_URL = `${API_MUTATIONS_URL}/datasets`
//export const API_MUTATIONS_PILEUP_URL = `${API_MUTATIONS_URL}/pileup`

export const API_ADMIN_URL = `${EDB_API_URL}/admin`
//export const API_ADMIN_ROLES_URL = `${API_ADMIN_URL}/roles`
export const API_ADMIN_GROUPS_URL = `${API_ADMIN_URL}/groups`
export const API_ADMIN_USERS_URL = `${API_ADMIN_URL}/users`
export const API_ADMIN_ADD_USER_URL = `${API_ADMIN_USERS_URL}/add`
export const API_ADMIN_UPDATE_USER_URL = `${API_ADMIN_USERS_URL}/update`
//export const API_ADMIN_DELETE_USER_URL = `${API_ADMIN_USERS_URL}/delete`
export const API_ADMIN_USER_STATS_URL = `${API_ADMIN_USERS_URL}/stats`

export const API_HUBS_URL = `${EDB_API_URL}/modules/hubs`

export const API_GEX_URL = `${EDB_API_URL}/modules/gex`
export const API_GEX_TECHNOLOGIES_URL = `${API_GEX_URL}/technologies`
//export const API_GEX_VALUE_TYPES_URL = `${API_GEX_URL}/types`
export const API_GEX_DATASETS_URL = `${API_GEX_URL}/datasets`
//export const API_GEX_EXPR_URL = `${API_GEX_URL}/expression`

export const API_SCRNA_URL = `${EDB_API_URL}/modules/scrna`
export const API_SCRNA_ASSEMBLIES_URL = `${API_SCRNA_URL}/assemblies`
//export const API_GEX_VALUE_TYPES_URL = `${API_GEX_URL}/types`
export const API_SCRNA_DATASETS_URL = `${API_SCRNA_URL}/datasets`
//export const API_SCRNA_CLUSTERS_URL = `${API_SCRNA_URL}/clusters`
//export const API_SCRNA_METADATA_URL = `${API_SCRNA_URL}/metadata`
//export const API_SCRNA_GENES_URL = `${API_SCRNA_URL}/genes`
//export const API_SCRNA_SEARCH_GENES_URL = `${API_SCRNA_GENES_URL}/search`
//export const API_SCRNA_GEX_URL = `${API_SCRNA_URL}/gex`

export const API_MOTIFS_URL = `${EDB_API_URL}/modules/motifs`
export const API_MOTIF_DATASETS_URL = `${API_MOTIFS_URL}/datasets`
export const API_MOTIF_SEARCH_URL = `${API_MOTIFS_URL}/search`
export const API_MOTIF_TO_GENES_URL = `${API_MOTIFS_URL}/genes`

export const API_SEQS_URL = `${EDB_API_URL}/modules/seqs`
//export const API_SEQS_SEARCH_URL = `${API_SEQS_URL}/search`
export const API_SEQS_BINS_URL = `${API_SEQS_URL}/bins`

export const API_BEDS_URL = `${EDB_API_URL}/modules/beds`
//export const API_SEARCH_BEDS_URL = `${API_BEDS_URL}/search`
export const API_BEDS_REGIONS_URL = `${API_BEDS_URL}/regions`

export const API_PATHWAY_URL = `${EDB_API_URL}/modules/pathway`
export const API_PATHWAY_GENES_URL = `${API_PATHWAY_URL}/genes`
export const API_PATHWAY_DATASET_URL = `${API_PATHWAY_URL}/dataset`
export const API_PATHWAY_COLLECTIONS_URL = `${API_PATHWAY_URL}/collections`
export const API_PATHWAY_DATASETS_URL = `${API_PATHWAY_URL}/datasets`
export const API_PATHWAY_OVERLAP_URL = `${API_PATHWAY_URL}/overlap`

//export const API_GENES_DB_URL = `${API_GENES_URL}/db`

export const API_CYTOBANDS_URL = `${EDB_API_URL}/modules/cytobands`

export const API_TOKEN_VALIDATE_URL = `${EDB_API_URL}/tokens/validate`

export const SESSION_URL = `${EDB_API_URL}/sessions`
export const SESSION_INIT_URL = `${SESSION_URL}/init`
export const SESSION_INFO_URL = `${SESSION_URL}/info`

export const SESSION_REFRESH_URL = `${SESSION_URL}/refresh`

export const SESSION_API_KEY_SIGNIN_URL = `${SESSION_URL}/api/keys/signin`
export const SESSION_AUTH_URL = `${SESSION_URL}/auth`
export const SESSION_OAUTH2_URL = `${SESSION_AUTH_URL}/oauth2`
export const SESSION_AUTH0_SIGNIN_URL = `${SESSION_OAUTH2_URL}/auth0/signin`
export const SESSION_COGNITO_SIGNIN_URL = `${SESSION_OAUTH2_URL}/cognito/signin`
export const SESSION_CLERK_SIGNIN_URL = `${SESSION_OAUTH2_URL}/clerk/signin`
export const SESSION_SUPABASE_SIGNIN_URL = `${SESSION_OAUTH2_URL}/supabase/signin`
export const SESSION_SUPABASE_CALLBACK_URL = `${SESSION_OAUTH2_URL}/supabase/callback`

export const SESSION_SIGNOUT_URL = `${SESSION_URL}/sign-out`

export const SESSION_AUTH_SIGNIN_URL = `${SESSION_AUTH_URL}/signin`

export const SESSION_AUTH_OTP_URL = `${SESSION_AUTH_URL}/otp`
export const SESSION_AUTH_OTP_SEND_URL = `${SESSION_AUTH_OTP_URL}/send`
export const SESSION_AUTH_OTP_SIGNIN_URL = `${SESSION_AUTH_OTP_URL}/signin`

export const SESSION_AUTH_PASSWORDLESS_VALIDATE_URL = `${SESSION_AUTH_URL}/passwordless/validate`

export const SESSION_USER_URL = `${SESSION_URL}/user`
export const SESSION_UPDATE_USER_URL = `${SESSION_USER_URL}/update`
export const SESSION_UPDATE_PASSWORD_URL = `${SESSION_USER_URL}/passwords/update`

//export const SESSION_ACCESS_TOKEN_URL = `${SESSION_TOKENS_URL}/access`
//export const SESSION_CREATE_TOKEN_URL = `${SESSION_TOKENS_URL}/create`

// initiate resets
//export const SESSION_RESET_PASSWORD_URL = `${SESSION_URL}/password/reset`
//export const SESSION_UPDATE_EMAIL_URL = `${SESSION_URL}/email/reset`

export const API_SIGNUP_URL = `${EDB_API_URL}/signup`

export const APP_RESET_PASSWORD_URL = `${APP_URL}/account/password/reset`
export const APP_UPDATE_EMAIL_URL = `${APP_URL}/account/email/update`

export const COOKIE_EXPIRE_DAYS = 365

export const EDB_SEP = '|'

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

/**
 * Returns true if user has signed in and has a valid session.
 *
 * @returns true if signed in with session
 */
export function userIsSignedInWithSession(): boolean {
  return Boolean(Cookies.get(EDB_SESSION_COOKIE))
}

export function flattenGroups(groups: IRBACGroup[]): string[] {
  const flattened: string[] = []

  for (let group of groups) {
    for (let role of group.roles) {
      for (let perm of role.permissions) {
        flattened.push(`${group.name}::${role.name}::${perm.name}`)
        //fattened.push(
        //  `group=${group.name},role=${role.name},perm=${perm.resource}:${perm.action}`
        //)
      }
    }
  }

  return flattened
}

export function flattenRoles(groups: IRBACGroup[]): string[] {
  const flattened: Set<string> = new Set<string>()

  for (let group of groups) {
    for (let role of group.roles) {
      for (let perm of role.permissions) {
        flattened.add(`${role.name}::${perm.name}`)
        //fattened.push(
        //  `group=${group.name},role=${role.name},perm=${perm.resource}:${perm.action}`
        //)
      }
    }
  }

  return [...flattened].sort()
}

// export function flattenRoles(roles: RolePermissions[]): string[] {
//   const flatRoles: string[] = []

//   for (let role of roles) {
//     for (let perm of role.permissions) {
//       flatRoles.push(`${role.name}:${perm}`)
//     }
//   }

//   return flatRoles
// }

// export function flattenCompactRoles(roles: RolePermissions[]): string[] {
//   const flatRoles: string[] = []

//   for (let role of roles) {
//     flatRoles.push(`${role.name}:${role.permissions.join(',')}`)
//   }

//   return flatRoles
// }

function hasRole(user: IEdbUser, f: (roles: Set<string>) => boolean): boolean {
  // technically should not happen as user should always have
  // groups even if empty array, but to be safe we can skip
  // on null/undefined so that pages render since hasRole can
  // stop a lot of page rendering if it fails
  if (!user.groups) {
    return false
  }

  const roles = new Set(
    user.groups.flatMap((group) =>
      group.roles.flatMap((role) =>
        role.permissions.map(
          (perm) => `${group.name}::${role.name}::${perm.name}`
        )
      )
    )
  )

  return f(roles)
}

export function hasSuperRole(user: IEdbUser): boolean {
  return hasRole(user, (roles) => {
    for (let role of roles) {
      if (role.includes(ROLE_SUPER)) {
        return true
      }
    }

    return false
  })
}

export function hasAdminRole(user: IEdbUser): boolean {
  return hasRole(user, (roles) => {
    for (let role of roles) {
      if (role.includes(ROLE_ADMIN) || role.includes(ROLE_SUPER)) {
        return true
      }
    }

    return false
  })
}

export function hasAdminPermission(user: IEdbUser): boolean {
  return hasRole(user, (roles) => {
    for (let role of roles) {
      if (role.includes(PERMISSION_ALL)) {
        return true
      }
    }

    return false
  })
}

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
