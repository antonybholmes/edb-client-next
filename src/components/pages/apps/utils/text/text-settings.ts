import { DEFAULT_TEXT_PROPS, ITextProps } from '@/components/plot/svg-props'
import { config } from '@/config'
import { useCallback } from 'react'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:text:v2`

//type LabelType = 'label' | 'name' | 'group' | 'size' | 'id' | 'id2'

// export const LABEL_TYPES: {
//   label: string
//   value: LabelType
// }[] = [
//   { label: 'Label', value: 'label' },
//   { label: 'Name', value: 'name' },
//   { label: 'Group', value: 'group' },
//   { label: 'Size', value: 'size' },
//   { label: 'ID', value: 'id' },
//   { label: 'ID 2', value: 'id2' },
//   // { label: 'None', value: 'none' },
// ]

export interface ITextSettings {
  text: ITextProps
}

const DEFAULT_SETTINGS: ITextSettings = {
  text: { ...DEFAULT_TEXT_PROPS },
}

export interface ITextSettingsStore extends ITextSettings {
  updateSettings: (settings: ITextSettings) => void
}

export const useTextSettingsStore = create<ITextSettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,

      updateSettings: (settings: ITextSettings) => {
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

export function useTextSettings(): {
  settings: ITextSettingsStore
  updateSettings: (settings: ITextSettingsStore) => void
  resetSettings: () => void
} {
  const settings = useTextSettingsStore((state) => state)
  const updateSettings = useTextSettingsStore((state) => state.updateSettings)

  const resetSettings = useCallback(() => {
    updateSettings({ ...DEFAULT_SETTINGS })
  }, [updateSettings])

  return {
    settings,
    updateSettings,
    resetSettings,
  }
}
