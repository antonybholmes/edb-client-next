import {
  DEFAULT_COLOR_PROPS,
  DEFAULT_DASH_PROPS,
  DEFAULT_FILL_PROPS,
  DEFAULT_STROKE_PROPS,
  IMarginProps,
  IPaintProps,
  IStrokeProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import { ColorMap, getColorMap, type ICmap } from '@/lib/color/colormap'
import { deepMerge } from '@/lib/deepmerge'
import { useCallback, useMemo } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:matcalc:volcano:v12`

const MARGIN = { top: 10, right: 200, bottom: 100, left: 400 }

export type SortBy = 'none' | 'nes' | 'size' | 'pvalue'

export interface IVolcanoSettings {
  thresholds: {
    pvalue: {
      show: boolean
      threshold: number
      line: IStrokeProps
    }
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
    color: {
      gradient: {
        on: boolean
      }
      cmap: ICmap
    }
  }
  margin: IMarginProps
  //scale: number

  preprocess: {
    applyLog2FC: boolean
    applyMinusLog10P: boolean
  }
  labels: {
    auto: boolean
    color: { on: boolean }
    offset: { x: number; y: number }

    connector: {
      type: 'straight' | 'elbow'
      stroke: IStrokeProps
    }
  }
  dots: { color: IPaintProps; size: number }
}

const DEFAULT_SETTINGS: IVolcanoSettings = {
  thresholds: {
    pvalue: {
      show: true,
      threshold: 0.05,
      line: { ...DEFAULT_DASH_PROPS, show: true },
    },
    logFc: {
      show: true,
      threshold: 1,

      neg: {
        fill: { ...DEFAULT_COLOR_PROPS, value: '#0000ff' },
      },
      pos: {
        fill: { ...DEFAULT_COLOR_PROPS, value: '#ff0000' },
      },
    },
    color: {
      gradient: { on: false },
      cmap: { name: 'bwr-v2', reversed: false },
    },
  },
  margin: { ...MARGIN },
  //scale: 1,

  preprocess: {
    applyLog2FC: false,
    applyMinusLog10P: true,
  },
  labels: {
    auto: true,
    color: { on: false },
    offset: { x: 20, y: 20 },

    connector: {
      type: 'straight',
      stroke: { ...DEFAULT_STROKE_PROPS, opacity: 0.25 },
    },
  },
  dots: {
    color: { ...DEFAULT_FILL_PROPS, opacity: 0.5, value: '#d9d9d9' },
    size: 3,
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
      merge: (persisted, current) => deepMerge(current, persisted),
    }
  )
)

export function useVolcanoSettings(): {
  settings: IVolcanoSettingsStore
  cmap: ColorMap
  updateSettings: (settings: IVolcanoSettingsStore) => void
  resetSettings: () => void
} {
  const settings = useVolcanoSettingsStore((state) => state)
  const updateSettings = useVolcanoSettingsStore(
    (state) => state.updateSettings
  )

  const cmap = useMemo(
    () => getColorMap(settings.thresholds.color.cmap),
    [settings.thresholds.color.cmap]
  )

  const resetSettings = useCallback(() => {
    updateSettings({ ...DEFAULT_SETTINGS })
  }, [updateSettings])

  return {
    settings,
    cmap,
    updateSettings,
    resetSettings,
  }
}
