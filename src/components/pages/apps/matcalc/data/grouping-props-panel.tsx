import { useEffect } from 'react'

import { useResizableSidebarContext } from '@/components/sidebar/resizable-sidebar'
import { SideBarTabs } from '@/components/sidebar/tab-slide-bar'
import { useTabs } from '@/components/tabs/tab-provider'
import { GenesetPropsPanel } from '../genesets/geneset-props-panel'
import { GroupPropsPanel } from '../groups/group-props-panel'

export function GroupingPropsPanel() {
  const { id } = useResizableSidebarContext()

  const { setTabs } = useTabs(id)

  useEffect(() => {
    setTabs([
      {
        id: 'Groups',
        component: GroupPropsPanel,
      },
      { id: 'Gene Sets', component: GenesetPropsPanel },
    ])
  }, [setTabs])

  return <SideBarTabs />
}
