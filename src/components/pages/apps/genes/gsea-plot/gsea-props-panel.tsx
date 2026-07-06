import { BaseCol } from '@/components/layout/base-col'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { useTabs } from '@/components/tabs/tab-provider'
import { useEffect } from 'react'
import { OutlookTabs } from '../../matcalc/data/outlook-tabs'
import { GeneSetsPropsPanel } from './geneset-props-panel'
import { GseaDisplayPropsPanel } from './gsea-display-props-panel'

export function GseaPropsPanel() {
  const { selectedTab, setTabs } = useTabs('gsea-plot-props-panel')

  useEffect(() => {
    setTabs([
      {
        id: 'genesets',
        name: ' Gene Sets',
      },
      {
        id: 'display',
        name: 'Display',
      },
    ])
  }, [setTabs])

  return (
    <BaseCol className="grow">
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

      <OutlookTabs id="gsea-plot-props-panel" />
    </BaseCol>
  )
}
