import { BaseCol } from '@/components/layout/base-col'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { useTabs } from '@/components/tabs/tab-provider'
import { Filter, Group } from 'lucide-react'
import { useEffect } from 'react'
import { FilterPropsPanel } from './filter-props-panel'
import { GroupingPropsPanel } from './grouping-props-panel'
import { OutlookTabs } from './outlook-tabs'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function DataPropsPanel() {
  const { selectedTab, setTabs } = useTabs('matcalc-data-props-panel')
  //const [value, setValue] = useState('groups')

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
    <BaseCol className="grow mb-2">
      <Tabs
        value={selectedTab?.id ?? ''}
        orientation="vertical"
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
      <OutlookTabs id="matcalc-data-props-panel" />
    </BaseCol>
  )
}
