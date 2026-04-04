import type { RawAxiosRequestHeaders } from 'axios'
import axios from 'axios'
import type { IFetchOptions, IHttpRequest } from './request'

class AxiosRequest implements IHttpRequest {
  post(url: string, options: IFetchOptions = {}): Promise<Response> {
    return axios.post(url, options?.body, {
      headers: (options?.headers as RawAxiosRequestHeaders) ?? {},
      withCredentials: options.withCredentials ?? false,
    })
  }

  async postJson<T>(url: string, options: IFetchOptions): Promise<T> {
    const res = await axios.post(url, options?.body, {
      headers: (options?.headers as RawAxiosRequestHeaders) ?? {},
      withCredentials: options.withCredentials ?? false,
    })

    return res.data as T
  }

  async getText(url: string, options: IFetchOptions): Promise<string> {
    const res = await axios.get(url, {
      headers: (options?.headers as RawAxiosRequestHeaders) ?? {},
      withCredentials: options?.withCredentials ?? false,
    })

    return res.data as string
  }

  async getJson<T>(url: string, options: IFetchOptions): Promise<T> {
    const res = await axios.get(url, {
      headers: (options?.headers as RawAxiosRequestHeaders) ?? {},
      withCredentials: options?.withCredentials ?? false,
    })

    return res.data as T
  }

  async get(url: string, options: IFetchOptions = {}): Promise<Response> {
    //console.log(url, JSON.stringify(body), headers)
    return axios.get(url, {
      headers: (options?.headers as RawAxiosRequestHeaders) ?? {},
      withCredentials: options?.withCredentials ?? false,
    })
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
export const axiosInstance = new AxiosRequest()
