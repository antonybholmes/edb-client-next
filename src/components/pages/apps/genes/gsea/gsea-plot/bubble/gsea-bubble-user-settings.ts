import { config } from '@/config'
import { IDBEntity } from '@/interfaces/db-entity'
import { useCallback } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:genes:gsea:bubble:user:v2`

interface IGroup extends IDBEntity {
  color: string
}

export interface IGseaBubbleUserSettings {
  groups: IGroup[]
}

const DEFAULT_SETTINGS: IGseaBubbleUserSettings = {
  groups: [],
}

export interface IGseaBubbleUserSettingsStore extends IGseaBubbleUserSettings {
  updateSettings: (settings: IGseaBubbleUserSettings) => void
}

export const useGseaBubbleUserSettingsStore =
  create<IGseaBubbleUserSettingsStore>()(
    persist(
      (set) => ({
        ...DEFAULT_SETTINGS,

        updateSettings: (settings: IGseaBubbleUserSettings) => {
          set({
            ...settings,
          })
        },
      }),
      {
        name: SETTINGS_KEY, // name in localStorage
        storage: createJSONStorage(() => localStorage),
      }
    )
  )

export function useGseaBubbleUserSettings(): {
  settings: IGseaBubbleUserSettings
  updateSettings: (settings: IGseaBubbleUserSettings) => void
  resetSettings: () => void
} {
  const settings = useGseaBubbleUserSettingsStore((state) => state)
  const updateSettings = useGseaBubbleUserSettingsStore(
    (state) => state.updateSettings
  )

  const resetSettings = useCallback(() => {
    updateSettings({ ...DEFAULT_SETTINGS })
  }, [updateSettings])

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
