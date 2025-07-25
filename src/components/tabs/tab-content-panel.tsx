import { useContext } from 'react'
import { TabContext } from './tab-provider'

export function TabContentPanel() {
  const { selectedTab } = useContext(TabContext)!

  return <>{selectedTab && selectedTab.tab.content}</>
}
