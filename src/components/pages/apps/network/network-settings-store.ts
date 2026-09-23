import { IMarginProps } from '@/components/plot/svg-props'
import { config } from '@/config'
import { useCallback } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:network:v2`

const MARGIN = { top: 20, right: 200, bottom: 10, left: 10 }

const PLOT_MARGIN = { top: 20, right: 10, bottom: 100, left: 400 }

export interface INetworkSettings {
  chargeStrength: number
  linkDistance: number
  sim: { run: boolean }
  plot: {
    margin: IMarginProps
    nodes: {
      scale: number
      color: {
        mode: 'group'
      }
    }
    edges: {
      scale: number
    }
  }
}

const DEFAULT_SETTINGS: INetworkSettings = {
  chargeStrength: -30,
  linkDistance: 100,
  plot: {
    margin: { ...PLOT_MARGIN },
    nodes: {
      scale: 0.2,
      color: {
        mode: 'group',
      },
    },
    edges: {
      scale: 1,
    },
  },
  sim: { run: true },
}

export interface INetworkSettingsStore extends INetworkSettings {
  updateSettings: (settings: INetworkSettings) => void
}

export const useNetworkSettingsStore = create<INetworkSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (settings: INetworkSettings) => {
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

export function useNetworkSettings(): {
  settings: INetworkSettingsStore
  updateSettings: (settings: INetworkSettingsStore) => void
  resetSettings: () => void
} {
  const settings = useNetworkSettingsStore((state) => state)
  const updateSettings = useNetworkSettingsStore(
    (state) => state.updateSettings
  )

  const resetSettings = useCallback(() => {
    updateSettings({ ...DEFAULT_SETTINGS })
  }, [updateSettings])

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
