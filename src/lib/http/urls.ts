import { type IFieldMap } from '@interfaces/field-map'
import { type IStringMap } from '@interfaces/string-map'
import type { UndefNullStr } from '../text/text'

export const PATH_SEP = '/'

export const REDIRECT_DELAY_MS = 2000

export const MIME_JSON = 'application/json'

export const HEADER_X_CSRF_TOKEN = 'X-CSRF-Token'

export const JSON_HEADERS = {
  Accept: MIME_JSON,
  'Content-Type': MIME_JSON,
}

export function bearerToken(token: UndefNullStr): string {
  return `Bearer ${token}`
}

export function bearerHeaders(jwt: UndefNullStr): IStringMap {
  return {
    ...JSON_HEADERS,
    Authorization: bearerToken(jwt),
  }
}

export function csfrHeaders(csrfToken: string): IStringMap {
  // if (!csrfToken) {
  //   csrfToken = Cookies.get(HEADER_X_CSRF_TOKEN) ?? ''
  // }

  return {
    ...JSON_HEADERS,
    [HEADER_X_CSRF_TOKEN]: csrfToken,
  }
}

export function csfrWithTokenHeaders(
  csrfToken: string,
  jwt: UndefNullStr
): IStringMap {
  // if (!csrfToken) {
  //   csrfToken = Cookies.get(HEADER_X_CSRF_TOKEN) ?? ''
  // }

  return {
    ...JSON_HEADERS,
    [HEADER_X_CSRF_TOKEN]: csrfToken,
    Authorization: bearerToken(jwt),
  }
}

export function getUrlFriendlyTag(tag: string): string {
  return tag
    .trim()
    .toLowerCase()
    .replaceAll('&', 'and')
    .replaceAll(/[\ \-\_]+/g, '-')
}

export function getUrlFriendlyImg(
  img: string,
  ext = 'avif',
  size: number | [number, number] = 800
): string {
  if (!Array.isArray(size)) {
    size = [size, size]
  }

  return `${getUrlFriendlyTag(img)}-${size[0]}x${size[1]}.${ext}`
}

export function getUrlFriendlyTags(tags: string[]): string[] {
  return tags.map(tag => getUrlFriendlyTag(tag))
}

export function getSlug(path: string): string {
  return path
    .replace(/\.md$/, '')
    .replaceAll('\\', PATH_SEP)
    .split(PATH_SEP)
    .map(p => getUrlFriendlyTag(p))
    .join(PATH_SEP)
}

export function getSlugDir(path: string): string {
  // remove last entry to get the dir part of the name
  return getSlug(path).split(PATH_SEP).slice(0, -1).join(PATH_SEP)
}

export function getCanonicalSlug(path: string): string {
  return getSlug(path).replace(/^.+\//, '')
}

export function getDateFromSlug(slug: string): string {
  const match = slug.match(/(\d{4})-(\d{2})-(\d{2})/)
  return match ? match.slice(1, 4).join('-') : '2022-01-01'
}

export function makeGetUrl(
  baseUrl: string,
  params: IFieldMap | IFieldMap[] = []
): string {
  if (!Array.isArray(params)) {
    params = [params]
  }

  if (params.length > 0) {
    return encodeURI(
      `${baseUrl}?${params
        .map((po: IFieldMap) => Object.entries(po).map(p => `${p[0]}=${p[1]}`))
        .flat()
        .join('&')}`
    )
  } else {
    return encodeURI(baseUrl)
  }
}

// export function baseFetch(
//   url: string,

//   options: IFetchOptions = {}
// ): Promise<Response> {
//   //console.log(url, JSON.stringify(body), headers)

//   const method: RequestType = options?.method ?? 'GET'
//   const headers: IFieldMap = options?.headers ?? {}

//   // only post can have a body
//   const body: string | null =
//     method === 'POST' ? JSON.stringify(options?.body ?? {}) : null

//   const credentials: RequestCredentials = options?.credentials ?? 'same-origin'

//   return fetch(url, {
//     method,
//     headers,
//     body,
//     credentials,
//   })
// }

// export async function fetchJson(
//   url: string,
//   options: IFetchOptions = {}
// ): Promise<any> {
//   //devlog(url, body, headers)

//   const response = await baseFetch(url, {
//     ...options,
//     headers: { ...options.headers, ...JSON_HEADERS },
//   })

//   const ret = await response.json()

//   return ret
// }

// export function postFetch(
//   url: string,
//   options: IFetchOptions = {}
// ): Promise<Response> {
//   //console.log(url, JSON.stringify(body), headers)

//   return baseFetch(url, { method: 'POST' as RequestType, ...options })
// }

// export async function postFetchJson(
//   url: string,
//   options: IFetchOptions = {}
// ): Promise<any> {
//   return fetchJson(url, { method: 'POST' as RequestType, ...options })
// }

// export async function fetchPostJsonQueryStatus(
//   url: string,
//   options: IFetchOptions = {}
// ): Promise<IQueryStatus> {
//   const json = await postFetchJson(url, options)

//   return {
//     message: json?.message ?? '',
//     status: json?.status ?? STATUS_FAIL,
//   }
// }

// export async function fetchPostJsonStatus(
//   url: string,
//   options: IFetchOptions = {}
// ): Promise<boolean> {
//   const status = await fetchPostJsonQueryStatus(url, options)

//   return status.status === STATUS_SUCCESS
// }

// export async function fetchJsonData(
//   url: string,
//   options: IFetchOptions = {}
// ): Promise<any | null | undefined> {
//   const json = await fetchJson(url, options)
//   return json?.data
// }

// /**
//  * Fetch url as json assuming content is called data.
//  *
//  * @param url
//  * @param options
//  * @returns
//  */
// export async function postFetchJsonData(
//   url: string,
//   options: IFetchOptions = {}
// ): Promise<any | null | undefined> {
//   return fetchJsonData(url, { method: 'POST' as RequestType, ...options })
// }

// export async function fetchPostJsonArray(
//   url: string,
//   options: IFetchOptions = {}
// ): Promise<any[]> {
//   const json = await postFetchJsonData(url, options)

//   return json?.items ?? []
// }

// export async function fetchPostBlob(
//   url: string,
//   options: IFetchOptions = {}
// ): Promise<Blob | null> {
//   try {
//     //devlog(url, body, headers)
//     const response = await postFetch(url, options)
//     return response.blob()
//   } catch (error) {
//     console.error(error)
//   }

//   return null
// }

// export async function fetchPostBuffer(
//   url: string,
//   options: IFetchOptions = {}
// ): Promise<ArrayBuffer | null> {
//   try {
//     //devlog(url, body, headers)
//     const response = await postFetch(url, options)
//     return response.arrayBuffer()
//   } catch (error) {
//     console.error(error)
//   }

//   return null
// }

// export async function fetchPostJsonArrayQuery(
//   url: string,
//   body: IFieldMap,
//   headers: IFieldMap,
// ): Promise<ISearchResults> {
//   const json = await fetchPostJson(url, body, headers)

//   if (json.statusCode === STATUS_CODE_OK) {
//     return json.data
//   } else {
//     return { totalItems: 0, fields: [], items: [] }
//   }
// }

// export function fetchPostForm(url: string, body: FormData): Promise<Response> {
//   return fetch(url, {
//     body,
//     method: 'post',
//   })
// }

// export async function fetchPostFormJson(
//   url: string,
//   body: FormData
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
// ): Promise<any> {
//   try {
//     const response = await fetchPostForm(url, body)

//     return response.json()
//   } catch (error) {
//     console.error(error)
//   }

//   return null
// }

/**
 * Force window url to change without using a router or other framework.
 *
 * @param url url to visit
 */
export function redirect(url: string, delay: number = REDIRECT_DELAY_MS) {
  if (typeof window !== 'undefined') {
    setTimeout(function () {
      window.location.href = url // .assign(url)
    }, delay)
  }
}
