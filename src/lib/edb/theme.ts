import { config } from '@/config'
import type { IStringMap } from '@/interfaces/string-map'
import { useEffect, useState } from 'react'

export const THEME_KEY = `${config.appId}:theme:v4`

export const THEME_CYCLE: IStringMap = {
  system: 'light',
  light: 'dark',
  dark: 'automatic',
}

export type Theme = 'light' | 'dark' | 'automatic'
export const DEFAULT_THEME: Theme = 'automatic'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(THEME_KEY) as Theme) ?? DEFAULT_THEME
    }
    return DEFAULT_THEME
  })

  useEffect(() => {
    function apply(theme: Theme) {
      const isDark =
        theme === 'dark' ||
        (theme === 'automatic' &&
          window.matchMedia('(prefers-color-scheme: dark)').matches)

      document.documentElement.classList.toggle('dark', isDark)
    }

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

  return {
    theme,
    setTheme,
    resetTheme,
  }
}
