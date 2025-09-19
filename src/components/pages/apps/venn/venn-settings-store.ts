import { APP_ID } from '@/consts'
import { COLOR_BLACK, COLOR_WHITE } from '@lib/color/color'
import { produce } from 'immer'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const PLOT_W = 700

const SETTINGS_KEY = `${APP_ID}:module:venn:settings:v42`

export interface IVennCircleProps {
  id: number
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
    id: 0,
    name: 'List 0',
    fill: '#000000',
    stroke: '#000000',
    color: COLOR_WHITE,
    fillOpacity: 1,
    strokeOpacity: 1,
  },
  {
    id: 1,
    name: 'List 1',
    fill: '#6495ED',
    stroke: '#6495ED',
    color: COLOR_WHITE,
    fillOpacity: 0.4,
    strokeOpacity: 1,
  },
  {
    id: 2,
    name: 'List 2',
    fill: '#ff0000',
    stroke: '#ff0000',
    color: COLOR_WHITE,
    fillOpacity: 0.25,
    strokeOpacity: 1,
  },
  {
    id: 3,
    name: 'List 3',
    fill: '#3CB371',
    stroke: '#3CB371',
    color: COLOR_WHITE,
    fillOpacity: 0.35,
    strokeOpacity: 1,
  },
  {
    id: 4,
    name: 'List 4',
    fill: '#ba55d3',
    stroke: '#ba55d3',
    color: COLOR_WHITE,
    fillOpacity: 0.4,
    strokeOpacity: 1,
  },
]

export interface IFontProps {
  //show: boolean
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
}

const BOLD_FONT: IFontProps = {
  ...DEFAULT_FONT,
  weight: 'bold',
}

export interface IVennSettings {
  showCounts: boolean
  showTitles: boolean
  showPercentages: boolean
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
  fonts: {
    title: IFontProps
    counts: IFontProps
    percentages: IFontProps
  }
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
  showTitles: true,
  showCounts: true,
  showPercentages: true,
  normalize: false,
  circles: [...DEFAULT_CIRCLE_MAP],
  fonts: {
    title: BOLD_FONT,
    counts: DEFAULT_FONT,
    percentages: { ...DEFAULT_FONT, size: 12 },
  },
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
