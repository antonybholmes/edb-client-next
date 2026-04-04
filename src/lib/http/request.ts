import type { IFieldMap } from '@/interfaces/field-map'
import { JSON_ACCEPT_HEADERS, MIME_JSON } from './urls'

export interface IFetchOptions {
  headers?: IFieldMap
  body?: BodyInit | IFieldMap
  withCredentials?: boolean
  throwError?: boolean
}

export interface IHttpRequest {
  get(url: string, options: IFetchOptions): Promise<Response>
  post(url: string, options: IFetchOptions): Promise<Response>
  getText(url: string, options: IFetchOptions): Promise<string>
  getJson<T>(url: string, options: IFetchOptions): Promise<T>
  postJson<T>(url: string, options: IFetchOptions): Promise<T>
  postJson<T>(url: string, options: IFetchOptions): Promise<T>

  delete(url: string, options: IFetchOptions): Promise<Response>
}

export class ApiError extends Error {
  code: number

  constructor(message: string, code: number) {
    super(message)
    this.name = 'ApiError'
    this.code = code
  }
}

class FetchRequest implements IHttpRequest {
  async getText(url: string, options: IFetchOptions = {}): Promise<string> {
    //devlog(url, body, headers)

    const response = await this.get(url, {
      ...options,
      headers: { ...options.headers, ...JSON_ACCEPT_HEADERS },
    })

    const ret = await response.text()

    return ret
  }

  async getJson<T>(url: string, options: IFetchOptions = {}): Promise<T> {
    //devlog(url, body, headers)

    const response = await this.get(url, {
      ...options,
      headers: { ...options.headers, ...JSON_ACCEPT_HEADERS },
    })

    const ret = await response.json()

    return ret
  }

  async get(url: string, options: IFetchOptions = {}): Promise<Response> {
    //console.log(url, JSON.stringify(body), headers)

    const {
      headers = undefined,
      withCredentials = false,
      throwError = true,
    } = options

    //const headers: IFieldMap = options?.headers ?? {}

    const credentials = this.credentials(withCredentials)

    //const throwError = options?.throwError ?? true

    //console.log('url', url)

    const response = await fetch(url, {
      method: 'GET',
      headers: headers as HeadersInit,
      credentials,
    })

    if (!response.ok && throwError) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return response
  }

  async postJson<T>(url: string, options: IFetchOptions = {}): Promise<T> {
    //devlog(url, body, headers)

    let headers = options.headers ?? {}

    headers['Accept'] ??= MIME_JSON

    const response = await this.post(url, {
      ...options,
      throwError: false,
      headers,
    })

    const ret = await response.json()

    //console.log(response, ret)

    if (!response.ok) {
      throw new ApiError(ret.message || 'API Error', response.status)
    }

    return ret
  }

  async post(url: string, options: IFetchOptions = {}): Promise<Response> {
    //console.log(url, JSON.stringify(body), headers)
    let {
      headers = {},
      body = null,
      withCredentials = true,
      throwError = true,
    } = options

    // don't modify original headers object if provided, create a new one so that
    // we can add content type if needed without side effects
    headers = { ...headers }

    if (body !== null && !(body instanceof FormData)) {
      body = JSON.stringify(body)
      // if content type is not already set, default to json. This allows users to
      // send other body types like form data without having to worry about content
      headers['Content-Type'] ??= MIME_JSON
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: headers as HeadersInit,
      body: body as BodyInit,
      credentials: this.credentials(withCredentials),
    })

    if (!response.ok && throwError) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    return response
  }

  async delete(url: string, options: IFetchOptions = {}): Promise<Response> {
    const { withCredentials = true } = options

    return fetch(url, {
      method: 'DELETE',
      headers: options.headers as HeadersInit,
      credentials: this.credentials(withCredentials),
    })
  }

  credentials(withCredentials: boolean): RequestCredentials {
    return withCredentials ? 'include' : 'same-origin'
  }
}

export const fetchInstance = new FetchRequest()
