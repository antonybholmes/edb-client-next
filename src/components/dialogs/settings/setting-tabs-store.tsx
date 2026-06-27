import { SettingsIcon } from '@/components/icons/settings-icon'
import type { ITab } from '@/components/tabs/tab-provider'
import { create } from 'zustand'
import { useDialogs } from '../dialogs'
import { SettingsGeneralPanel } from './settings-general-panel'

// These tabs always appear in the UI
const DEFAULT_TABS: ITab[] = [
  {
    id: '019f0ae9-18f6-730c-b7f5-6e619b5bbe4e',
    name: 'General',
    icon: <SettingsIcon stroke="" size="w-4.5" strokeWidth={2} />,
    component: SettingsGeneralPanel,
  },
]

interface ISettingsTabStore {
  defaultTab: string
  tabs: ITab[]
  visible: boolean
  setDefaultTab: (tab: string) => void
  setSettingsTabs: (tabs: ITab[]) => void
  setVisible: (visible: boolean) => void
}

export const useSettingsTabsStore = create<ISettingsTabStore>((set) => ({
  defaultTab: 'General',
  tabs: [...DEFAULT_TABS],
  visible: false,

  setDefaultTab: (tab: string) =>
    set((state) => ({
      ...state,
      defaultTab: tab,
    })),

  setSettingsTabs: (tabs: ITab[]) =>
    set((state) => ({
      ...state,
      tabs: [...DEFAULT_TABS, ...tabs],
    })),
  setVisible: (visible: boolean) =>
    set((state) => ({
      ...state,
      visible,
    })),
}))

export function useSettingsTabs(): Omit<ISettingsTabStore, 'setVisible'> & {
  openSettings: () => void
} {
  // This is a custom hook that uses the Zustand store to manage settings tabs
  // It allows components to access and modify the settings tab state

  const defaultTab = useSettingsTabsStore((state) => state.defaultTab)
  const tabs = useSettingsTabsStore((state) => state.tabs)
  const visible = useSettingsTabsStore((state) => state.visible)
  const setDefaultTab = useSettingsTabsStore((state) => state.setDefaultTab)
  const setSettingsTabs = useSettingsTabsStore((state) => state.setSettingsTabs)
  const setVisible = useSettingsTabsStore((state) => state.setVisible)

  const { open: openDialog } = useDialogs()

  function openSettings() {
    setVisible(true)

    openDialog({
      type: 'settings',
      payload: {
        callback: () => {
          setVisible(false)
        },
      },
    })
  }

  return {
    defaultTab,
    tabs,
    visible,
    setDefaultTab,
    setSettingsTabs,
    openSettings,
  }
}
