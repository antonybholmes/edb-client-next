import { IDisplayAxis } from '@/components/pages/apps/matcalc/apps/volcano/volcano-plot-svg'
import {
  ColorBarPos,
  DEFAULT_COLOR_PROPS,
  DEFAULT_STROKE_PROPS,
  IMarginProps,
  IPaintProps,
  IStrokeProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import { ColorMapName } from '@/lib/color/colormap'
import { ILim } from '@/lib/math/math'
import { useCallback } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:genes:gsea:bubble:v22`

const MARGIN = { top: 20, right: 200, bottom: 10, left: 10 }

const PLOT_MARGIN = { top: 20, right: 10, bottom: 100, left: 400 }

export type SortBy = 'none' | 'nes' | 'size' | 'pvalue'

export type Mode = 'p' | 'nes'

export const MODE_ITEMS = [
  { value: 'p', label: 'P-value' },
  { value: 'nes', label: 'NES' },
]

export interface IGseaBubbleSettings {
  sortBy: SortBy
  axes: {
    x: IDisplayAxis & { auto: boolean }
    y: { rowHeight: number }
  }
  size: {
    label: string
    maxSize: number
  }
  phenotypes: {
    merge: boolean
  }
  bubbles: {
    size: number
    fill: IPaintProps
    stroke: IStrokeProps
  }
  scale: {
    mode: 'p' | 'nes'
    p: { range: ILim }
    label: string
    cmap: ColorMapName
  }
  border: IStrokeProps
  title: {
    show: boolean
  }
  padding: number
  colorbar: {
    show: boolean
    showMinorTicks: boolean
    position: ColorBarPos
  }
  legend: {
    bubbles: {
      n: number
      sizes: number[]
    }
  }
  margin: IMarginProps
  plot: { margin: IMarginProps }
  page: {
    scale: number
    grid: {
      cols: number
    }
  }
}

const DEFAULT_SETTINGS: IGseaBubbleSettings = {
  sortBy: 'none',
  axes: {
    x: {
      name: 'Log2 fold change',

      domain: [-2, 2],
      length: 300,
      ticks: [],
      tickLabels: [],
      tickSize: 4,
      stroke: { ...DEFAULT_STROKE_PROPS },
      auto: true,
    },
    y: {
      rowHeight: 24,
    },
  },

  scale: {
    mode: 'p',
    p: { range: [0, 10] },
    label: '-log10(p)',
    cmap: 'bwr-v2',
  },
  phenotypes: {
    merge: false,
  },
  size: {
    label: 'Size',
    maxSize: 100,
  },
  bubbles: {
    size: 10,
    fill: { ...DEFAULT_COLOR_PROPS },
    stroke: { ...DEFAULT_STROKE_PROPS, show: false },
  },
  title: {
    show: true,
  },
  border: { ...DEFAULT_STROKE_PROPS },
  padding: 10,
  colorbar: {
    show: true,
    position: 'right',
    showMinorTicks: true,
  },
  legend: {
    bubbles: {
      n: 3,
      sizes: [25, 50, 75, 100],
    },
  },
  margin: { ...MARGIN },
  plot: { margin: { ...PLOT_MARGIN } },
  page: {
    scale: 1,
    grid: {
      cols: 3,
    },
  },
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
