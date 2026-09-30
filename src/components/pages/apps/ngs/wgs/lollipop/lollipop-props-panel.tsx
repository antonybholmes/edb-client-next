import { BaseCol } from '@/components/layout/base-col'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { TabIndicatorFollowH } from '@/components/tabs/tab-indicator-follow-h'
import { TabIndicatorSelectedH } from '@/components/tabs/tab-indicator-selected-h'
import { useTabs } from '@/components/tabs/tab-provider'
import { UnderlineTabs } from '@/components/tabs/underline-tabs'
import { useEffect } from 'react'
import { FeaturePropsPanel } from './feature-props-panel'
import { LollipopDisplayPropsPanel } from './lollipop-display-props-panel'

const ID = 'lollipop-plot-props-panel'

export function LollipopPropsPanel() {
  const { selectedTab, setTabs } = useTabs(ID)

  useEffect(() => {
    setTabs([
      {
        id: 'display',
        name: 'Display',
      },
      {
        id: 'features',
        name: 'Features',
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
        <TabsContent value="display">
          <LollipopDisplayPropsPanel />
        </TabsContent>
        <TabsContent value="features">
          <FeaturePropsPanel />
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
