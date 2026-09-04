import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { GseaGraphAxesPropsPanel } from './gsea-graph-axes-props-panel'
import { useGseaSettings } from './gsea-settings-store'

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
