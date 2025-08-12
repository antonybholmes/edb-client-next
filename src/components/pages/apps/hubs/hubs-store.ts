import { APP_ID } from '@/consts'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${APP_ID}:module:hubs:settings:v6`

export interface ISearchItem {
  publicId: string
  name: string
}

export type ISample = ISearchItem

export interface IHub extends ISearchItem {
  genome: string
  platform: string
  institution: string
  url: string
  description: string
  samples: ISample[]
}

export interface IHubOptions {
  showGuidelines: boolean
  genome: string
  hideTracks: boolean
}

export const DEFAULT_HUB_OPTIONS: IHubOptions = {
  hideTracks: false,
  genome: 'hg19',
  showGuidelines: false,
}

export interface IHubStore extends IHubOptions {
  updateSettings: (settings: IHubOptions) => void
  //applyTheme: (theme: Theme) => void
}

export const useHubsStore = create<IHubStore>()(
  persist(
    (set) => ({
      ...DEFAULT_HUB_OPTIONS,
      updateSettings: (settings: IHubOptions) => {
        set({ ...settings })
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
  updateSettings: (settings: IHubOptions) => void
  resetSettings: () => void
} {
  const settings = useHubsStore((state) => state)
  const updateSettings = useHubsStore((state) => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_HUB_OPTIONS })

  return { settings, updateSettings, resetSettings }
}
