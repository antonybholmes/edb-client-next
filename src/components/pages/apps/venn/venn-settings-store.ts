import { APP_ID } from '@/consts'
import { COLOR_BLACK, COLOR_WHITE } from '@lib/color/color'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const PLOT_W = 600

const SETTINGS_KEY = `${APP_ID}:module:venn:settings:v16`

export interface IVennCircleProps {
  name: string
  fill: string
  stroke: string
  color: string
  fillOpacity: number
  strokeOpacity: number
}

export const DEFAULT_VENN_CIRCLE_PROPS = {
  fill: '#cccccc',
  stroke: COLOR_BLACK,
  color: COLOR_WHITE,
}

export type VennCirclesMap = Record<string, IVennCircleProps>

export const DEFAULT_CIRCLE_MAP: VennCirclesMap = {
  1: {
    name: 'A',
    fill: '#ff0000',
    stroke: '#ff0000',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
  2: {
    name: 'B',
    fill: '#008000',
    stroke: '#008000',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
  3: {
    name: 'C',
    fill: '#0000ff',
    stroke: '#0000ff',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
  4: {
    name: 'D',
    fill: '#FFA500',
    stroke: '#FFA500',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
}

export interface IVennSettings {
  showCounts: boolean
  showLabels: boolean
  w: number
  radius: number
  scale: number
  isProportional: boolean
  isFilled: boolean
  isOutlined: boolean
  intersectionColor: string
  autoColorText: boolean
  normalize: boolean
  circles: VennCirclesMap
}

const DEFAULT_SETTINGS: IVennSettings = {
  w: PLOT_W,
  radius: 150,
  scale: 1,
  isProportional: false,
  isFilled: true,
  isOutlined: false,
  intersectionColor: COLOR_WHITE,
  autoColorText: true,
  showLabels: true,
  showCounts: true,
  normalize: false,
  circles: DEFAULT_CIRCLE_MAP,
}

export interface IVennStore {
  settings: IVennSettings
  circles: VennCirclesMap
  updateSettings: (settings: IVennSettings) => void
  updateCircles: (circles: VennCirclesMap) => void
}

export const useVennSettingsStore = create<IVennStore>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_SETTINGS },
      circles: { ...DEFAULT_CIRCLE_MAP },
      updateSettings: (settings: IVennSettings) => {
        set({ settings: { ...settings } })
      },
      updateCircles: (circles: VennCirclesMap) => {
        set({ circles: { ...circles } })
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useVennSettings(): {
  settings: IVennSettings
  updateSettings: (settings: IVennSettings) => void
  resetSettings: () => void
  circles: VennCirclesMap
  updateCircles: (circles: VennCirclesMap) => void
  resetCircles: () => void
} {
  const settings = useVennSettingsStore((state) => state.settings)
  const updateSettings = useVennSettingsStore((state) => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_SETTINGS })

  const circles = useVennSettingsStore((state) => state.circles)
  const updateCircles = useVennSettingsStore((state) => state.updateCircles)
  const resetCircles = () => updateCircles({ ...DEFAULT_CIRCLE_MAP })

  return {
    settings,
    updateSettings,
    resetSettings,
    circles,
    updateCircles,
    resetCircles,
  }
}
