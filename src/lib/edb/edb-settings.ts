import { APP_ID } from '@/consts'
import type { IStringMap } from '@interfaces/string-map'
import type { IBasicEdbUser } from '@lib/edb/edb'
import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'

export const THEME_KEY = `${APP_ID}:theme:v2`
const SETTINGS_KEY = `${APP_ID}:settings:v10`

export const THEME_CYCLE: IStringMap = {
  system: 'light',
  light: 'dark',
  dark: 'automatic',
}

export type Theme = 'light' | 'dark' | 'automatic'
export const DEFAULT_THEME: Theme = 'automatic'
export type ToolbarStyle = 'classic' | 'single'

export interface IEdbSettings {
  users: IBasicEdbUser[]
  passwordless: boolean
  staySignedIn: boolean
  toolbars: {
    ribbon: { style: ToolbarStyle }
    groups: { labels: { show: boolean } }
  }
  modules: { links: { openInNewWindow: boolean } }
  csrfToken: string // optional, used for CSRF protection
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
    ribbon: {
      style: 'classic',
    },
  },
  modules: {
    links: {
      openInNewWindow: true,
    },
  },
  csrfToken: '',
}

const themeAtom = persistentAtom<Theme>(THEME_KEY, DEFAULT_THEME)

const settingsAtom = persistentAtom<IEdbSettings>(
  SETTINGS_KEY,
  {
    ...DEFAULT_EDB_SETTINGS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

function updateSettings(settings: IEdbSettings) {
  console.log('Updating EDB settings', settings)
  settingsAtom.set(settings)
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

  themeAtom.set(theme)
}

export function useEdbSettings(): {
  settings: IEdbSettings
  theme: Theme
  updateSettings: (settings: IEdbSettings) => void
  resetSettings: () => void
  applyTheme: (theme: Theme) => void
  resetTheme: () => void
} {
  const settings = useStore(settingsAtom)
  const theme = useStore(themeAtom)

  return {
    settings,
    theme,
    updateSettings,
    resetSettings,
    applyTheme,
    resetTheme,
  }
}
