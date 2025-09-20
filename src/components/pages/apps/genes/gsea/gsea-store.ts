import { APP_ID } from '@/consts'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEFAULT_GSEA_DISPLAY_PROPS,
  type IGseaDisplayProps,
} from './gsea-utils'
const SETTINGS_KEY = `${APP_ID}.gsea-settings-v22`

export interface IGseaStore extends IGseaDisplayProps {
  updateSettings: (settings: Partial<IGseaDisplayProps>) => void
}

export const useGseaStore = create<IGseaStore>()(
  persist(
    (set) => ({
      ...DEFAULT_GSEA_DISPLAY_PROPS,

      updateSettings: (settings: Partial<IGseaDisplayProps>) => {
        set((state) => ({
          ...state,
          ...settings,
        }))
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useGsea(): {
  settings: IGseaDisplayProps
  updateSettings: (settings: Partial<IGseaDisplayProps>) => void
  reset: () => void
} {
  const settings = useGseaStore((state) => state)
  const updateSettings = useGseaStore((state) => state.updateSettings)

  function reset() {
    updateSettings({ ...DEFAULT_GSEA_DISPLAY_PROPS })
  }

  return { settings, updateSettings, reset }
}
