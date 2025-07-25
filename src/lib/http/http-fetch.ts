import type { IFieldMap } from '@interfaces/field-map'
import axios, { type RawAxiosRequestHeaders } from 'axios'
import { JSON_HEADERS } from './urls'

export type RequestType = 'GET' | 'POST'

export type IFetchBody = IFieldMap | FormData

export type HttpBackend = 'axios' | 'fetch'

export interface IFetchOptions {
  headers?: IFieldMap
  body?: IFieldMap
  withCredentials?: boolean
}

interface IHttpRequest {
  get(url: string, options: IFetchOptions): Promise<Response>
  post(url: string, options: IFetchOptions): Promise<Response>

  getJson<T = unknown>(url: string, options: IFetchOptions): Promise<T>
  postJson<T = unknown>(url: string, options: IFetchOptions): Promise<T>

  delete(url: string, options: IFetchOptions): Promise<Response>
}

class FetchRequest implements IHttpRequest {
  async get(url: string, options: IFetchOptions = {}): Promise<Response> {
    //console.log(url, JSON.stringify(body), headers)

    const headers: IFieldMap = options?.headers ?? {}

    const credentials: RequestCredentials = options?.withCredentials
      ? 'include'
      : 'same-origin'

    //console.log('url', url)

    return fetch(url, {
      method: 'GET',
      headers: headers as HeadersInit,
      credentials,
    })
  }

  async post(url: string, options: IFetchOptions = {}): Promise<Response> {
    //console.log(url, JSON.stringify(body), headers)
    const headers: IFieldMap = options?.headers ?? {}

    // only post can have a body
    const body = JSON.stringify(options?.body ?? {})

    const credentials: RequestCredentials = options?.withCredentials
      ? 'include'
      : 'same-origin'

    //console.log('body', body, credentials)

    return fetch(url, {
      method: 'POST',
      headers: headers as HeadersInit,
      body,
      credentials,
    })
  }

  async getJson<T = unknown>(
    url: string,
    options: IFetchOptions = {}
  ): Promise<T> {
    //devlog(url, body, headers)

    const response = await this.get(url, {
      ...options,
      headers: { ...options.headers, ...JSON_HEADERS },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const ret = await response.json()

    return ret
  }

  async postJson<T = unknown>(
    url: string,
    options: IFetchOptions = {}
  ): Promise<T> {
    //devlog(url, body, headers)

    const response = await this.post(url, {
      ...options,
      headers: { ...options.headers, ...JSON_HEADERS },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`)
    }

    const ret = await response.json()

    return ret
  }

  async delete(url: string, options: IFetchOptions = {}): Promise<Response> {
    const headers: IFieldMap = options?.headers ?? {}

    const credentials: RequestCredentials = options?.withCredentials
      ? 'include'
      : 'same-origin'

    return fetch(url, {
      method: 'DELETE',
      headers: headers as HeadersInit,
      credentials,
    })
  }
}

class AxiosRequest implements IHttpRequest {
  async get(url: string, options: IFetchOptions = {}): Promise<Response> {
    //console.log(url, JSON.stringify(body), headers)
    return axios.get(url, {
      headers: (options?.headers as RawAxiosRequestHeaders) ?? {},
      withCredentials: options?.withCredentials ?? false,
    })
  }

  post(url: string, options: IFetchOptions = {}): Promise<Response> {
    return axios.post(url, options?.body ?? {}, {
      headers: (options?.headers as RawAxiosRequestHeaders) ?? {},
      withCredentials: options.withCredentials ?? false,
    })
  }

  async getJson<T>(url: string, options: IFetchOptions): Promise<T> {
    const res = await axios.get(url, {
      headers: (options?.headers as RawAxiosRequestHeaders) ?? {},
      withCredentials: options?.withCredentials ?? false,
    })

    return res.data as T
  }

  async postJson<T>(url: string, options: IFetchOptions): Promise<T> {
    const res = await axios.post(url, options?.body ?? {}, {
      headers: (options?.headers as RawAxiosRequestHeaders) ?? {},
      withCredentials: options.withCredentials ?? false,
    })

    return res.data as T
  }

  async delete(url: string, options: IFetchOptions = {}): Promise<Response> {
    //console.log(url, JSON.stringify(body), headers)
    return axios.delete(url, {
      headers: (options?.headers as RawAxiosRequestHeaders) ?? {},
      withCredentials: options?.withCredentials ?? false,
    })
  }
}

// keep them as singletons as no need to keep recreating them
const axiosInstance = new AxiosRequest()
const fetchInstance = new FetchRequest()

/**
 * Provides a standardized way of getting http requests that can use either
 * axios or fetch as a backend.
 */
class HttpFetch implements IHttpRequest {
  private _backend: FetchRequest | AxiosRequest

  constructor() {
    this._backend = fetchInstance
  }

  setBackend(method: 'axios' | 'fetch' = 'fetch'): HttpFetch {
    this._backend = method === 'axios' ? axiosInstance : fetchInstance

    return this
  }

  get(url: string, options: IFetchOptions = {}): Promise<Response> {
    return this._backend.get(url, options)
  }

  post(url: string, options: IFetchOptions = {}): Promise<Response> {
    return this._backend.post(url, options)
  }

  getJson<T = unknown>(url: string, options: IFetchOptions = {}): Promise<T> {
    return this._backend.getJson(url, options)
  }

  postJson<T = unknown>(url: string, options: IFetchOptions = {}): Promise<T> {
    return this._backend.postJson<T>(url, options)
  }

  delete(url: string, options: IFetchOptions = {}): Promise<Response> {
    return this._backend.delete(url, options)
  }
}

// Create a singleton instance
const httpFetchInstance = new HttpFetch()

export function setHttpBackend(backend: HttpBackend) {
  httpFetchInstance.setBackend(backend)
}

export const httpFetch = httpFetchInstance
