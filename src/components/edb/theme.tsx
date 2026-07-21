'use client'

import { config } from '@/config'
import { IChildrenProps } from '@/interfaces/children-props'
import { createContext, useContext, useEffect, useState } from 'react'

export const THEME_KEY = `${config.appId}:theme:v4`

// export const THEME_CYCLE: IStringMap = {
//   system: 'light',
//   light: 'dark',
//   dark: 'automatic',
// }

export type Theme = 'light' | 'dark' | 'automatic'
export const DEFAULT_THEME: Theme = 'automatic'

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
        window &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.dataset.theme = theme
    document.documentElement.classList.toggle('dark', isDark)
  }

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY) as Theme | null

    setTheme(stored ?? DEFAULT_THEME)
  }, [])

  useEffect(() => {
    apply(theme)
    localStorage.setItem(THEME_KEY, theme)

    const media = window.matchMedia('(prefers-color-scheme: dark)')

    if (theme !== 'automatic') {
      return
    }

    // if automatic, listen for system theme changes

    const handler = () => {
      apply(theme)
    }

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [theme])

  function resetTheme() {
    localStorage.removeItem(THEME_KEY)
    setTheme(DEFAULT_THEME)
  }

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
