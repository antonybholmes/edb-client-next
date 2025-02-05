import type { IFieldMap } from '@/interfaces/field-map'
import axios from 'axios'
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(url: string, options: IFetchOptions): Promise<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post(url: string, options: IFetchOptions): Promise<any>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getJson(url: string, options: IFetchOptions): Promise<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postJson(url: string, options: IFetchOptions): Promise<any>

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete(url: string, options: IFetchOptions): Promise<any>
}

class FetchRequest implements IHttpRequest {
  async get(url: string, options: IFetchOptions = {}): Promise<Response> {
    //console.log(url, JSON.stringify(body), headers)

    const headers: IFieldMap = options?.headers ?? {}

    const credentials: RequestCredentials = options?.withCredentials
      ? 'include'
      : 'same-origin'

    return fetch(url, {
      method: 'GET',
      headers,

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
      headers,
      body,
      credentials,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getJson(url: string, options: IFetchOptions = {}): Promise<any> {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async postJson(url: string, options: IFetchOptions = {}): Promise<any> {
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async delete(url: string, options: IFetchOptions = {}): Promise<any> {
    const headers: IFieldMap = options?.headers ?? {}

    const credentials: RequestCredentials = options?.withCredentials
      ? 'include'
      : 'same-origin'

    return fetch(url, {
      method: 'DELETE',
      headers,
      credentials,
    })
  }
}

class AxiosRequest implements IHttpRequest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async get(url: string, options: IFetchOptions = {}): Promise<any> {
    //console.log(url, JSON.stringify(body), headers)
    return axios.get(url, {
      headers: options?.headers ?? {},
      withCredentials: options?.withCredentials ?? false,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post(url: string, options: IFetchOptions = {}): Promise<any> {
    return axios.post(url, options?.body ?? {}, {
      headers: options?.headers ?? {},
      withCredentials: options.withCredentials ?? false,
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getJson(url: string, options: IFetchOptions): Promise<any> {
    const res = await this.get(url, options)

    return res.data
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async postJson(url: string, options: IFetchOptions): Promise<any> {
    const res = await this.post(url, options)

    return res.data
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async delete(url: string, options: IFetchOptions = {}): Promise<any> {
    //console.log(url, JSON.stringify(body), headers)
    return axios.delete(url, {
      headers: options?.headers ?? {},
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(url: string, options: IFetchOptions = {}): Promise<any> {
    return this._backend.get(url, options)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  post(url: string, options: IFetchOptions = {}): Promise<any> {
    return this._backend.post(url, options)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getJson(url: string, options: IFetchOptions = {}): Promise<any> {
    return this._backend.getJson(url, options)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  postJson(url: string, options: IFetchOptions = {}): Promise<any> {
    return this._backend.postJson(url, options)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete(url: string, options: IFetchOptions = {}): Promise<any> {
    return this._backend.delete(url, options)
  }
}

// Create a singleton instance
const httpFetchInstance = new HttpFetch()

export function setHttpBackend(backend: HttpBackend) {
  httpFetchInstance.setBackend(backend)
}

export const httpFetch = httpFetchInstance
