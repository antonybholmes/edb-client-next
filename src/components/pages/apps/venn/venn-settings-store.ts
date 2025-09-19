import { APP_ID } from '@/consts'
import { COLOR_BLACK, COLOR_WHITE } from '@lib/color/color'
import { produce } from 'immer'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const PLOT_W = 700

const SETTINGS_KEY = `${APP_ID}:module:venn:settings:v28`

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

export const DEFAULT_CIRCLE_MAP: IVennCircleProps[] = [
  {
    name: 'List 0',
    fill: '#000000',
    stroke: '#00000',
    color: COLOR_WHITE,
    fillOpacity: 1,
    strokeOpacity: 1,
  },
  {
    name: 'List 1',
    fill: '#6495ED',
    stroke: '#6495ED',
    color: COLOR_WHITE,
    fillOpacity: 0.4,
    strokeOpacity: 1,
  },
  {
    name: 'List 2',
    fill: '#ff0000',
    stroke: '#ff0000',
    color: COLOR_WHITE,
    fillOpacity: 0.25,
    strokeOpacity: 1,
  },
  {
    name: 'List 3',
    fill: '#3CB371',
    stroke: '#3CB371',
    color: COLOR_WHITE,
    fillOpacity: 0.35,
    strokeOpacity: 1,
  },
  {
    name: 'List 4',
    fill: '#ba55d3',
    stroke: '#ba55d3',
    color: COLOR_WHITE,
    fillOpacity: 0.4,
    strokeOpacity: 1,
  },
]

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
  circles: IVennCircleProps[]
}

const DEFAULT_SETTINGS: IVennSettings = {
  w: PLOT_W,
  radius: 140,
  scale: 1,
  isProportional: false,
  isFilled: true,
  isOutlined: false,
  intersectionColor: COLOR_WHITE,
  autoColorText: true,
  showLabels: true,
  showCounts: true,
  normalize: false,
  circles: [...DEFAULT_CIRCLE_MAP],
}

export interface IVennStore extends IVennSettings {
  updateSettings: (settings: Partial<IVennSettings>) => void
  updateRadius: (radius: number) => void
  updateCircles: (circles: IVennCircleProps[]) => void
}

export const useVennSettingsStore = create<IVennStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (settings: Partial<IVennSettings>) => {
        console.log('updateSettings', settings)
        set((state) => ({
          ...state,
          ...settings,
        }))
      },
      updateCircles: (circles: IVennCircleProps[]) => {
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
    }
  )
)

export function useVennSettings(): {
  settings: IVennSettings
  updateSettings: (settings: Partial<IVennSettings>) => void
  resetSettings: () => void
  circles: IVennCircleProps[]
  updateCircles: (circles: IVennCircleProps[]) => void
  resetCircles: () => void
  updateRadius: (radius: number) => void
} {
  const settings = useVennSettingsStore((state) => state)
  const updateSettings = useVennSettingsStore((state) => state.updateSettings)

  const circles = useVennSettingsStore((state) => state.circles)
  const updateCircles = useVennSettingsStore((state) => state.updateCircles)
  const updateRadius = useVennSettingsStore((state) => state.updateRadius)

  function resetSettings() {
    console.log('resetSettings')
    updateSettings({ ...DEFAULT_SETTINGS })
  }

  function resetCircles() {
    updateCircles([...DEFAULT_CIRCLE_MAP])
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    circles,
    updateCircles,
    resetCircles,
    updateRadius,
  }
}
