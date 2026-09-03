'use client'

import { useVennSettings } from '@/components/pages/apps/venn/venn-settings-store'
import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { HeatmapPropsPanel } from '../matcalc/apps/heatmap/props-panel/heatmap-props-panel'
import { VennSettingsPropsPanel } from './venn-settings-props-panel'

export function SettingsPropsPanel() {
  const { settings } = useVennSettings()

  return (
    <Tabs value={settings.view.tab} onValueChange={() => {}} className="grow">
      <TabsContent value="venn">
        <VennSettingsPropsPanel />
      </TabsContent>
      <TabsContent value="heatmap">
        <HeatmapPropsPanel />
      </TabsContent>
    </Tabs>
  )
}
