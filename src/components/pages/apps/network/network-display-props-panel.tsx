import { PropsPanel } from '@/components/props-panel'
import { NumSlider } from '@/components/shadcn/ui/themed/v2/num-slider'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { produce } from 'immer'
import { useNetworkSettings } from './network-settings-store'

export function NetworkDisplayPropsPanel() {
  const { settings, updateSettings } = useNetworkSettings()

  return (
    <PropsPanel>
      <ScrollAccordion
        value={['plot', 'nodes', 'edges', 'statistics', 'bubbles', 'size']}
      >
        <AccordionItem value="nodes">
          <AccordionTrigger>Nodes</AccordionTrigger>
          <AccordionContent>
            <NumSlider
              min={0}
              max={1}
              step={0.01}
              dp={2}
              value={settings.plot.nodes.scale}
              onNumChange={(value) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.scale = value
                  })
                )
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="edges">
          <AccordionTrigger>Edges</AccordionTrigger>
          <AccordionContent>
            <NumSlider
              min={0}
              max={20}
              step={0.01}
              dp={2}
              value={settings.plot.edges.scale}
              onNumChange={(value) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.edges.scale = value
                  })
                )
              }
            />
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
