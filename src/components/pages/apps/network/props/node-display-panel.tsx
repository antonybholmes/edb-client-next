import { useEffect } from 'react'

import { BaseCol } from '@/components/layout/base-col'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { useTabs } from '@/components/tabs/tab-provider'
import { OutlookTabs } from '../../matcalc/data/outlook-tabs'
import { GroupPropsPanel } from './group-props-panel'
import { NodesDisplayPropsPanel } from './nodes-display-props-panel'

// export function GroupingPropsPanel() {
//   const { id } = useResizableSidebarContext()

//   const { setTabs } = useTabs(id)

//   useEffect(() => {
//     setTabs([
//       {
//         id: 'Groups',
//         component: GroupPropsPanel,
//       },
//       { id: 'Gene Sets', component: GenesetPropsPanel },
//     ])
//   }, [setTabs])

//   return <SideBarTabs />
// }

const ID = 'node-props-panel'

export function NodePropsPanel() {
  //const { id } = useResizableSidebarContext()
  const { selectedTab, setTabs } = useTabs(ID)

  useEffect(() => {
    setTabs([
      {
        id: 'nodes',
        name: 'Nodes',
      },
      { id: 'groups', name: 'Groups' },
    ])
  }, [setTabs])

  return (
    <BaseCol className="grow gap-y-2">
      {/* <UnderlineTabs groupId={id} tabListCls="gap-x-3" className="text-xs">
        <TabIndicatorFollowH />
        <TabIndicatorSelectedH />
      </UnderlineTabs> */}

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
        {/* <TabsList className="py-1">
        <TabsTrigger value="genesets" className="grow" variant="sidebar">
          Gene Sets
        </TabsTrigger>
        <TabsTrigger value="display" className="grow" variant="sidebar">
          Display
        </TabsTrigger>
      </TabsList> */}
      </Tabs>

      <OutlookTabs id={ID} className="border-t border-border/50 py-2" />
    </BaseCol>
  )
}
