import { useContext } from 'react'
import { TabContext } from './tab-provider'

export function TabContentPanel() {
  const { selectedTab } = useContext(TabContext)!

  if (!selectedTab.tab.content) {
    return null
  }

  return <>{selectedTab.tab.content}</>
}
