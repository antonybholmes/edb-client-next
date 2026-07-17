import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { useEffect } from 'react'

import { BaseCol } from '@/components/layout/base-col'
import { useTabs } from '@/components/tabs/tab-provider'
import { OutlookTabs } from '../../matcalc/data/outlook-tabs'
import { ClinicalPropsPanel } from './clinical-props-panel'
import { GenePropsPanel } from './genes-props-panel'
import { VariantPropsPanel } from './variant-props-panel'

// const TAB_CLS =
//   'w-4.5 stroke-foreground/75 group-hover:stroke-foreground group-data-[selected=true]:stroke-foreground'

export function FeaturePropsPanel() {
  const { selectedTab, setTabs } = useTabs('oncoplot-feature-props-panel')

  useEffect(() => {
    setTabs([
      {
        id: 'genes',
        name: 'Genes',
      },
      {
        id: 'variants',
        name: 'Variants',
      },
      {
        id: 'clinical',
        name: 'Clinical',
      },
    ])
  }, [setTabs])

  return (
    <BaseCol className="grow">
      <Tabs
        orientation="vertical"
        className="grow"
        value={selectedTab?.id ?? ''}
      >
        <TabsContent value="genes">
          <GenePropsPanel />
        </TabsContent>
        <TabsContent value="variants">
          <VariantPropsPanel />
        </TabsContent>
        <TabsContent value="clinical">
          <ClinicalPropsPanel />
        </TabsContent>
        {/* <TabsList className="py-1 gap-y-px">
          <TabsTrigger value="genes" className="grow" variant="sidebar">
            Genes
          </TabsTrigger>
          <TabsTrigger value="variants" className="grow" variant="sidebar">
            Variants
          </TabsTrigger>

          <TabsTrigger value="clinical" className="grow" variant="sidebar">
            Clinical
          </TabsTrigger>
        </TabsList> */}
      </Tabs>
      <OutlookTabs
        id="oncoplot-feature-props-panel"
        className="border-t border-border/50 py-2"
      />
    </BaseCol>
  )
}
