import { APP_ID } from '@/consts'
import { COLOR_BLACK, COLOR_WHITE } from '@lib/color/color'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const PLOT_W = 600

const SETTINGS_KEY = `${APP_ID}:module:venn:settings:v14`

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
  0: {
    name: 'A',
    fill: '#ff0000',
    stroke: '#ff0000',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
  1: {
    name: 'B',
    fill: '#008000',
    stroke: '#008000',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
  2: {
    name: 'C',
    fill: '#0000ff',
    stroke: '#0000ff',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
  3: {
    name: 'D',
    fill: '#FFA500',
    stroke: '#FFA500',
    color: COLOR_WHITE,
    fillOpacity: 0.3,
    strokeOpacity: 1,
  },
}

export interface IVennOptions {
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

const DEFAULT_SETTINGS: IVennOptions = {
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
  settings: IVennOptions
  circles: VennCirclesMap
  updateSettings: (settings: IVennOptions) => void
  updateCircles: (circles: VennCirclesMap) => void
}

export const useVennStore = create<IVennStore>()(
  persist(
    (set) => ({
      settings: { ...DEFAULT_SETTINGS },
      circles: { ...DEFAULT_CIRCLE_MAP },
      updateSettings: (settings: IVennOptions) => {
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

export function useVenn(): {
  settings: IVennOptions
  updateSettings: (settings: IVennOptions) => void
  resetSettings: () => void
  circles: VennCirclesMap
  updateCircles: (circles: VennCirclesMap) => void
  resetCircles: () => void
} {
  const settings = useVennStore((state) => state.settings)
  const updateSettings = useVennStore((state) => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_SETTINGS })

  const circles = useVennStore((state) => state.circles)
  const updateCircles = useVennStore((state) => state.updateCircles)
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
