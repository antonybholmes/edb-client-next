import { APP_ID } from '@/consts'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const SETTINGS_KEY = `${APP_ID}:module:annotations:settings:v6`

export interface IAnnotationOptions {
  genome: string
}

export const DEFAULT_ANNOTATION_OPTIONS: IAnnotationOptions = {
  genome: 'grch38',
}

export interface IAnnotationStore extends IAnnotationOptions {
  updateSettings: (settings: IAnnotationOptions) => void
  //applyTheme: (theme: Theme) => void
}

export const useHubsStore = create<IAnnotationStore>()(
  persist(
    (set) => ({
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
  const settings = useHubsStore((state) => state)
  const updateSettings = useHubsStore((state) => state.updateSettings)
  const resetSettings = () => updateSettings({ ...DEFAULT_ANNOTATION_OPTIONS })

  return { settings, updateSettings, resetSettings }
}
