import {
  DEFAULT_MARGIN,
  DEFAULT_TEXT_PROPS,
  IMarginProps,
  ITextProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:matcalc:sankey:v2`

export interface ISankeySettings {
  padding: number
  width: number
  height: number
  nodeWidth: number
  margin: IMarginProps
  links: {
    color: 'gradient' | 'source' | 'target' | 'static'
    opacity: number
  }
  nodes: {
    rounding: number
    shape: 'rect' | 'circle'
    labels: {
      font: ITextProps
      position: 'center' | 'right' | 'left' | 'top' | 'bottom'
    }
  }
  optimization: {
    on: boolean
    steps: number
    relaxation: {
      alpha: number
      decay: number
    }
  }
}

const DEFAULT_SETTINGS: ISankeySettings = {
  padding: 10,
  width: 900,
  height: 500,
  nodeWidth: 20,
  margin: { ...DEFAULT_MARGIN },
  links: {
    color: 'gradient',
    opacity: 0.5,
  },
  nodes: {
    rounding: 3,
    shape: 'rect',
    labels: {
      font: { ...DEFAULT_TEXT_PROPS },
      position: 'center',
    },
  },
  optimization: {
    on: true,
    steps: 32,
    relaxation: {
      alpha: 0.9,
      decay: 0.9,
    },
  },
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
