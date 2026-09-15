import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'

import { useGseaSettings } from '../gsea-settings-store'
import { GseaGraphAxesPropsPanel } from './gsea-graph-axes-props-panel'

export function GseaAxesPropsPanel() {
  const { settings } = useGseaSettings()

  return (
    <Tabs value={settings.view.tab} onValueChange={() => {}} className="grow">
      <TabsContent value="graph">
        <GseaGraphAxesPropsPanel />
      </TabsContent>
      <TabsContent value="bubble">
        {/* <GseaBubbleDisplayPropsPanel /> */}
      </TabsContent>
    </Tabs>
  )
}
