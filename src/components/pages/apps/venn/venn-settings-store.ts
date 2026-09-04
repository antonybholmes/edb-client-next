import {
  DEFAULT_MARGIN,
  IMarginProps,
  type IPaintProps,
} from '@/components/plot/svg-props'
import { config } from '@/config'
import type { IDBEntity } from '@/interfaces/db-entity'
import { COLOR_BLACK, COLOR_WHITE } from '@/lib/color/color'
import { produce } from 'immer'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const PLOT_W = 600

const SETTINGS_KEY = `${config.appId}:app:venn:settings:v70`

export interface IVennCircleProps extends IDBEntity {
  fill: IPaintProps
  stroke: IPaintProps
  text: IPaintProps
}

export const DEFAULT_VENN_CIRCLE_PROPS: IVennCircleProps = {
  id: '0',
  name: 'Default',
  fill: { value: '#cccccc', opacity: 0.4, show: true },
  stroke: { value: COLOR_BLACK, opacity: 1, show: true },
  text: { value: COLOR_WHITE, opacity: 1, show: true },
}

export type VennCirclesMap = Record<string, IVennCircleProps>

export const DEFAULT_CIRCLE_MAP: VennCirclesMap = {
  // {
  //   id: 0,
  //   name: 'List 0',
  //   fill: { color: '#000000', opacity: 0.3, show: true },
  //   stroke: { color: '#000000', opacity: 1, show: true },
  //   text: { color: COLOR_WHITE, opacity: 1, show: true },
  // },

  '1': {
    id: '1',
    name: 'List 1',
    fill: { value: '#6495ED', opacity: 0.4, show: true },
    stroke: { value: '#6495ED', opacity: 1, show: true },
    text: { value: COLOR_WHITE, opacity: 1, show: true },
  },

  '2': {
    id: '2',
    name: 'List 2',
    fill: { value: '#ff0000', opacity: 0.4, show: true },
    stroke: { value: '#ff0000', opacity: 1, show: true },
    text: { value: COLOR_WHITE, opacity: 1, show: true },
  },

  '3': {
    id: '3',
    name: 'List 3',
    fill: { value: '#3CB371', opacity: 0.4, show: true },
    stroke: { value: '#3CB371', opacity: 1, show: true },
    text: { value: COLOR_WHITE, opacity: 1, show: true },
  },

  '4': {
    id: '4',
    name: 'List 4',
    fill: { value: '#ba55d3', opacity: 0.4, show: true },
    stroke: { value: '#ba55d3', opacity: 1, show: true },
    text: { value: COLOR_WHITE, opacity: 1, show: true },
  },
}

export interface IFontProps {
  show: boolean
  color: string
  size: number
  family: string
  weight: string
}

const DEFAULT_FONT: IFontProps = {
  color: COLOR_BLACK,
  size: 16,
  family: 'Arial',
  weight: 'normal',
  show: true,
}

const BOLD_FONT: IFontProps = {
  ...DEFAULT_FONT,
  weight: 'bold',
}

export interface IVennSettings {
  w: number
  radius: number
  scale: number
  isProportional: boolean
  isFilled: boolean
  isOutlined: boolean
  intersectionColor: string
  autoColorText: boolean
  normalize: boolean
  circles: Record<string, IVennCircleProps>
  fonts: {
    title: IFontProps & { colored: boolean }
    counts: IFontProps
    percentages: IFontProps
  }
  view: {
    tab: 'venn' | 'heatmap'
  }
  heatmap: {
    cluster: {
      rows: {
        on: boolean
      }
      cols: {
        on: boolean
      }
      zscore: 'row' | 'col' | 'all' | 'none'
      //cmap: ColorMapName
    }
    dot: {
      sizes: number[]
      scale: number
    }
  }
  page: {
    margin: IMarginProps
  }
}

const DEFAULT_SETTINGS: IVennSettings = {
  w: PLOT_W,
  radius: 120,
  scale: 1,
  isProportional: false,
  isFilled: true,
  isOutlined: true,
  intersectionColor: COLOR_WHITE,
  autoColorText: true,

  normalize: false,
  circles: { ...DEFAULT_CIRCLE_MAP },
  fonts: {
    title: { ...BOLD_FONT, colored: true },
    counts: DEFAULT_FONT,
    percentages: { ...DEFAULT_FONT, size: 12 },
  },
  view: {
    tab: 'venn',
  },
  heatmap: {
    cluster: {
      rows: {
        on: true,
      },
      cols: {
        on: true,
      },
      zscore: 'row',
      //cmap: 'bwr-v2',
    },
    dot: {
      sizes: [25, 50, 75, 100],
      scale: 1,
    },
  },

  page: {
    margin: { ...DEFAULT_MARGIN, top: 25, bottom: 25 },
  },
}

export interface IVennStore extends IVennSettings {
  hasHydrated: boolean
  setHasHydrated: (hasHydrated: boolean) => void
  updateSettings: (settings: Partial<IVennSettings>) => void
  updateRadius: (radius: number) => void
  updateCircles: (circles: Record<string, IVennCircleProps>) => void
}

export const useVennSettingsStore = create<IVennStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      hasHydrated: false,
      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated })
      },
      updateSettings: (settings: Partial<IVennSettings>) => {
        set((state) => ({
          ...state,
          ...settings,
        }))
      },
      updateCircles: (circles: Record<string, IVennCircleProps>) => {
        set(
          produce((state) => {
            state.circles = circles
          })
        )
      },
      updateRadius: (radius: number) => {
        set(
          produce((state) => {
            state.radius = radius
          })
        )
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

export function useVennSettings(): {
  hasHydrated: boolean
  settings: IVennSettings
  updateSettings: (settings: Partial<IVennSettings>) => void
  resetSettings: () => void
  circles: Record<string, IVennCircleProps>
  updateCircles: (circles: Record<string, IVennCircleProps>) => void
  resetCircles: () => void
  updateRadius: (radius: number) => void
} {
  const settings = useVennSettingsStore((state) => state)
  const hasHydrated = useVennSettingsStore((state) => state.hasHydrated)
  const updateSettings = useVennSettingsStore((state) => state.updateSettings)

  const circles = useVennSettingsStore((state) => state.circles)
  const updateCircles = useVennSettingsStore((state) => state.updateCircles)
  const updateRadius = useVennSettingsStore((state) => state.updateRadius)

  function resetSettings() {
    updateSettings({ ...DEFAULT_SETTINGS })
  }

  function resetCircles() {
    updateCircles({ ...DEFAULT_CIRCLE_MAP })
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    circles,
    hasHydrated,
    updateCircles,
    resetCircles,
    updateRadius,
  }
}
