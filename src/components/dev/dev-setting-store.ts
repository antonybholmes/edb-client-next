import { create } from 'zustand'

interface IDevSettingsStore {
  message: string

  setMessage: (message: string) => void
}

export const useDevSettingsStore = create<IDevSettingsStore>(set => ({
  message: '',

  setMessage: (message: string) =>
    set(state => ({
      ...state,
      message,
    })),
}))

export function useDevSettings(): IDevSettingsStore {
  // This is a custom hook that uses the Zustand store to manage settings tabs
  // It allows components to access and modify the settings tab state

  const message = useDevSettingsStore(state => state.message)
  const setMessage = useDevSettingsStore(state => state.setMessage)

  return {
    message,
    setMessage,
  }
}
