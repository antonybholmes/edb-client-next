import {
  useCallback,
  useEffect,
  useMemo
} from 'react'
import { create } from 'zustand'
import { DEFAULT_GROUP_ID, DEFAULT_TAB_GROUP, ITab, ITabGroup } from './tab-provider'



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

