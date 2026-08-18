import { BaseCol } from '@/components/layout/base-col'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { TabIndicatorFollowH } from '@/components/tabs/tab-indicator-follow-h'
import { TabIndicatorSelectedH } from '@/components/tabs/tab-indicator-selected-h'
import { useTabs } from '@/components/tabs/tab-provider'
import { UnderlineTabs } from '@/components/tabs/underline-tabs'
import { List, SlidersHorizontal } from 'lucide-react'
import { useEffect } from 'react'
import { GeneSetsPropsPanel } from './geneset-props-panel'
import { GseaDisplayPropsPanel } from './gsea-display-props-panel'

const ID = 'gsea-plot-props-panel'

export function GseaPropsPanel() {
  const { selectedTab, setTabs } = useTabs(ID)

  useEffect(() => {
    setTabs([
      {
        id: 'genesets',
        name: ' Gene Sets',
        icon: <List strokeWidth={2} size={18} />,
      },
      {
        id: 'display',
        name: 'Display',
        icon: <SlidersHorizontal strokeWidth={2} size={18} />,
      },
    ])
  }, [setTabs])

  return (
    <BaseCol className="grow">
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
        <TabsContent value="genesets">
          <GeneSetsPropsPanel />
        </TabsContent>
        <TabsContent value="display">
          <GseaDisplayPropsPanel />
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
