import { IChildrenProps } from '@/interfaces/children-props'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { create } from 'zustand'
import { ITab } from './tab-provider'

export const DEFAULT_GROUP_ID = 'default'

interface ITabGroup {
  id: string
  tabs: ITab[]
  selectedTabIndex: number
}

export const DEFAULT_TAB_GROUP: ITabGroup = {
  id: DEFAULT_GROUP_ID,
  tabs: [],
  selectedTabIndex: 0,
}

interface ITabsStore {
  tabs: Record<string, ITabGroup>
  initTabs: (groupId: string) => void
  setTabs: (groupId: string, tabs: ITab[]) => void
  setTab: (groupId: string, tab: string | number) => void
  getTab: (groupId: string) => ITab | undefined
}

export const useTabStore = create<ITabsStore>((set, get) => ({
  tabs: {},
  initTabs: (groupId) => {
    if (groupId in get().tabs) {
      return
    }

    set((state) => ({
      ...state,
      tabs: {
        ...state.tabs,
        [groupId]: state.tabs[groupId] ?? { ...DEFAULT_TAB_GROUP, id: groupId },
      },
    }))
  },
  setTabs: (groupId, tabs) => {
    set((state) => ({
      ...state,
      tabs: {
        ...state.tabs,
        [groupId]: {
          ...state.tabs[groupId],
          id: groupId,
          tabs: [...tabs],
          selectedTabIndex: 0,
        },
      },
    }))
  },
  setTab: (groupId, tab) => {
    if (!(groupId in get().tabs)) {
      return
    }

    set((state) => {
      const tabs = state.tabs[groupId]?.tabs ?? []

      let index = 0

      if (typeof tab === 'number') {
        index = tab
      } else if (typeof tab === 'string') {
        const lt = tab.toLowerCase()
        const idx = tabs.findIndex(
          (t) => t.id.toLowerCase() === lt || t.name?.toLowerCase() === lt
        )

        if (idx !== -1) {
          index = idx
        }
      }

      return {
        ...state,

        tabs: {
          ...state.tabs,
          [groupId]: {
            ...state.tabs[groupId],
            id: groupId,
            tabs,
            selectedTabIndex: index,
          },
        },
      }
    })
  },

  getTab: (groupId) => {
    if (!(groupId in get().tabs)) {
      return undefined
    }

    const tabs = get().tabs[groupId]?.tabs ?? []

    return tabs[get().tabs[groupId]?.selectedTabIndex ?? 0]
  },
}))

export function useTabs2(groupId: string) {
  groupId = groupId ?? DEFAULT_GROUP_ID

  const tabState = useTabStore((s) => s.tabs[groupId] ?? DEFAULT_TAB_GROUP)

  const initTabs = useTabStore((s) => s.initTabs)

  const tab = useMemo(
    () => tabState.tabs[tabState.selectedTabIndex ?? 0],
    [tabState]
  )
  //const getTabs = useTabStore(s => s.getTabs)
  const setTab = useTabStore((s) => s.setTab)
  const setTabs = useTabStore((s) => s.setTabs)

  // create initial tabs for the group if they don't exist
  useEffect(() => {
    initTabs(groupId)
  }, [groupId, initTabs])

  const setGroupsTab = useCallback(
    (tabs: ITab[]) => {
      setTabs(groupId, tabs)
    },
    [groupId, setTabs]
  )

  const setGroupTab = useCallback(
    (tab: number | string) => {
      setTab(groupId, tab)
    },
    [groupId, setTab]
  )

  //return { setTab: setGroupTab, tabIndex: tabIndex ?? -1 }
  return {
    tab,
    tabs: tabState.tabs,
    selectedTabIndex: tabState.selectedTabIndex,
    setTab: setGroupTab,
    setTabs: setGroupsTab,
  }
}

interface ITabsContext {
  tabs: Record<string, ITabGroup>
  getTabs: (id: string) => ITabGroup
  setTabs: (id: string, tabs: ITab[]) => void
  setTab: (id: string, tab: number | string) => void
}

export const TabsContext = createContext<ITabsContext>({
  tabs: {},
  getTabs: (id: string) => ({ ...DEFAULT_TAB_GROUP, id }),
  setTabs: () => {},
  setTab: () => {},
})

export const useTabContext = () => {
  const ctx = useContext(TabsContext)
  if (!ctx) {
    throw new Error('useTabContext must be used within a TabContext.Provider')
  }
  return ctx
}

export function useTabs(id: string) {
  const { getTabs, setTabs, setTab } = useTabContext()

  id = id ?? DEFAULT_GROUP_ID

  const tabState = useMemo(() => getTabs(id), [id, getTabs])

  const tab = useMemo(
    () =>
      tabState.tabs.length > 0
        ? tabState.tabs[tabState.selectedTabIndex ?? 0]
        : undefined,
    [tabState]
  )

  const setGroupsTab = useCallback(
    (tabs: ITab[]) => {
      setTabs(id, tabs)
    },
    [id, setTabs]
  )

  const setGroupTab = useCallback(
    (tab: number | string) => {
      setTab(id, tab)
    },
    [id, setTab]
  )

  //return { setTab: setGroupTab, tabIndex: tabIndex ?? -1 }
  return {
    tab,
    tabs: tabState.tabs,
    selectedTabIndex: tabState.selectedTabIndex,
    setTab: setGroupTab,
    setTabs: setGroupsTab,
  }
}

export const TOOLBAR_TABS = 'toolbar'

export function useToolbarTabs() {
  return useTabs(TOOLBAR_TABS)
}

export const OPTS_SIDEBAR_ID = 'opts-sidebar'

export function useSideTabs() {
  return useTabs(OPTS_SIDEBAR_ID)
}

export function TabProvider({ children }: IChildrenProps) {
  const [tabs, setTabs] = useState<Record<string, ITabGroup>>({})

  const getTabs = useCallback(
    (id: string) => {
      //if (id in tabs) {
      return tabs[id] ?? { ...DEFAULT_TAB_GROUP, id }
    },
    [tabs]
  )

  const _setTabs = useCallback((id: string, tabs: ITab[]) => {
    setTabs((prev) => {
      let currentTab = prev[id] ?? { ...DEFAULT_TAB_GROUP, id }

      return {
        ...prev,
        [id]: { ...currentTab, tabs, selectedTabIndex: 0 },
      }
    })
  }, [])

  const _setTab = useCallback((id: string, tab: number | string) => {
    setTabs((prev) => {
      let currentTab = prev[id] ?? { ...DEFAULT_TAB_GROUP, id }

      let index = 0

      if (typeof tab === 'number') {
        index = tab
      } else if (typeof tab === 'string') {
        const lt = tab.toLowerCase()

        const idx = currentTab.tabs.findIndex(
          (t) => t.id.toLowerCase() === lt || t.name?.toLowerCase() === lt
        )
        if (idx !== -1) {
          index = idx
        }
      }

      // don't update the state if the selected tab index hasn't changed
      if (index === currentTab.selectedTabIndex) {
        return prev
      }

      return {
        ...prev,
        [id]: {
          id,
          tabs: currentTab.tabs,
          selectedTabIndex: index,
        },
      }
    })
  }, [])

  return (
    <TabsContext.Provider
      value={{
        tabs,
        getTabs,
        setTabs: _setTabs,
        setTab: _setTab,
      }}
    >
      {children}
    </TabsContext.Provider>
  )
}
