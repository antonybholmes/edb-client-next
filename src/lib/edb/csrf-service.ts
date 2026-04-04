import Cookies from 'js-cookie'
import { httpFetch } from '../http/http-fetch'
import { SESSION_URL } from './edb'

export const SESSION_REFRESH_CSRF_TOKENS_URL = `${SESSION_URL}/csrf`
export const CSRF_COOKIE_NAME = 'csrf-token'

class CSRFService {
  // holds the in-flight fetch promise
  private tokenPromise: Promise<string> | null = null

  // Fetch the CSRF token, single-flight and cached
  public async getToken(): Promise<string> {
    // Try to read from cookie first
    const cookie = Cookies.get(CSRF_COOKIE_NAME)
    const token = cookie?.split('|')[0]

    if (token) {
      return token
    }

    // If a request is already in-flight, reuse it
    if (!this.tokenPromise) {
      this.tokenPromise = this.fetchTokenFromServer().finally(() => {
        this.tokenPromise = null
      })
    }

    return this.tokenPromise
  }

  // Internal function: fetch from server
  private async fetchTokenFromServer(): Promise<string> {
    console.log('Fetching CSRF token from server...')
    const res = await httpFetch.getJson<{ data: { csrfToken: string } }>(
      SESSION_REFRESH_CSRF_TOKENS_URL,
      { withCredentials: true }
    )

    const token = res.data.csrfToken

    console.log('CSRF token fetched:', token)
    return token
  }
}

// Singleton instance
export const csrfService = new CSRFService()
