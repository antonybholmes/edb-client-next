import { APP_ID } from '@/consts'

import { persistentAtom } from '@nanostores/persistent'
import { useStore } from '@nanostores/react'

import MODULE_INFO from './module.json'

import { getModuleName } from '@/lib/module-info'
import type { IMarginProps } from '@components/plot/svg-props'

export type Mode = 'prob' | 'bits'
export type DNABase = 'a' | 'c' | 'g' | 't'

export const LW = 45

const KEY = `${APP_ID}:module:${getModuleName(MODULE_INFO.name)}:settings:v3`

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

const settingsAtom = persistentAtom<IMotifSettings>(
  KEY,
  {
    ...DEFAULT_SETTINGS,
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

function updateSettings(settings: IMotifSettings) {
  settingsAtom.set(settings)
}

function resetSettings() {
  updateSettings({ ...DEFAULT_SETTINGS })
}

export function useMotifSettings(): {
  settings: IMotifSettings
  updateSettings: (settings: IMotifSettings) => void
  resetSettings: () => void
} {
  const settings = useStore(settingsAtom)

  return { settings, updateSettings, resetSettings }
}
