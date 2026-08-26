import { create } from 'zustand'

import { config } from '@/config'
import { createJSONStorage, persist } from 'zustand/middleware'
import {
  DEFAULT_DISPLAY_PROPS,
  DEFAULT_MUTATIONS,
  type IMutation,
  type IOncoplotDisplayProps,
} from './oncoplot-utils'

const SETTINGS_KEY = `${config.appId}:app:oncoplot:v30`

export interface IPlotState {
  mutations: IMutation[]
  displayProps: IOncoplotDisplayProps
}

export interface IOncoplotStore extends IPlotState {
  setMutations(mutations: IMutation[]): void
  setDisplayProps(displayProps: IOncoplotDisplayProps): void
}

export const useOncoplotStore = create<IOncoplotStore>()(
  persist(
    (set) => ({
      mutations: [...DEFAULT_MUTATIONS],
      genesInUse: {},
      displayProps: { ...DEFAULT_DISPLAY_PROPS },
      setMutations: (mutations: IMutation[]) =>
        set((state) => ({
          ...state,
          mutations: [...mutations],
        })),
      setGenesInUse: (genesInUse: Record<string, boolean>) =>
        set((state) => ({
          ...state,
          genesInUse: { ...genesInUse },
        })),

      setDisplayProps: (displayProps: IOncoplotDisplayProps) =>
        set((state) => ({
          ...state,
          displayProps,
        })),
    }),
    {
      name: SETTINGS_KEY, // name in localStorage
      storage: createJSONStorage(() => localStorage),
    }
  )
)

export function useOncoplotSettings(): IOncoplotStore {
  const mutations = useOncoplotStore((state) => state.mutations)
  const displayProps = useOncoplotStore((state) => state.displayProps)

  return {
    displayProps,
    mutations,
    setMutations: useOncoplotStore((state) => state.setMutations),
    setDisplayProps: useOncoplotStore((state) => state.setDisplayProps),
  }
}
