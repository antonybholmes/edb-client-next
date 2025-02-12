import { type IChildrenProps } from '@interfaces/children-props'

import {
  DEFAULT_EDB_SETTINGS,
  useEdbSettingsStore,
  type IEdbSettings,
} from '@/lib/edb/edb-settings-store'
import { createContext } from 'react'

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
  const { settings, updateSettings, resetSettings } = useEdbSettingsStore()

  return (
    <EdbSettingsContext.Provider
      value={{ settings, updateSettings, resetSettings }}
    >
      {children}
    </EdbSettingsContext.Provider>
  )
}
