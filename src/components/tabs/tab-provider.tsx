import type { UndefStr } from '@/lib/text/text'
import { ComponentType, type ReactNode } from 'react'

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
  component?: ComponentType<{}>
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

export type TabChange = (selectedTab: ISelectedTab) => void

export interface ITabChange {
  onTabChange?: TabChange | undefined
}

export interface ITabProvider extends ITabChange {
  value?: string
  tabs?: ITab[]
}

export interface ITabContext extends ITabChange {
  value: string
  selectedTab: ISelectedTab | null
  tabs: ITab[]
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
