import { BaseCol } from '@/components/layout/base-col'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { useTabs } from '@/components/tabs/tab-provider'
import { useEffect } from 'react'
import { SidebarTabs } from '../../matcalc/data/sidebar-tabs'
import { DomainPropsPanel } from './domain-props-panel'
import { LabelPropsPanel } from './label-props-panel'
import { VariantPropsPanel } from './variant-props-panel'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function FeaturePropsPanel() {
  const { selectedTab, setTabs } = useTabs('lollipop-feature-props-panel')

  useEffect(() => {
    setTabs([
      {
        id: 'domains',
        name: 'Domains',
      },
      {
        id: 'variants',
        name: 'Variants',
      },
      {
        id: 'labels',
        name: 'Labels',
      },
    ])
  }, [setTabs])

  return (
    <BaseCol className="grow">
      <Tabs
        value={selectedTab?.id ?? ''}
        orientation="vertical"
        className="grow"
      >
        <TabsContent value="domains">
          <DomainPropsPanel />
        </TabsContent>
        <TabsContent value="variants">
          <VariantPropsPanel />
        </TabsContent>
        <TabsContent value="labels">
          <LabelPropsPanel />
        </TabsContent>
        {/* <TabsList className="py-1">
          <TabsTrigger value="domains" className="grow" variant="sidebar">
            Domains
          </TabsTrigger>
          <TabsTrigger value="variants" className="grow" variant="sidebar">
            Variants
          </TabsTrigger>

          <TabsTrigger value="labels" className="grow" variant="sidebar">
            Labels
          </TabsTrigger>
        </TabsList> */}
      </Tabs>

      <SidebarTabs id="lollipop-feature-props-panel" />
    </BaseCol>
  )
}
