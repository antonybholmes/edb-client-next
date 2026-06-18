import { config } from '@/config'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${config.appId}:app:annotations:settings:v10`

export interface IAnnotationOptions {
  genome: string
  closest: number
  tss: { prom5p: number; prom3p: number }
  useOfficialGenes: boolean
}

export const DEFAULT_ANNOTATION_OPTIONS: IAnnotationOptions = {
  genome: 'grch38',
  closest: 5,
  tss: { prom5p: 2000, prom3p: 1000 },
  useOfficialGenes: true,
}

export interface IAnnotationStore extends IAnnotationOptions {
  updateSettings: (settings: IAnnotationOptions) => void
}

export const useAnnotationStore = create<IAnnotationStore>()(
  persist(
    set => ({
      ...DEFAULT_ANNOTATION_OPTIONS,
      updateSettings: (settings: IAnnotationOptions) => {
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

export function useAnnotations(): {
  settings: IAnnotationOptions
  updateSettings: (settings: IAnnotationOptions) => void
  resetSettings: () => void
} {
  const settings = useAnnotationStore(state => state)
  const updateSettings = useAnnotationStore(state => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_ANNOTATION_OPTIONS })

  return { settings, updateSettings, resetSettings }
}
