import { config } from '@/config'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:matcalc:sankey:v2`

export interface ISankeySettings {
  padding: number
  width: number
  height: number
  nodeWidth: number
}

const DEFAULT_SETTINGS: ISankeySettings = {
  padding: 10,
  width: 900,
  height: 500,
  nodeWidth: 20,
}

export interface ISankeySettingsStore extends ISankeySettings {
  updateSettings: (settings: ISankeySettings) => void
}

export const useSankeySettingsStore = create<ISankeySettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (settings: ISankeySettings) => {
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

export function useSankeySettings(): {
  settings: ISankeySettingsStore
  updateSettings: (settings: ISankeySettingsStore) => void
  resetSettings: () => void
} {
  const settings = useSankeySettingsStore((state) => state)
  const updateSettings = useSankeySettingsStore((state) => state.updateSettings)

  function resetSettings() {
    updateSettings({ ...DEFAULT_SETTINGS })
  }

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
