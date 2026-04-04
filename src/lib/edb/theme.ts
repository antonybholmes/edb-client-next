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

export function useTheme(): {
  theme: Theme

  setTheme: (theme: Theme) => void
  resetTheme: () => void
} {
  // const [theme, setTheme] = useState<Theme>(() => {
  //   return (localStorage.getItem(THEME_KEY) as Theme) ?? DEFAULT_THEME
  // })

  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME)

  useEffect(() => {
    const isDark =
      theme === 'dark' ||
      (theme === 'automatic' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    document.documentElement.classList.toggle('dark', isDark)

    localStorage.setItem(THEME_KEY, theme)

    // const media = window.matchMedia('(prefers-color-scheme: dark)')

    // if (theme === 'automatic') {
    //   media.addEventListener('change', applyTheme)
    // }

    // return () => media.removeEventListener('change', applyTheme)
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
