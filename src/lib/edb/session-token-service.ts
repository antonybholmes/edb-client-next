import { httpFetch } from '../http/http-fetch'
import { csfrHeaders } from '../http/urls'
import { csrfService } from './csrf-service'
import { SESSION_URL } from './edb'

export const CSRF_COOKIE_NAME = 'csrf-token'
export const SESSION_TOKENS_URL = `${SESSION_URL}/tokens`
export const DEFAULT_AUDIENCE = '*'

export type TokenType = 'access' | 'update' | 'refresh'
export type TokenOpts = { audience?: string }

class SessionTokenService {
  // holds the in-flight fetch promise
  private tokenPromises = new Map<string, Promise<string>>()

  async getAccessToken(opts: TokenOpts = {}): Promise<string> {
    return this.getToken('access', opts)
  }

  async getUpdateToken(opts: TokenOpts = {}): Promise<string> {
    return this.getToken('update', opts)
  }

  // Fetch the CSRF token, single-flight and cached
  async getToken(type: TokenType, opts: TokenOpts = {}): Promise<string> {
    const { audience = DEFAULT_AUDIENCE } = opts

    // If a request is already in-flight, reuse it
    const key = JSON.stringify({ type, audience })

    if (!this.tokenPromises.has(key)) {
      const promise = this.fetchTokenFromServer(type, opts).finally(() => {
        this.tokenPromises.delete(key) // reset for next fetch
      })

      this.tokenPromises.set(key, promise)
    }

    return this.tokenPromises.get(key)!
  }

  private async fetchTokenFromServer(
    type: TokenType,
    opts: TokenOpts = {}
  ): Promise<string> {
    const { audience = DEFAULT_AUDIENCE } = opts

    const csrfToken = await csrfService.getToken()

    let body: Record<string, any> = { type }

    if (audience !== DEFAULT_AUDIENCE) {
      body.audience = audience
    }

    // token not valid so attempt to use session to refresh
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
}

// Singleton instance
export const sessionTokenService = new SessionTokenService()
