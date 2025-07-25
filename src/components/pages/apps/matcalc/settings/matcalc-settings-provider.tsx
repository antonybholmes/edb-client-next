import type { IChildrenProps } from '@interfaces/children-props'
import { createContext } from 'react'
import {
  DEFAULT_SETTINGS,
  useMatcalcSettings,
  type IMatcalcSettings,
} from './matcalc-settings'

export const MatcalcSettingsContext = createContext<{
  settings: IMatcalcSettings
  updateSettings: (settings: IMatcalcSettings) => void
  resetSettings: () => void
}>({
  settings: { ...DEFAULT_SETTINGS },
  updateSettings: () => {},
  resetSettings: () => {},
})

export function MatcalcSettingsProvider({ children }: IChildrenProps) {
  const { settings, updateSettings, resetSettings } = useMatcalcSettings()

  return (
    <MatcalcSettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </MatcalcSettingsContext.Provider>
  )
}
