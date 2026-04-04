import { config } from '@/config'
import type { IDBEntity } from '@/interfaces/db-entity'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:hubs:settings:v8`

export interface IDataset extends IDBEntity {
  genome: string
  assembly: string
  technology: string
  institution: string
  url: string
  description: string
  samples: IDBEntity[]
}

export interface IHubOptions {
  showGuidelines: boolean
  assembly: string
  hideTracks: boolean
}

export const DEFAULT_HUB_OPTIONS: IHubOptions = {
  hideTracks: false,
  assembly: 'hg19',
  showGuidelines: false,
}

export interface IHubStore extends IHubOptions {
  updateSettings: (settings: Partial<IHubOptions>) => void
}

export const useHubsStore = create<IHubStore>()(
  persist(
    set => ({
      ...DEFAULT_HUB_OPTIONS,
      updateSettings: (settings: Partial<IHubOptions>) => {
        set(state => ({ ...state, ...settings }))
      },
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

// const hubsAtom = persistentAtom<IHubOptions>(
//   SETTINGS_KEY,
//   { ...DEFAULT_HUB_OPTIONS },
//   {
//     encode: JSON.stringify,
//     decode: JSON.parse,
//   }
// )

// function setStore(props: IHubOptions) {
//   hubsAtom.set(props)
// }

// function resetStore() {
//   hubsAtom.set({ ...DEFAULT_HUB_OPTIONS })
// }

export function useHubs(): {
  settings: IHubOptions
  updateSettings: (settings: Partial<IHubOptions>) => void
  resetSettings: () => void
} {
  const settings = useHubsStore(state => state)
  const updateSettings = useHubsStore(state => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_HUB_OPTIONS })

  return { settings, updateSettings, resetSettings }
}
