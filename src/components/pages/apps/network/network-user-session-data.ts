import { create } from 'zustand'
import { INode } from './network'

export interface IUserSessionDataSettings {
  currentNode: INode | null
}

const DEFAULT_SETTINGS: IUserSessionDataSettings = {
  currentNode: null,
}

export interface IUserDataStore extends IUserSessionDataSettings {
  updateSettings: (settings: IUserSessionDataSettings) => void
}

export const useUserSessionDataStore = create<IUserDataStore>()((set) => ({
  ...DEFAULT_SETTINGS,
  updateSettings: (settings: IUserSessionDataSettings) => {
    set({
      ...settings,
    })
  },
}))

export function useUserSessionData(): {
  settings: IUserDataStore
  updateSettings: (settings: IUserSessionDataSettings) => void
  resetSettings: () => void
  currentNode: INode | null
} {
  const settings = useUserSessionDataStore((state) => state)
  const currentNode = useUserSessionDataStore((state) => state.currentNode)

  const updateSettings = useUserSessionDataStore(
    (state) => state.updateSettings
  )

  const resetSettings = () => {
    updateSettings(DEFAULT_SETTINGS)
  }

  return {
    settings,
    updateSettings,
    resetSettings,
    currentNode,
  }
}
