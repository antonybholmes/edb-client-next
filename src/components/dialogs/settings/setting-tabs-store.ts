import type { ITab } from '@/components/tabs/tab-provider'
import { create } from 'zustand'
import { useDialogs } from '../dialogs'

interface ISettingsTabStore {
  defaultTab: string
  tabs: ITab[]
  visible: boolean
  setDefaultSettingsTab: (tab: string) => void
  setSettingsTabs: (tabs: ITab[]) => void
  setVisible: (visible: boolean) => void
}

export const useSettingsTabsStore = create<ISettingsTabStore>(set => ({
  defaultTab: 'General',
  tabs: [],
  visible: false,

  setDefaultSettingsTab: (tab: string) =>
    set(state => ({
      ...state,
      defaultTab: tab,
    })),

  setSettingsTabs: (tabs: ITab[]) =>
    set(state => ({
      ...state,
      tabs: [...tabs],
    })),
  setVisible: (visible: boolean) =>
    set(state => ({
      ...state,
      visible,
    })),
}))

export function useSettingsTabs(): Omit<ISettingsTabStore, 'setVisible'> & {
  openSettings: () => void
} {
  // This is a custom hook that uses the Zustand store to manage settings tabs
  // It allows components to access and modify the settings tab state

  const defaultTab = useSettingsTabsStore(state => state.defaultTab)
  const tabs = useSettingsTabsStore(state => state.tabs)
  const visible = useSettingsTabsStore(state => state.visible)
  const setDefaultSettingsTab = useSettingsTabsStore(
    state => state.setDefaultSettingsTab
  )
  const setSettingsTabs = useSettingsTabsStore(state => state.setSettingsTabs)
  const setVisible = useSettingsTabsStore(state => state.setVisible)

  const { open: openDialog } = useDialogs()

  function openSettings() {
    setVisible(true)

    openDialog({
      type: 'settings',
      payload: {
        callback: () => {
          console.log('Closing settings dialog')
          setVisible(false)
        },
      },
    })
  }

  return {
    defaultTab,
    tabs,
    visible,
    setDefaultSettingsTab,
    setSettingsTabs,
    openSettings,
  }
}
