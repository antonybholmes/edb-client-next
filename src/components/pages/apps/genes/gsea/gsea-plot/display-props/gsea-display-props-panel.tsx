import { Tabs, TabsContent } from '@/components/shadcn/ui/themed/v2/tabs'
import { GseaBubbleDisplayPropsPanel } from '../bubble/gsea-bubble-display-props-panel'
import { useGseaSettings } from '../gsea-settings-store'
import { GseaPlotDisplayPropsPanel } from './gsea-plot-display-props-panel'

export function GseaDisplayPropsPanel() {
  const { settings } = useGseaSettings()

  return (
    <Tabs value={settings.view.tab} onValueChange={() => {}} className="grow">
      <TabsContent value="graph">
        <GseaPlotDisplayPropsPanel />
      </TabsContent>
      <TabsContent value="bubble">
        <GseaBubbleDisplayPropsPanel />
      </TabsContent>
    </Tabs>
  )
}
