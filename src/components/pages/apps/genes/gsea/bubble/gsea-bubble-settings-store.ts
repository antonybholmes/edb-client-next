import {
  ColorBarPos,
  DEFAULT_COLOR_PROPS,
  DEFAULT_STROKE_PROPS,
  IMarginProps,
  IPaintProps,
  IStrokeProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import { IDim } from '@/interfaces/dim'
import { ColorMapName } from '@/lib/color/colormap'
import { ILim } from '@/lib/math/math'
import { useCallback } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:genes:gsea:bubble:v8`

const MARGIN = { top: 10, right: 200, bottom: 100, left: 400 }

export type SortBy = 'none' | 'nes' | 'size' | 'pvalue'

export interface IGseaBubbleSettings {
  sortBy: SortBy
  axes: {
    x: { length: number }
    y: { rowHeight: number }
  }
  size: {
    label: string
    maxSize: number
  }
  bubbles: {
    size: number

    fill: IPaintProps
    stroke: IStrokeProps
  }
  p: {
    range: ILim
    label: string
    cmap: ColorMapName
  }
  border: IStrokeProps
  padding: number
  colorbar: {
    show: boolean
    position: ColorBarPos
    size: IDim
  }
  legend: {
    bubbles: {
      n: number
      sizes: number[]
    }
  }
  margin: IMarginProps
  scale: number
}

const DEFAULT_SETTINGS: IGseaBubbleSettings = {
  sortBy: 'none',
  axes: {
    x: {
      length: 300,
    },
    y: {
      rowHeight: 24,
    },
  },

  p: {
    range: [0, 10],
    label: '-log10(p)',
    cmap: 'bwr-v2',
  },
  size: {
    label: 'Size',
    maxSize: 100,
  },
  bubbles: {
    size: 10,
    fill: { ...DEFAULT_COLOR_PROPS },
    stroke: { ...DEFAULT_STROKE_PROPS },
  },

  border: { ...DEFAULT_STROKE_PROPS },
  padding: 10,
  colorbar: {
    show: true,
    position: 'right',
    size: { w: 100, h: 14 },
  },
  legend: {
    bubbles: {
      n: 3,
      sizes: [25, 50, 75, 100],
    },
  },
  margin: { ...MARGIN },
  scale: 1,
}

export interface IGseaBubbleSettingsStore extends IGseaBubbleSettings {
  updateSettings: (settings: IGseaBubbleSettings) => void
}

export const useGseaBubbleSettingsStore = create<IGseaBubbleSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (settings: IGseaBubbleSettings) => {
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

export function useGseaBubbleSettings(): {
  settings: IGseaBubbleSettingsStore
  updateSettings: (settings: IGseaBubbleSettingsStore) => void
  resetSettings: () => void
} {
  const settings = useGseaBubbleSettingsStore((state) => state)
  const updateSettings = useGseaBubbleSettingsStore(
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
