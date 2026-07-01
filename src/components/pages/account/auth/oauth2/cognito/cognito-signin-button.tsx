'use client'

import { Button } from '@/themed/v2/button'

import { encodeRedirectState } from '@/components/edb/auth/edb-signin'
import {
  HOME_REDIRECT_STATE,
  HOME_REDIRECT_TARGET,
  IRedirectState,
  IRedirectTarget,
  isSafeRelativeUrl,
  useEdbSession,
} from '@/components/edb/auth/session'
import {
  APP_ACCOUNT_AUTH_SIGNED_OUT_URL,
  APP_ACCOUNT_OAUTH2_COGNITO_SIGNIN_CALLBACK_URL,
} from '@/components/edb/edb'
import { TEXT_SIGN_IN } from '@/consts'
import { redirect } from '@/lib/http/urls'
import {} from '../../signin-callback-page'

const COGNITO_DOMAIN = process.env.NEXT_PUBLIC_COGNITO_DOMAIN
const CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID
//const SIGNIN_CALLBACK_URI = process.env.NEXT_PUBLIC_COGNITO_SIGNIN_CALLBACK_URI
//const SIGNOUT_CALLBACK_URI = process.env.NEXT_PUBLIC_COGNITO_SIGNOUT_CALLBACK_URI

function base64UrlEncode(buf: Uint8Array) {
  return btoa(String.fromCharCode(...buf))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

export async function cognitoSignIn(
  state: IRedirectState = HOME_REDIRECT_STATE
) {
  const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(32)))
  localStorage.setItem('pkce_verifier', verifier)

  // Code challenge
  const encoder = new TextEncoder()
  const challengeBuffer = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(verifier)
  )
  const challenge = base64UrlEncode(new Uint8Array(challengeBuffer))

  const stateEncoded = encodeRedirectState(state)

  const url =
    `${COGNITO_DOMAIN}/oauth2/authorize?` +
    `client_id=${CLIENT_ID}` +
    `&response_type=code` +
    `&redirect_uri=${encodeURIComponent(APP_ACCOUNT_OAUTH2_COGNITO_SIGNIN_CALLBACK_URL)}` +
    `&code_challenge=${challenge}` +
    `&code_challenge_method=S256` +
    `&scope=openid+email+profile` +
    `&state=${stateEncoded}`

  //window.location.href = url

  redirect(url)
}

// Handle OAuth2 callback: exchange code for tokens
export async function handleCognitoCallback(): Promise<{
  tokens: { id_token: string; access_token: string; refresh_token?: string }
  state: IRedirectState
} | null> {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const stateRaw = params.get('state')
  const verifier = localStorage.getItem('pkce_verifier')

  if (!code || !verifier) {
    return null
  }

  // Exchange code for tokens
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: CLIENT_ID,
    code_verifier: verifier,
    code,
    redirect_uri: APP_ACCOUNT_OAUTH2_COGNITO_SIGNIN_CALLBACK_URL,
  } as Record<string, string>)

  const res = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  const tokens = await res.json()
  localStorage.removeItem('pkce_verifier')

  // Decode state
  let target: IRedirectTarget = HOME_REDIRECT_TARGET

  if (stateRaw) {
    try {
      target =
        JSON.parse(decodeURIComponent(stateRaw))?.target || HOME_REDIRECT_TARGET
    } catch {
      console.warn('Invalid signout state')
    }
  }

  if (!isSafeRelativeUrl(target.path)) {
    target = HOME_REDIRECT_TARGET
  }

  return { tokens, state: { target } }
}

/**
 * Creates a Cognito signout URL and returns it. The title will be preserved,
 * but the path will be the Cognito logout URL (which will include the
 * redirect to the callback in the target parameter).
 *
 * @param target
 * @returns
 */
export function cognitoSignout(): string {
  // 1. clear local tokens
  //localStorage.removeItem('id_token')
  //localStorage.removeItem('access_token')
  //localStorage.removeItem('refresh_token')

  // 2. redirect to Cognito Hosted UI logout

  // const url =
  //   `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}` +
  //   `&redirect_uri=${encodeURIComponent(SIGNOUT_CALLBACK_URI)}` +
  //   `&response_type=code` +
  //   `&scope=openid+email+profile` +
  //   `&state=cheese`

  const url =
    `${COGNITO_DOMAIN}/logout?client_id=${CLIENT_ID}` +
    `&logout_uri=${encodeURIComponent(APP_ACCOUNT_AUTH_SIGNED_OUT_URL)}`

  return url
}

// export async function handleCognitoSignout() {
//   const params = new URLSearchParams(window.location.search)

//   const stateRaw = params.get('state')

//   let target: IRedirectState = decodeState(stateRaw) ?? DEFAULT_REDIRECT_URL

//   return { target }
// }

// Helper to get access token
// export function getAccessToken() {
//   return localStorage.getItem('access_token')
// }

export function CognitoSignInButton({
  state = HOME_REDIRECT_STATE,
}: {
  state: IRedirectState
}) {
  //const [, setState] = useAtom(signinStateAtom)

  const { setRedirect } = useEdbSession()

  // Allow users to signin
  return (
    <Button
      variant="secondary"
      //className="w-full"
      size="lg"
      onClick={() => {
        setRedirect(state.target)
        cognitoSignIn(state)
      }}
      aria-label={TEXT_SIGN_IN}
    >
      {TEXT_SIGN_IN} with Cognito
    </Button>
  )
}
