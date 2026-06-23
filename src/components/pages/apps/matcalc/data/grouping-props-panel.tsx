import { useEffect } from 'react'

import { useResizableSidebarContext } from '@/components/slide-bar/resizable-sidebar'
import { SideBarTabs } from '@/components/slide-bar/tab-slide-bar'
import { useTabs } from '@/components/tabs/tab-store'
import { GenesetPropsPanel } from '../genesets/geneset-props-panel'
import { GroupPropsPanel } from '../groups/group-props-panel'

export function GroupingPropsPanel() {
  //const [activeId, setActiveId] = useState<string | null>(null)

  const { id } = useResizableSidebarContext()

  const { selectedTabIndex, setTabs } = useTabs(id)

  console.log(selectedTabIndex)

  useEffect(() => {
    const tabs = [
      {
        id: 'Groups',
        content: <GroupPropsPanel />,
      },
      { id: 'Gene Sets', content: <GenesetPropsPanel /> },
    ]

    setTabs(tabs)
  }, [])

  return <SideBarTabs />
}
