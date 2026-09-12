import { BaseCol } from '@/components/layout/base-col'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { useTabs } from '@/components/tabs/tab-provider'
import { Move3D, SlidersHorizontal } from 'lucide-react'
import { useEffect } from 'react'
import { OutlookTabs } from '../../../matcalc/data/outlook-tabs'
import { ExtGseaDisplayPropsPanel } from './ext-gsea-display-props-panel'
import { GseaGraphAxesPropsPanel } from './gsea-graph-axes-props-panel'

const ID = 'ext-gsea-view-props-panel'

export function ExtGseaViewPropsPanel() {
  const { selectedTab, setTabs } = useTabs(ID)

  useEffect(() => {
    setTabs([
      {
        id: 'display',
        name: 'Display',
        icon: <SlidersHorizontal strokeWidth={2} size={18} />,
      },
      {
        id: 'axes',
        name: 'Axes',
        icon: <Move3D strokeWidth={2} size={18} />,
      },
    ])
  }, [setTabs])

  return (
    <BaseCol className="grow gap-y-2">
      <Tabs
        orientation="vertical"
        value={selectedTab?.id ?? ''}
        onValueChange={() => {}}
        className="grow"
      >
        <TabsContent value="display">
          <ExtGseaDisplayPropsPanel />
        </TabsContent>
        <TabsContent value="axes">
          <GseaGraphAxesPropsPanel />
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

      <OutlookTabs id={ID} className="border-t border-border/50 py-2" />
    </BaseCol>
  )
}
