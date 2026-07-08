import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'

import { BaseCol } from '@/components/layout/base-col'
import { useTabs } from '@/components/tabs/tab-provider'
import { useEffect } from 'react'
import { OutlookTabs } from '../../matcalc/data/outlook-tabs'
import { ColormapPropsPanel } from './colormap-props-panel'
import { PileupPropsPanel } from './pileup-props-panel'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function FeaturePropsPanel() {
  const { selectedTab, setTabs } = useTabs('wgs-variants-feature-props-panel')

  useEffect(() => {
    setTabs([
      {
        id: 'features',
        name: 'Features',
      },
      {
        id: 'colormap',
        name: 'Colormap',
      },
    ])
  }, [setTabs])

  return (
    <BaseCol className="grow">
      <Tabs
        orientation="vertical"
        value={selectedTab?.id ?? ''}
        className="grow"
      >
        <TabsContent value="features">
          <PileupPropsPanel />
        </TabsContent>

        <TabsContent value="colormap">
          <ColormapPropsPanel />
        </TabsContent>

        {/* <TabsList className="py-1">
          <TabsTrigger value="colormap" className="grow" variant="sidebar">
            Colormap
          </TabsTrigger>
        </TabsList> */}
      </Tabs>
      <OutlookTabs id="wgs-variants-feature-props-panel" />
    </BaseCol>
  )
}
