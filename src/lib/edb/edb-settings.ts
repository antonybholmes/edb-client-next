import { APP_ID } from '@/consts'
import type { IStringMap } from '@interfaces/string-map'
import type { IBasicEdbUser } from '@lib/edb/edb'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

//export const THEME_KEY = `${APP_ID}:theme:v3`
const SETTINGS_KEY = `${APP_ID}:settings:v12`

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
  theme: Theme
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
      openInNewWindow: false,
    },
  },
  //csrfToken: '',
  theme: DEFAULT_THEME,
}

// const themeAtom = persistentAtom<Theme>(THEME_KEY, DEFAULT_THEME)

// const settingsAtom = persistentAtom<IEdbSettings>(
//   SETTINGS_KEY,
//   {
//     ...DEFAULT_EDB_SETTINGS,
//   },
//   {
//     encode: JSON.stringify,
//     decode: JSON.parse,
//   }
// )

// function updateSettings(settings: IEdbSettings) {
//   console.log('Updating EDB settings', settings)
//   settingsAtom.set(settings)
// }

/* function applyTheme(theme: Theme) {
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
} */

export interface IEdbSettingsStore extends IEdbSettings {
  updateSettings: (settings: IEdbSettings) => void
  //applyTheme: (theme: Theme) => void
}

export const useEdbSettingsStore = create<IEdbSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_EDB_SETTINGS,
      updateSettings: (settings: IEdbSettings) => {
        console.log('Updating EDB settings', settings)

        if (
          settings.theme === 'dark' ||
          (settings.theme === 'automatic' &&
            window.matchMedia('(prefers-color-scheme: dark)').matches)
        ) {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }

        set((state) => ({
          ...state,
          ...settings,
        }))
      },
      // applyTheme: (theme: Theme) => {
      //   if (
      //     theme === 'dark' ||
      //     (theme === 'automatic' &&
      //       window.matchMedia('(prefers-color-scheme: dark)').matches)
      //   ) {
      //     document.documentElement.classList.add('dark')
      //   } else {
      //     document.documentElement.classList.remove('dark')
      //   }

      //   set((state) => ({
      //     ...state,
      //     theme,
      //   }))
      // },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useEdbSettings(): {
  settings: IEdbSettings
  theme: Theme
  updateSettings: (settings: IEdbSettings) => void
  resetSettings: () => void
  applyTheme: (theme: Theme) => void
  resetTheme: () => void
} {
  const settings = useEdbSettingsStore((state) => state)
  const updateSettings = useEdbSettingsStore((state) => state.updateSettings)
  //const applyTheme = useEdbSettingsStore((state) => state.applyTheme)

  function resetSettings() {
    updateSettings({ ...DEFAULT_EDB_SETTINGS })
    resetTheme()
  }

  function resetTheme() {
    updateSettings({ ...settings, theme: DEFAULT_THEME })
  }

  function applyTheme(theme: Theme) {
    updateSettings({ ...settings, theme })
  }

  return {
    settings,
    theme: settings.theme,
    updateSettings,
    resetSettings,
    applyTheme,
    resetTheme,
  }
}
