'use client'

import { config } from '@/config'
import { IChildrenProps } from '@/interfaces/children-props'
import type { IStringMap } from '@/interfaces/string-map'
import { createContext, useContext, useEffect, useState } from 'react'

export const THEME_KEY = `${config.appId}:theme:v4`

export const THEME_CYCLE: IStringMap = {
  system: 'light',
  light: 'dark',
  dark: 'automatic',
}

export type Theme = 'light' | 'dark' | 'automatic'
export const DEFAULT_THEME: Theme = 'automatic'

// export function useTheme() {
//   const [theme, setTheme] = useState<Theme>(() => {
//     if (typeof window !== 'undefined') {
//       return (localStorage.getItem(THEME_KEY) as Theme) ?? DEFAULT_THEME
//     }
//     return DEFAULT_THEME
//   })

//   useEffect(() => {
//     function apply(theme: Theme) {
//       const isDark =
//         theme === 'dark' ||
//         (theme === 'automatic' &&
//           window.matchMedia('(prefers-color-scheme: dark)').matches)

//       document.documentElement.classList.toggle('dark', isDark)
//     }

//     apply(theme)
//     localStorage.setItem(THEME_KEY, theme)

//     const media = window.matchMedia('(prefers-color-scheme: dark)')

//     const handler = () => {
//       apply(theme)
//     }

//     media.addEventListener('change', handler)
//     return () => media.removeEventListener('change', handler)
//   }, [theme])

//   function resetTheme() {
//     setTheme(DEFAULT_THEME)
//   }

//   return {
//     theme,
//     setTheme,
//     resetTheme,
//   }
// }

interface IThemeContext {
  theme: Theme
  setTheme: (theme: Theme) => void
  resetTheme: () => void
}

const ThemeContext = createContext<IThemeContext | null>(null)

export function ThemeProvider({ children }: IChildrenProps) {
  const [theme, setTheme] = useState<Theme>('automatic')

  function apply(theme: Theme) {
    const isDark =
      theme === 'dark' ||
      (theme === 'automatic' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.classList.toggle('dark', isDark)
  }

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null

    if (stored) {
      setTheme(stored)

      return
    }

    const prefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)'
    ).matches

    const initialTheme = prefersDark ? 'dark' : 'automatic'

    setTheme(initialTheme)
  }, [])

  useEffect(() => {
    apply(theme)
    localStorage.setItem(THEME_KEY, theme)

    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = () => {
      apply(theme)
    }

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  function resetTheme() {
    setTheme(DEFAULT_THEME)
  }

  // const setTheme = (newTheme: Theme) => {
  //   setThemeState(newTheme)

  //   localStorage.setItem('theme', newTheme)

  //   document.documentElement.classList.toggle(
  //     'dark',
  //     newTheme === 'dark'
  //   )
  // }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)

  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider')
  }

  return ctx
}
