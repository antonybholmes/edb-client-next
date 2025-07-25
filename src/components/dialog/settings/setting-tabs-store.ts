import type { ITab } from '@components/tabs/tab-provider'
import { create } from 'zustand'

interface ISettingsTabStore {
  defaultTab: string
  tabs: ITab[]
  visible: boolean
  setDefaultSettingsTab: (tab: string) => void
  setSettingsTabs: (tabs: ITab[]) => void
  setSettingsVisible: (visible: boolean) => void
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
  setSettingsVisible: (visible: boolean) =>
    set(state => ({
      ...state,
      visible,
    })),
}))

export function useSettingsTabs(): ISettingsTabStore {
  // This is a custom hook that uses the Zustand store to manage settings tabs
  // It allows components to access and modify the settings tab state

  const defaultTab = useSettingsTabsStore(state => state.defaultTab)
  const tabs = useSettingsTabsStore(state => state.tabs)
  const visible = useSettingsTabsStore(state => state.visible)
  const setDefaultSettingsTab = useSettingsTabsStore(
    state => state.setDefaultSettingsTab
  )
  const setSettingsTabs = useSettingsTabsStore(state => state.setSettingsTabs)
  const setSettingsVisible = useSettingsTabsStore(
    state => state.setSettingsVisible
  )

  return {
    defaultTab,
    tabs,
    visible,
    setDefaultSettingsTab,
    setSettingsTabs,
    setSettingsVisible,
  }
}
