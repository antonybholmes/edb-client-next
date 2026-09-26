import { BaseCol } from '@/components/layout/base-col'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { TabIndicatorFollowH } from '@/components/tabs/tab-indicator-follow-h'
import { TabIndicatorSelectedH } from '@/components/tabs/tab-indicator-selected-h'
import { useTabs } from '@/components/tabs/tab-provider'
import { UnderlineTabs } from '@/components/tabs/underline-tabs'
import { useEffect } from 'react'

import { GroupPropsPanel } from './group-props-panel'
import { NetworkDisplayPropsPanel } from './network-display-props-panel'
import { NodesDisplayPropsPanel } from './nodes-display-props-panel'

const ID = 'network-props-panel'

export function NetworkPropsPanel() {
  const { selectedTab, setTabs } = useTabs(ID)

  useEffect(() => {
    setTabs([
      {
        id: 'nodes',
        name: 'Nodes',
      },
      /* {
        id: 'groups',
        name: 'Groups',
      }, */
      {
        id: 'view',
        name: 'View',
      },
    ])
  }, [setTabs])

  return (
    <BaseCol className="grow gap-y-2">
      <UnderlineTabs groupId={ID} tabListCls="gap-x-3" className="text-xs">
        <TabIndicatorFollowH />
        <TabIndicatorSelectedH />
      </UnderlineTabs>

      <Tabs
        orientation="vertical"
        value={selectedTab?.id ?? ''}
        onValueChange={() => {}}
        className="grow"
      >
        <TabsContent value="nodes">
          <NodesDisplayPropsPanel />
        </TabsContent>
        <TabsContent value="groups">
          <GroupPropsPanel />
        </TabsContent>
        <TabsContent value="view">
          <NetworkDisplayPropsPanel />
        </TabsContent>

        {/* <TabsList className="py-1">
        <TabsTrigger value="genesets" className="grow" variant="sidebar">
          Gene Sets
        </TabsTrigger>
        <TabsTrigger value="display" className="grow" variant="sidebar">
          Display
        </TabsTrigger>
      </TabsList> */}
      </Tabs>

      {/* <OutlookTabs id={ID} className="border-t border-border/50 py-2" /> */}
    </BaseCol>
  )
}
