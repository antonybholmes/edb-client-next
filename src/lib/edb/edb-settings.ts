import { config } from '@/config'
import type { IBasicEdbUser } from '@/lib/edb/edb'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useTheme } from './theme'

const SETTINGS_KEY = `${config.appId}:settings:v22`

export type ToolbarStyle = 'classic' | 'single'

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
    groups: { labels: { show: boolean } }
  }
  modules: { links: { openInNewWindow: boolean } }
  sidebar: { show: boolean }
  history: {
    sidebar: {
      show: boolean
    }
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
        show: true,
      },
    },
    ribbon: {
      style: 'single',
    },
  },
  modules: {
    links: {
      openInNewWindow: false,
    },
  },
  sidebar: { show: true },
  history: {
    sidebar: {
      show: false,
    },
  },
}

export interface IEdbSettingsStore extends IEdbSettings {
  updateSettings: (settings: Partial<IEdbSettings>) => void
}

export const useEdbSettingsStore = create<IEdbSettingsStore>()(
  persist(
    set => ({
      ...DEFAULT_EDB_SETTINGS,
      updateSettings: (settings: Partial<IEdbSettings>) => {
        console.log('Updating EDB settings', settings)

        set(state => ({
          ...state,
          ...settings,
        }))
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
  toggleHistorySidebar: () => void
  historySidebarOpen: (open: boolean) => void
} {
  const settings = useEdbSettingsStore(state => state)
  const updateSettings = useEdbSettingsStore(state => state.updateSettings)
  const { resetTheme } = useTheme()

  function resetSettings() {
    updateSettings({ ...DEFAULT_EDB_SETTINGS })
    resetTheme()
  }

  function toggleHistorySidebar() {
    historySidebarOpen(!settings.history.sidebar.show)
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
    toggleHistorySidebar,
    historySidebarOpen,
  }
}
