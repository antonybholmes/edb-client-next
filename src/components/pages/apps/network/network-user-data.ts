import { config } from '@/config'
import { deepMerge } from '@/lib/deepmerge'
import { useMemo } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { INode } from './network'

const SETTINGS_KEY = `${config.appId}:app:network:user-data:v8`

interface IUserDataGroups {
  colors: Record<string, string>
}

interface IUserDataLabels {
  ids: string[]
  mode: 'partial' | 'exact'
}

export interface IUserDataSettings {
  groups: IUserDataGroups
  labels: IUserDataLabels
  currentNode: INode | null
}

const DEFAULT_SETTINGS: IUserDataSettings = {
  groups: {
    colors: {},
  },
  labels: { ids: [], mode: 'partial' },
  currentNode: null,
}

export interface IUserDataStore extends IUserDataSettings {
  updateSettings: (settings: IUserDataSettings) => void
  updateGroups: (settings: IUserDataGroups) => void
  updateLabels: (settings: IUserDataLabels) => void
}

export const useNetworkSettingsStore = create<IUserDataStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (settings: IUserDataSettings) => {
        set({
          ...settings,
        })
      },

      updateGroups: (settings: IUserDataGroups) => {
        set({
          groups: settings,
        })
      },
      updateLabels: (settings: IUserDataLabels) => {
        set({
          labels: settings,
        })
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
      merge: (persisted, current) =>
        // conform saved settings to the current shape: saved values win where
        // key and type still match, defaults fill missing or invalid values
        deepMerge(current, persisted),
    }
  )
)

export function useUserData(): {
  settings: IUserDataStore
  updateSettings: (settings: IUserDataSettings) => void
  userLabelSet: Set<string>
  currentNode: INode | null
} {
  const settings = useNetworkSettingsStore((state) => state)
  const currentNode = useNetworkSettingsStore((state) => state.currentNode)

  const updateSettings = useNetworkSettingsStore(
    (state) => state.updateSettings
  )

  const userLabelSet = useMemo(
    () =>
      new Set(
        settings.labels.ids
          .filter((x) => x.length > 0)
          .map((x) => x.toLowerCase())
      ),
    [settings.labels.ids]
  )

  return {
    settings,
    updateSettings,
    userLabelSet,
    currentNode,
  }
}
