import { IChildrenProps } from '@/interfaces/children-props'
import { createContext, useCallback, useContext, useState } from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { config } from '../../config'
import type { IAppInfo } from '../../lib/app-info'
import type { IBasicEdbUser } from './edb'
import { useTheme } from './theme'

const SETTINGS_KEY = `${config.appId}:settings:v42`

export type ToolbarStyle = 'classic' | 'single'

export const MAX_CUSTOM_COLORS = 10

export const TOOLBAR_STYLE_MAP: Record<ToolbarStyle, string> = {
  classic: 'Classic',
  single: 'Single Line',
}

export interface IEdbSettings {
  users: IBasicEdbUser[]
  passwordless: boolean
  staySignedIn: boolean
  toolbars: {
    ribbon: { style: ToolbarStyle }
    groups: { labels: { mode: 'auto' | 'show' | 'hide' } }
  }
  apps: { links: { openInNewWindow: boolean }; useAccentColors: boolean }
  sidebar: { show: boolean }
  history: {
    sidebar: {
      show: boolean
    }
  }
  save: {
    filetypes: {
      txt: {
        delimiter: 'tab' | 'comma'
        name: string
      }
    }
    table: {
      hasHeader: boolean
      hasIndex: boolean
    }
  }
  genomic: {
    assembly: string
  }
  colors: {
    custom: string[]
  }
}

export const DEFAULT_EDB_SETTINGS: IEdbSettings = {
  passwordless: true,
  staySignedIn: true,
  // instead of using null, use an empty list to indicate nothing is cached
  users: [],
  toolbars: {
    groups: {
      labels: {
        mode: 'auto',
      },
    },
    ribbon: {
      style: 'single',
    },
  },
  apps: {
    links: {
      openInNewWindow: false,
    },
    useAccentColors: true,
  },
  sidebar: { show: true },
  history: {
    sidebar: {
      show: false,
    },
  },
  save: {
    filetypes: {
      txt: {
        delimiter: 'tab',
        name: 'data',
      },
    },
    table: {
      hasHeader: true,
      hasIndex: true,
    },
  },
  genomic: {
    assembly: 'grch37',
  },
  colors: { custom: [] },
}

export interface IEdbSettingsStore extends IEdbSettings {
  updateSettings: (settings: Partial<IEdbSettings>) => void
}

export const useEdbSettingsStore = create<IEdbSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_EDB_SETTINGS,
      updateSettings: (settings: Partial<IEdbSettings>) => {
        set({
          ...settings,
        })
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useEdbSettings(): {
  settings: IEdbSettings
  updateSettings: (settings: Partial<IEdbSettings>) => void
  resetSettings: () => void
  addCustomColor: (color: string) => void
  toggleHistorySidebar: () => void
  historySidebarOpen: (open: boolean) => void
} {
  const settings = useEdbSettingsStore((state) => state)
  const updateSettings = useEdbSettingsStore((state) => state.updateSettings)
  const { resetTheme } = useTheme()

  function resetSettings() {
    updateSettings({ ...DEFAULT_EDB_SETTINGS })
    resetTheme()
  }

  function toggleHistorySidebar() {
    historySidebarOpen(!settings.history.sidebar.show)
  }

  /**
   * Add a custom color to the list of custom colors in the settings.
   * If the color already exists, it won't be added again.
   * If the list exceeds the maximum allowed custom colors,
   * the oldest color will be removed.
   *
   * @param color - The color to be added in hex format (e.g., '#FF5733').
   */
  function addCustomColor(color: string) {
    const newColors = [...settings.colors.custom]
    if (!newColors.includes(color)) {
      newColors.push(color)
      if (newColors.length > MAX_CUSTOM_COLORS) {
        newColors.shift()
      }

      updateSettings({
        colors: {
          ...settings.colors,
          custom: newColors,
        },
      })
    }
  }

  function historySidebarOpen(open: boolean) {
    updateSettings({
      history: {
        sidebar: {
          show: open,
        },
      },
    })
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    addCustomColor,
    toggleHistorySidebar,
    historySidebarOpen,
  }
}

export interface IAppInfoStore {
  appInfo: IAppInfo | undefined
  setAppInfo: (app: IAppInfo) => void
}

// export const useAppInfoStore = create<IAppInfoStore>()((set) => ({
//   appInfo: undefined,

//   setAppInfo: (appInfo: IAppInfo) => {
//     set({
//       appInfo,
//     })
//   },
// }))

/**
 * Set the app globally so that it can be used to
 * render accent colors based on the app.
 *
 * @returns
 */
// export function useAppInfo(): {
//   appInfo: IAppInfo | undefined
//   setAppInfo: (
//     appInfo: IAppInfo,
//     opts?: { updateAccentColor?: boolean }
//   ) => void
// } {
//   const { settings } = useEdbSettings()
//   const appInfo = useAppInfoStore((state) => state.appInfo)

//   const setAppInfo = useAppInfoStore((state) => state.setAppInfo)

//   function _setAppInfo(
//     appInfo: IAppInfo,
//     opts: { updateAccentColor?: boolean } = {}
//   ) {
//     const { updateAccentColor = true } = opts
//     if (appInfo.color && updateAccentColor && settings.apps.useAccentColors) {
//       // 1. Grab the root HTML element
//       const root = document.documentElement
//       root.style.setProperty('--edb-app-theme', appInfo.color)
//     }
//     setAppInfo(appInfo)
//   }

//   return {
//     appInfo,
//     setAppInfo: _setAppInfo,
//   }
// }

const AppInfoContext = createContext<IAppInfoStore | undefined>(undefined)

export function useAppInfo() {
  const ctx = useContext(AppInfoContext)
  if (!ctx) {
    throw new Error('useAppInfo must be used within an AppInfoProvider')
  }

  return ctx
}

export function AppInfoProvider({ children }: IChildrenProps) {
  const [appInfo, setAppInfo] = useState<IAppInfo | undefined>(undefined)

  const { settings } = useEdbSettings()

  const _setAppInfo = useCallback(
    (appInfo: IAppInfo, opts: { updateAccentColor?: boolean } = {}) => {
      const { updateAccentColor = true } = opts
      const root = document.documentElement

      if (appInfo.color && updateAccentColor && settings.apps.useAccentColors) {
        // Set the CSS variable for the app theme color
        root.style.setProperty('--edb-app-theme', appInfo.color)
      } else {
        // reset to default theme color if no app color is provided
        // or accent colors are disabled
        root.style.setProperty('--edb-app-theme', 'var(--edb-theme)')
      }

      setAppInfo(appInfo)
    },
    [settings.apps.useAccentColors, setAppInfo]
  )

  return (
    <AppInfoContext.Provider value={{ appInfo, setAppInfo: _setAppInfo }}>
      {children}
    </AppInfoContext.Provider>
  )
}

//   const [appInfo, setAppInfo] = useState<IAppInfo | undefined>(undefined)

//   return (
//     <AppInfoContext.Provider value={{  appInfo, setAppInfo  }}>
//       {children}
//     </AppInfoContext.Provider>
//   )
// }
