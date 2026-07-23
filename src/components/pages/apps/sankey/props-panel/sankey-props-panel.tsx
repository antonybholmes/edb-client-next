import { BaseCol } from '@/components/layout/base-col'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { useTabs } from '@/components/tabs/tab-provider'
import { useEffect } from 'react'
import { OutlookTabs } from '../../matcalc/data/outlook-tabs'
import { LinkPropsPanel } from './link-props-panel'
import { NodePropsPanel } from './node-props-panel'
import { PlotPropsPanel } from './plot-props-panel'

export function SankeyPropsPanel() {
  const { selectedTab, setTabs } = useTabs('sankey-props-panel')

  useEffect(() => {
    setTabs([
      {
        id: 'plot',
        name: 'Plot',
      },
      {
        id: 'nodes',
        name: 'Nodes',
      },
      {
        id: 'links',
        name: 'Links',
      },
    ])
  }, [setTabs])

  return (
    <BaseCol className="grow">
      <Tabs
        orientation="vertical"
        className="grow"
        value={selectedTab?.id ?? ''}
        onValueChange={() => {}}
      >
        <TabsContent value="plot">
          <PlotPropsPanel />
        </TabsContent>
        <TabsContent value="nodes">
          <NodePropsPanel />
        </TabsContent>
        <TabsContent value="links">
          <LinkPropsPanel />
        </TabsContent>

        {/* <TabsList>
        <TabsTrigger value="plot" className="grow" variant="sidebar">
          Plot
        </TabsTrigger>
        <TabsTrigger value="nodes" className="grow" variant="sidebar">
          Nodes
        </TabsTrigger>
        <TabsTrigger value="links" className="grow" variant="sidebar">
          Links
        </TabsTrigger>
      </TabsList> */}
      </Tabs>

      <OutlookTabs id="sankey-props-panel" />
    </BaseCol>
  )
}
