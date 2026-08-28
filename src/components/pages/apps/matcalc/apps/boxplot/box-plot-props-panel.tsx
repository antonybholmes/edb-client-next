import { BaseCol } from '@/components/layout/base-col'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { TabIndicatorFollowH } from '@/components/tabs/tab-indicator-follow-h'
import { TabIndicatorSelectedH } from '@/components/tabs/tab-indicator-selected-h'
import { useTabs } from '@/components/tabs/tab-provider'
import { UnderlineTabs } from '@/components/tabs/underline-tabs'
import { Filter, SlidersHorizontal } from 'lucide-react'
import { useEffect } from 'react'
import { BoxPlotDataPanel } from './boxplot-data-panel'
import { BoxPlotDisplayPropsPanel } from './boxplot-display-props-panel'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function BoxPlotPropsPanel() {
  const { selectedTab, setTabs } = useTabs('matcalc-box-plot-panel')
  //const [value, setValue] = useState('groups')

  useEffect(() => {
    setTabs([
      {
        id: 'data',
        name: 'Data',
        icon: <Filter strokeWidth={2} size={18} />,
      },
      {
        id: 'display',
        name: 'Display',
        icon: <SlidersHorizontal strokeWidth={2} size={18} />,
      },
    ])
  }, [setTabs])

  return (
    <BaseCol className="grow gap-y-2 mb-2">
      <UnderlineTabs
        groupId="matcalc-box-plot-panel"
        tabListCls="gap-x-3"
        className="text-xs"
      >
        <TabIndicatorFollowH />
        <TabIndicatorSelectedH />
      </UnderlineTabs>
      <Tabs
        value={selectedTab?.id ?? ''}
        orientation="vertical"
        className="grow"
      >
        <TabsContent value="display" className="grow">
          <BoxPlotDisplayPropsPanel />
        </TabsContent>

        <TabsContent value="data" className="grow">
          <BoxPlotDataPanel />
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
      {/* <OutlookTabs id="matcalc-box-plot-panel" /> */}
    </BaseCol>
  )
}
