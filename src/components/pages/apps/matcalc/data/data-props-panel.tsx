import { BaseCol } from '@/components/layout/base-col'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { useResizableSidebarContext } from '@/components/sidebar/resizable-sidebar'
import { TabIndicatorFollowH } from '@/components/tabs/tab-indicator-follow-h'
import { TabIndicatorSelectedH } from '@/components/tabs/tab-indicator-selected-h'
import { useTabs } from '@/components/tabs/tab-provider'
import { UnderlineTabs } from '@/components/tabs/underline-tabs'
import { Filter, Group } from 'lucide-react'
import { useEffect } from 'react'
import { FilterPropsPanel } from './filter-props-panel'
import { GroupingPropsPanel } from './grouping-props-panel'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function DataPropsPanel() {
  const { id } = useResizableSidebarContext()

  const { selectedTab, setTabs } = useTabs(id)

  useEffect(() => {
    setTabs([
      {
        id: 'groups',
        name: 'Groups',
        icon: <Group strokeWidth={2} size={18} />,
      },
      {
        id: 'filter',
        name: 'Filter',
        icon: <Filter strokeWidth={2} size={18} />,
      },
    ])
  }, [setTabs])

  return (
    <BaseCol className="grow gap-y-2">
      <UnderlineTabs groupId={id} className="text-xs" tabListCls="gap-x-3">
        <TabIndicatorFollowH />
        <TabIndicatorSelectedH />
      </UnderlineTabs>

      <Tabs
        value={selectedTab?.id ?? ''}
        //orientation="vertical"
        className="grow"
      >
        <TabsContent value="groups" className="grow">
          <GroupingPropsPanel />
        </TabsContent>

        <TabsContent value="filter" className="grow">
          <FilterPropsPanel />
        </TabsContent>
        {/* <TabsList className="gap-y-px">
          <TabsTrigger value="groups" className="grow" variant="sidebar">
            Groups
          </TabsTrigger>

          <TabsTrigger value="filter" className="grow" variant="sidebar">
            Filter
          </TabsTrigger>
        </TabsList> */}
      </Tabs>
      {/* <OutlookTabs id="matcalc-data-props-panel" /> */}
    </BaseCol>
  )
}
