// web workers cannot use @
import type { IFieldMap } from '../../interfaces/field-map'
import { fetchInstance, type IFetchOptions, type IHttpRequest } from './request'

export type RequestType = 'GET' | 'POST'

export type IFetchBody = IFieldMap | FormData

/**
 * Provides a standardized way of getting http requests that can use either
 * axios or fetch as a backend.
 */
class HttpFetch implements IHttpRequest {
  private _backend: IHttpRequest

  constructor() {
    this._backend = fetchInstance
  }

  setBackend(backend: IHttpRequest): HttpFetch {
    this._backend = backend

    return this
  }

  get(url: string, options: IFetchOptions = {}): Promise<Response> {
    return this._backend.get(url, options)
  }

  post(url: string, options: IFetchOptions = {}): Promise<Response> {
    return this._backend.post(url, options)
  }

  getText(url: string, options: IFetchOptions = {}): Promise<string> {
    return this._backend.getText(url, options)
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

export const httpFetch = new HttpFetch()
