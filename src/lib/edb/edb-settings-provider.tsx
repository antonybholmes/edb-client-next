import type { IChildrenProps } from '@interfaces/children-props'
import { createContext } from 'react'
import {
  DEFAULT_EDB_SETTINGS,
  useEdbSettings,
  type IEdbSettings,
} from './edb-settings'

export const EdbSettingsContext = createContext<{
  settings: IEdbSettings
  updateSettings: (settings: IEdbSettings) => void
  resetSettings: () => void
}>({
  settings: { ...DEFAULT_EDB_SETTINGS },
  updateSettings: () => {},
  resetSettings: () => {},
})

export function EdbSettingsProvider({ children }: IChildrenProps) {
  const { settings, updateSettings, resetSettings } = useEdbSettings()

  return (
    <EdbSettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </EdbSettingsContext.Provider>
  )
}
