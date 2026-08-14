import {
  DEFAULT_FILL_PROPS,
  IMarginProps,
  IPaintProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import { useCallback } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:matcalc:volcano:v2`

const MARGIN = { top: 10, right: 200, bottom: 100, left: 400 }

export type SortBy = 'none' | 'nes' | 'size' | 'pvalue'

export interface IVolcanoSettings {
  logFc: {
    show: boolean
    threshold: number

    neg: {
      fill: IPaintProps
    }
    pos: {
      fill: IPaintProps
    }
  }
  margin: IMarginProps
  scale: number
  cmap: string
  preprocess: {
    applyLog2FC: boolean
    applyMinusLog10P: boolean
  }
  labels: {
    auto: boolean
  }
}

const DEFAULT_SETTINGS: IVolcanoSettings = {
  logFc: {
    show: true,
    threshold: 1,

    neg: {
      fill: { ...DEFAULT_FILL_PROPS, value: '#0000ff' },
    },
    pos: {
      fill: { ...DEFAULT_FILL_PROPS, value: '#ff0000' },
    },
  },
  margin: { ...MARGIN },
  scale: 1,
  cmap: 'bwr-v2',
  preprocess: {
    applyLog2FC: false,
    applyMinusLog10P: true,
  },
  labels: {
    auto: true,
  },
}

export interface IVolcanoSettingsStore extends IVolcanoSettings {
  updateSettings: (settings: IVolcanoSettings) => void
}

export const useVolcanoSettingsStore = create<IVolcanoSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (settings: IVolcanoSettings) => {
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

export function useVolcanoSettings(): {
  settings: IVolcanoSettingsStore
  updateSettings: (settings: IVolcanoSettingsStore) => void
  resetSettings: () => void
} {
  const settings = useVolcanoSettingsStore((state) => state)
  const updateSettings = useVolcanoSettingsStore(
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
