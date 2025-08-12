import { APP_ID } from '@/consts'

import MODULE_INFO from './module.json'

import { getModuleName } from '@/lib/module-info'
import type { IMarginProps } from '@components/plot/svg-props'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Mode = 'prob' | 'bits'
export type DNABase = 'a' | 'c' | 'g' | 't'

export const LW = 45

const SETTINGS_KEY = `${APP_ID}:module:${getModuleName(MODULE_INFO.name)}:settings:v4`

export interface IMotifSettings {
  view: Mode
  plotHeight: number
  letterWidth: number
  mode: Mode
  zoom: number
  margin: IMarginProps
  baseColors: Record<string, string>
  titleOffset: number
  gap: number
  revComp: boolean
  datasets: {
    selected: string[]
  }
}

export const DEFAULT_SETTINGS: IMotifSettings = {
  view: 'bits',
  plotHeight: 100,
  letterWidth: LW,
  zoom: 1,
  mode: 'bits',
  gap: 80,
  margin: { top: 100, right: 100, bottom: 100, left: 100 },
  baseColors: {
    a: '#3cb371',
    c: '#4169e1',
    g: '#FFA500',
    t: '#ff0000',
  },
  titleOffset: 10,
  revComp: false,
  datasets: {
    selected: ['H12CORE'],
  },
}

export interface IMotifStore extends IMotifSettings {
  updateSettings: (settings: IMotifSettings) => void
  //applyTheme: (theme: Theme) => void
}

export const useMotifStore = create<IMotifStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (settings: IMotifSettings) => {
        set({ ...settings })
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
  updateSettings: (settings: IMotifSettings) => void
  resetSettings: () => void
} {
  const settings = useMotifStore((state) => state)
  const updateSettings = useMotifStore((state) => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_SETTINGS })

  return { settings, updateSettings, resetSettings }
}
