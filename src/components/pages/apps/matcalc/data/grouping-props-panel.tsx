import { useEffect } from 'react'

import { useResizableSidebarContext } from '@/components/slide-bar/resizable-sidebar'
import { SideBarTabs } from '@/components/slide-bar/tab-slide-bar'
import { ITab } from '@/components/tabs/tab-provider'
import { useTabs } from '@/components/tabs/tab-store'
import { GenesetPropsPanel } from '../genesets/geneset-props-panel'
import { GroupPropsPanel } from '../groups/group-props-panel'

export function GroupingPropsPanel() {
  const { id } = useResizableSidebarContext()

  const { setTabs } = useTabs(id)

  useEffect(() => {
    const tabs: ITab[] = [
      {
        id: 'Groups',
        component: GroupPropsPanel,
      },
      { id: 'Gene Sets', component: GenesetPropsPanel },
    ]

    setTabs(tabs)
  }, [])

  return <SideBarTabs />
}
