import { IColorProps } from '@/components/plot/svg-props'
import { APP_ID } from '@/consts'
import { COLOR_BLACK, COLOR_WHITE } from '@lib/color/color'
import { produce } from 'immer'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const PLOT_W = 600

const SETTINGS_KEY = `${APP_ID}:module:venn:settings:v56`

export interface IVennCircleProps {
  id: string
  name: string
  fill: IColorProps
  stroke: IColorProps
  text: IColorProps
}

export const DEFAULT_VENN_CIRCLE_PROPS = {
  fill: '#cccccc',
  stroke: COLOR_BLACK,
  color: COLOR_WHITE,
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
    fill: { color: '#6495ED', opacity: 0.3, show: true },
    stroke: { color: '#6495ED', opacity: 1, show: true },
    text: { color: COLOR_WHITE, opacity: 1, show: true },
  },

  '2': {
    id: '2',
    name: 'List 2',
    fill: { color: '#ff0000', opacity: 0.3, show: true },
    stroke: { color: '#ff0000', opacity: 1, show: true },
    text: { color: COLOR_WHITE, opacity: 1, show: true },
  },

  '3': {
    id: '3',
    name: 'List 3',
    fill: { color: '#3CB371', opacity: 0.3, show: true },
    stroke: { color: '#3CB371', opacity: 1, show: true },
    text: { color: COLOR_WHITE, opacity: 1, show: true },
  },

  '4': {
    id: '4',
    name: 'List 4',
    fill: { color: '#ba55d3', opacity: 0.3, show: true },
    stroke: { color: '#ba55d3', opacity: 1, show: true },
    text: { color: COLOR_WHITE, opacity: 1, show: true },
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
}

const DEFAULT_SETTINGS: IVennSettings = {
  w: PLOT_W,
  radius: 120,
  scale: 1,
  isProportional: false,
  isFilled: true,
  isOutlined: false,
  intersectionColor: COLOR_WHITE,
  autoColorText: true,

  normalize: false,
  circles: { ...DEFAULT_CIRCLE_MAP },
  fonts: {
    title: { ...BOLD_FONT, colored: true },
    counts: DEFAULT_FONT,
    percentages: { ...DEFAULT_FONT, size: 12 },
  },
}

export interface IVennStore extends IVennSettings {
  updateSettings: (settings: Partial<IVennSettings>) => void
  updateRadius: (radius: number) => void
  updateCircles: (circles: Record<string, IVennCircleProps>) => void
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
    }
  )
)

export function useVennSettings(): {
  settings: IVennSettings
  updateSettings: (settings: Partial<IVennSettings>) => void
  resetSettings: () => void
  circles: Record<string, IVennCircleProps>
  updateCircles: (circles: Record<string, IVennCircleProps>) => void
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
    updateCircles({ ...DEFAULT_CIRCLE_MAP })
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
