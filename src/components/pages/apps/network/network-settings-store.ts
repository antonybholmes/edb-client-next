import {
  DEFAULT_STROKE_PROPS,
  DEFAULT_TEXT_PROPS,
  IMarginProps,
  IStrokeProps,
  ITextProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import { COLOR_BLACK, COLOR_LIGHTGRAY } from '@/lib/color/color'
import { useCallback } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:network:v2`

const PLOT_MARGIN = { top: 100, right: 400, bottom: 100, left: 100 }

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
        opacity: number
      }
      labels: {
        text: ITextProps
        color: {
          on: boolean
          default: string
        }
        position: 'left' | 'center' | 'right' | 'below' | 'above'
        offset: { x: number; y: number }
      }
    }
    edges: {
      scale: number
      line: IStrokeProps
    }
    legend: {
      dot: {
        radius: number
      }
    }
  }
}

const DEFAULT_SETTINGS: INetworkSettings = {
  chargeStrength: -30,
  linkDistance: 100,
  plot: {
    margin: { ...PLOT_MARGIN },
    nodes: {
      scale: 0.1,
      color: {
        mode: 'group',
        opacity: 0.5,
      },
      labels: {
        text: { ...DEFAULT_TEXT_PROPS },
        color: { on: false, default: COLOR_BLACK },
        position: 'center',
        offset: { x: 10, y: 10 },
      },
    },
    edges: {
      scale: 1,
      line: { ...DEFAULT_STROKE_PROPS, value: COLOR_LIGHTGRAY },
    },
    legend: {
      dot: {
        radius: 8,
      },
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
