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
  //padding: number
  width: number
  height: number
  scale: number
  margin: IMarginProps
  links: {
    colorMode: 'gradient' | 'source' | 'target' | 'static'
    color: string
    opacity: number
    gradientOffset: number
  }
  nodes: {
    gap: number
    rounding: number
    width: number
    useColumns: boolean // Whether to use the column property of nodes for layout
    shape: 'rect' | 'circle'
    opacity: number
    labels: {
      font: ITextProps
      position: 'center' | 'right' | 'left' | 'top' | 'bottom'
    }
  }
  // optimization: {
  //   on: boolean
  //   steps: number
  //   relaxation: {
  //     alpha: number
  //     decay: number
  //   }
  // }
}

const DEFAULT_SETTINGS: ISankeySettings = {
  width: 800,
  height: 400,
  scale: 1,
  margin: { ...DEFAULT_MARGIN },
  links: {
    colorMode: 'gradient',
    color: '#4F46E5',
    opacity: 0.5,
    gradientOffset: 0.2,
  },
  nodes: {
    gap: 50,
    rounding: 3,
    width: 20,
    opacity: 1,
    useColumns: true, // Whether to use the column property of nodes for layout
    shape: 'rect',
    labels: {
      font: { ...DEFAULT_TEXT_PROPS },
      position: 'center',
    },
  },
  // optimization: {
  //   on: true,
  //   steps: 32,
  //   relaxation: {
  //     alpha: 0.9,
  //     decay: 0.9,
  //   },
  // },
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
