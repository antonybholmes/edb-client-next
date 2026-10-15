import { config } from '@/config'
import { useCallback, useMemo } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
const MAX_GROUPS = 100

const SETTINGS_KEY = `${config.appId}:app:genes:gsea:bubble:user:v2`

interface IGroup {
  name: string
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
  setgroups: (groups: IGroup[]) => void
}

export const useGseaBubbleUserSettingsStore =
  create<IGseaBubbleUserSettingsStore>()(
    persist(
      (set, get) => ({
        ...DEFAULT_SETTINGS,

        updateSettings: (settings: IGseaBubbleUserSettings) => {
          set({
            ...settings,
          })
        },
        setgroups: (groups: IGroup[]) => {
          const ids = new Set(groups.map((g) => g.name))

          set({
            groups: [
              ...get().groups.filter((g) => !ids.has(g.name)),
              ...groups,
            ].slice(-MAX_GROUPS),
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
  groupColors: Map<string, string>
  updateSettings: (settings: IGseaBubbleUserSettings) => void
  setGroups: (groups: IGroup[]) => void
  resetSettings: () => void
} {
  const settings = useGseaBubbleUserSettingsStore((state) => state)
  const groups = useGseaBubbleUserSettingsStore((state) => state.groups)

  const groupColors = useMemo(
    () => new Map(groups.map((g) => [g.name, g.color])),
    [groups]
  )

  const setGroups = useGseaBubbleUserSettingsStore((state) => state.setgroups)
  const updateSettings = useGseaBubbleUserSettingsStore(
    (state) => state.updateSettings
  )

  const resetSettings = useCallback(() => {
    updateSettings({ ...DEFAULT_SETTINGS })
  }, [updateSettings])

  return {
    settings,
    groupColors,
    updateSettings,
    setGroups,
    resetSettings,
  }
}
