'use client'

import { IChildrenProps } from '@/interfaces/children-props'
import { createContext, useContext, useEffect, useState } from 'react'
import { httpFetch } from '../http/http-fetch'
import { SESSION_REFRESH_CSRF_TOKEN_URL } from './edb'

const KEY = 'edb:csrf-token:v2'

const CsrfContext = createContext<string | null>(null)

export function CsrfProvider({ children }: IChildrenProps) {
  const [csrfToken, setCsrfToken] = useState<string | null>(null)

  useEffect(() => {
    const savedToken = sessionStorage.getItem(KEY)

    if (savedToken) {
      setCsrfToken(savedToken)
    } else {
      async function fetchCsrfToken() {
        try {
          const res = await httpFetch.getJson<{ data: { csrfToken: string } }>(
            SESSION_REFRESH_CSRF_TOKEN_URL,
            { withCredentials: true }
          )

          const token = res.data.csrfToken

          setCsrfToken(token)
          sessionStorage.setItem(KEY, token)
        } catch (e) {
          console.error('Failed to fetch CSRF token', e)
        }
      }

      fetchCsrfToken()
    }
  }, [])

  return (
    <CsrfContext.Provider value={csrfToken}>{children}</CsrfContext.Provider>
  )
}

export function useCsrfToken() {
  return useContext(CsrfContext)
}
