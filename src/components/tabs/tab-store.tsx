// tabStore.ts
import { useCallback } from 'react'
import { create } from 'zustand'

export const DEFAULT_GROUP_ID = 'default'

export interface ITab {
  id: string
  index: number
}

type TabStore = {
  tabState: {
    //tabs: Record<string, ITab[]>
    selectedTabs: Record<string, { id: string; index: number }>
  }
  //setTabs: (groupId: string, tabs: ITab[]) => void
  setTab: (groupId: string, tab: Partial<ITab>) => void
  //getTabs: (groupId: string) => ITab[]
  //getTab: (groupId: string) => ISelectedTab | null
  getTab: (groupId: string) => ITab | undefined
}

export const useTabStore = create<TabStore>((set, get) => ({
  tabState: { tabs: {}, selectedTabs: {} },
  // setTabs: (groupId, tabs) => {
  //   console.log('setTabs', groupId, tabs)
  //   set(state => ({
  //     tabState: {
  //       ...state.tabState,
  //       tabs: { ...state.tabState.tabs, [groupId]: [...tabs] },
  //     },
  //   }))
  // },
  setTab: (groupId, tab) => {
    const { id = '', index = 0 } = tab

    set(state => ({
      ...state,
      tabState: {
        ...state.tabState,
        selectedTabs: {
          ...state.tabState.selectedTabs,
          [groupId]: { id, index },
        },
      },
    }))
  },
  // getTabs: groupId => {
  //   const tabs = get().tabState.tabs[groupId]

  //   if (tabs === undefined) {
  //     return []
  //   }

  //   return tabs ?? []
  // },
  // getTab: groupId => {
  //   const index = get().tabState.selectedTabs[groupId]

  //   if (index === undefined) {
  //     return null
  //   }

  //   const tab = get().tabState.tabs[groupId]?.[index]

  //   if (tab === undefined) {
  //     return null
  //   }

  //   return { index, tab }
  // },
  getTab: groupId => {
    const tab = get().tabState.selectedTabs[groupId]

    return tab
  },
}))

// export function useTabs(): {
//   tabState: Record<string, ISelectedTab>
//   getTab: (groupId: string) => ISelectedTab | undefined
//   setTab: (groupId: string, tabValue: ISelectedTab) => void
// } {
//   const tabState = useTabStore(state => state.tabState)

//   const getTab = useTabStore(state => state.getTab)

//   const setTab = useTabStore(state => state.setTab)

//   return { tabState, getTab, setTab }
// }

export function useTabs(groupId: string) {
  groupId = groupId ?? DEFAULT_GROUP_ID

  const tab = useTabStore(s => s.tabState.selectedTabs[groupId])
  //const getTabs = useTabStore(s => s.getTabs)
  const setTab = useTabStore(s => s.setTab)
  //const setTabs = useTabStore(s => s.setTabs)

  //const tab = useMemo(() => getTab(groupId), [groupId])

  const setGroupTab = useCallback(
    (tab: ITab) => {
      setTab(groupId, tab)
    },
    [groupId, setTab]
  )

  //return { setTab: setGroupTab, tabIndex: tabIndex ?? -1 }
  return { setTab: setGroupTab, tab }
}
