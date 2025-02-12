import { APP_ID } from '@/consts'
import type { IBasicEdbUser } from '@/lib/edb/edb'
import type { IStringMap } from '@interfaces/string-map'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'

export const THEME_KEY = `${APP_ID}-theme-v2`
const SETTINGS_KEY = `${APP_ID}-settings-v5`

export const THEME_CYCLE: IStringMap = {
  system: 'light',
  light: 'dark',
  dark: 'automatic',
}

export type Theme = 'light' | 'dark' | 'automatic'
export const DEFAULT_THEME: Theme = 'automatic'

export interface IEdbSettings {
  users: IBasicEdbUser[]
  passwordless: boolean
  staySignedIn: boolean
  toolbars: { groups: { labels: { show: boolean } } }
}

export const DEFAULT_EDB_SETTINGS: IEdbSettings = {
  passwordless: true,
  staySignedIn: true,
  // instead of using null, use an empty list to indicate nothing is cached
  users: [],
  toolbars: {
    groups: {
      labels: {
        show: true,
      },
    },
  },
}

const localThemeStore = persistentAtom<Theme>(THEME_KEY, DEFAULT_THEME)

const localSettingsStore = persistentAtom<IEdbSettings>(
  SETTINGS_KEY,
  {
    ...DEFAULT_EDB_SETTINGS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useEdbSettingsStore(): {
  settings: IEdbSettings
  theme: Theme
  updateSettings: (settings: IEdbSettings) => void
  resetSettings: () => void
  applyTheme: (theme: Theme) => void
  resetTheme: () => void
} {
  const settings = useStore(localSettingsStore)
  const theme = useStore(localThemeStore)

  function updateSettings(settings: IEdbSettings) {
    localSettingsStore.set(settings)
  }

  function resetSettings() {
    updateSettings({ ...DEFAULT_EDB_SETTINGS })
  }

  function resetTheme() {
    applyTheme(DEFAULT_THEME)
  }

  function applyTheme(theme: Theme) {
    if (
      theme === 'dark' ||
      (theme === 'automatic' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    localThemeStore.set(theme)
  }

  return {
    settings,
    theme,
    updateSettings,
    resetSettings,
    applyTheme,
    resetTheme,
  }
}
