import { config } from '@/config'
import APP_INFO from './manifest.json'

import {
  DEFAULT_BOLD_FONT_PROPS,
  DEFAULT_BOLD_TEXT_PROPS,
  DEFAULT_COLOR_PROPS,
  DEFAULT_TEXT_PROPS,
  type IMarginProps,
  type ITextProps,
} from '@/components/plot/svg-props'
import { getAppName } from '@/lib/app-info'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Mode = 'prob' | 'bits'
export type DNABase = 'a' | 'c' | 'g' | 't'

export const LW = 45

const SETTINGS_KEY = `${config.appId}:app:${getAppName(APP_INFO.name)}:settings:v36`

export type MotifSortBy = 'dataset,motif-id' | 'motif-id'

export const SORT_ORDER_MAP: Record<MotifSortBy, string> = {
  'dataset,motif-id': 'Dataset + Motif ID ',
  'motif-id': 'Motif ID',
}

export interface IMotifSettings {
  sort: { by: MotifSortBy; asc: boolean }
  view: Mode
  plotHeight: number
  letterWidth: number
  cols: number
  mode: Mode
  zoom: number
  margin: IMarginProps
  bases: Record<string, ITextProps>
  title: { text: ITextProps; offset: number }
  gap: number
  revComp: boolean
  axes: {
    show: boolean
    ticks: { show: boolean }
    title: ITextProps
    labels: ITextProps
  }
}

export const DEFAULT_SETTINGS: IMotifSettings = {
  view: 'bits',
  plotHeight: 100,
  letterWidth: LW,
  zoom: 1,
  cols: 1,
  mode: 'bits',
  gap: 80,
  margin: { top: 100, right: 100, bottom: 100, left: 100 },
  bases: {
    a: {
      ...DEFAULT_TEXT_PROPS,
      font: {
        ...DEFAULT_BOLD_FONT_PROPS,
        fill: { ...DEFAULT_COLOR_PROPS, value: '#3cb371' },
      },
    },
    c: {
      ...DEFAULT_TEXT_PROPS,
      font: {
        ...DEFAULT_BOLD_FONT_PROPS,
        fill: { ...DEFAULT_COLOR_PROPS, value: '#4169e1' },
      },
    },
    g: {
      ...DEFAULT_TEXT_PROPS,
      font: {
        ...DEFAULT_BOLD_FONT_PROPS,
        fill: { ...DEFAULT_COLOR_PROPS, value: '#FFA500' },
      },
    },
    t: {
      ...DEFAULT_TEXT_PROPS,
      font: {
        ...DEFAULT_BOLD_FONT_PROPS,
        fill: { ...DEFAULT_COLOR_PROPS, value: '#ff0000' },
      },
    },
  },
  title: {
    text: {
      ...DEFAULT_BOLD_TEXT_PROPS,
      font: { ...DEFAULT_BOLD_FONT_PROPS, fontSize: 16 },
    },
    offset: 10,
  },
  revComp: false,
  axes: {
    show: true,
    ticks: { show: true },
    title: { ...DEFAULT_BOLD_TEXT_PROPS },
    labels: { ...DEFAULT_TEXT_PROPS },
  },
  sort: { by: 'dataset,motif-id', asc: true },
}

export interface IMotifStore extends IMotifSettings {
  updateSettings: (settings: Partial<IMotifSettings>) => void
}

export const useMotifStore = create<IMotifStore>()(
  persist(
    set => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (settings: Partial<IMotifSettings>) => {
        set(state => ({ ...state, ...settings }))
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// const settingsAtom = persistentAtom<IMotifSettings>(
//   SETTINGS_KEY,
//   {
//     ...DEFAULT_SETTINGS,
//   },
//   {
//     encode: JSON.stringify,
//     decode: JSON.parse,
//   }
// )

// function updateSettings(settings: IMotifSettings) {
//   settingsAtom.set(settings)
// }

// function resetSettings() {
//   updateSettings({ ...DEFAULT_SETTINGS })
// }

export function useMotifSettings(): {
  settings: IMotifSettings
  updateSettings: (settings: Partial<IMotifSettings>) => void
  resetSettings: () => void
} {
  const settings = useMotifStore(state => state)
  const updateSettings = useMotifStore(state => state.updateSettings)
  const resetSettings = () =>
    updateSettings({
      ...DEFAULT_SETTINGS,
    })

  return { settings, updateSettings, resetSettings }
}
