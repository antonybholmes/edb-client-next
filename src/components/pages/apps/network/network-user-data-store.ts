import { config } from '@/config'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:network:user-data:v6`

interface IUserDataGroups {
  colors: Record<string, string>
}

interface IUserDataLabels {
  ids: string[]
  mode: 'partial' | 'exact'
}

export interface IUserDataSettings {
  groups: IUserDataGroups
  labels: IUserDataLabels
}

const DEFAULT_SETTINGS: IUserDataSettings = {
  groups: {
    colors: {},
  },
  labels: { ids: [], mode: 'partial' },
}

export interface IUserDataStore extends IUserDataSettings {
  updateSettings: (settings: IUserDataSettings) => void
  updateGroups: (settings: IUserDataGroups) => void
  updateLabels: (settings: IUserDataLabels) => void
}

export const useNetworkSettingsStore = create<IUserDataStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (settings: IUserDataSettings) => {
        set({
          ...settings,
        })
      },

      updateGroups: (settings: IUserDataGroups) => {
        set({
          groups: settings,
        })
      },
      updateLabels: (settings: IUserDataLabels) => {
        set({
          labels: settings,
        })
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useUserData(): {
  settings: IUserDataStore
  updateSettings: (settings: IUserDataSettings) => void
} {
  const settings = useNetworkSettingsStore((state) => state)

  const updateSettings = useNetworkSettingsStore(
    (state) => state.updateSettings
  )

  return {
    settings,
    updateSettings,
  }
}
