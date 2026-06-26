import { IChildrenProps } from '@/interfaces/children-props'
import type { UndefStr } from '@/lib/text/text'
import {
  ComponentType,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

export type NodeType = 'folder' | 'file'
export type OpenState = boolean | 'auto'

export interface ITab {
  //showChildren?: 'always' | 'auto' | 'never'
  // The id should be a unique identifier for the tab
  id: string
  path?: string
  // Can be used as alternative name, for instance if the id is a uuid,
  // name can be something more human friendly
  //isGroup?: boolean
  name?: string
  description?: string
  type?: string
  //tab?: ReactNode
  icon?: ReactNode
  // alternative icon when tab is open
  openIcon?: ReactNode
  //showIcon?: boolean
  render?: () => ReactNode
  component?: ComponentType<{}> | ReactNode
  //component?: ComponentType<{}>
  data?: unknown
  size?: number
  isOpen?: OpenState
  closable?: boolean
  // control if this tab represents a folder in a tree structure
  //nodeType?: NodeType
  onDelete?: () => void
  onClick?: () => void
  checked?: boolean
  //onCheckedChange?: (state: boolean) => void
  children?: ITab[]
  createdAt?: string | number | Date
}

export interface IUrlTab extends ITab {
  url?: string
}

export interface ISelectedTab {
  index: number
  tab: ITab
}

export const DEFAULT_GROUP_ID = 'default'

export interface ITabGroup {
  id: string
  tabs: ITab[]
  selectedTabIndex: number
}

export const DEFAULT_TAB_GROUP: ITabGroup = {
  id: DEFAULT_GROUP_ID,
  tabs: [],
  selectedTabIndex: 0,
}

export type TabChange = (selectedTab: ISelectedTab) => void

export interface ITabChange {
  onTabChange?: TabChange | undefined
}

// export interface ITabContext extends ITabProvider, ITabChange {

// }

// export interface ITabProviderProps extends ITabContext {
//   value?: string
// }

// export function getTabId(tab?: ITab): string {
//   return tab?.id ?? tab?.name ?? ''
// }

/**
 * Returns the user friendly name for a tab. If a tab only has an id
 * it will return the id. If the tab has an optional name, this will
 * be returned in preference to the id.
 *
 * @param tab
 * @returns
 */
export function getTabName(tab: ITab): string {
  //console.log(tab)
  return tab?.name ?? tab.id ?? ''
}

/**
 * Sets the displayed tab. Internally tabs are represented with ids
 * consisting of <tab name>:<tab zero based index>. Value can be either
 * the full tab id, or the more human readable tab name. For example the
 * Home tab might match to Home:0 so when setting which tab to display, we
 * must cope with being given both Home and Home:0, hence this function.
 *
 * @param value a name of a tab
 * @param tabs a list of tabs
 * @param setValue component's setValue function to control which tab is shown.
 * @returns
 */
export function getTabFromValue(
  value: UndefStr,
  tabs: ITab[]
): ISelectedTab | null {
  // if no tabs {return undefined}
  if (tabs.length === 0) {
    return null
  }

  // no value specified, default to first tab
  if (!value) {
    return null
  }

  let selectedTab = tabs
    .entries()
    .map(([ti, tab]) => ({ index: ti, tab }))
    .find((t) => {
      return t.tab.id.includes(value) || t.tab.name?.includes(value)
    })

  if (!selectedTab) {
    // default to first tab if there is an error
    selectedTab = { index: 0, tab: tabs[0]! } //undefined
  }

  return selectedTab
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

  const selectedTab = useMemo(
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

  return {
    selectedTab,
    tabs: tabState.tabs,
    selectedTabIndex: tabState.selectedTabIndex,
    setTab: setGroupTab,
    setTabs: setGroupsTab,
  }
}

export const TOOLBAR_TABS = 'toolbar'

export function useToolbarTabs(id: string = TOOLBAR_TABS) {
  return useTabs(id)
}

export const OPTS_SIDEBAR_ID = 'opts-sidebar'

export function useSideTabs(id: string = OPTS_SIDEBAR_ID) {
  return useTabs(id)
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

      console.log('set tab', id, tab, index)

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
