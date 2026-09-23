import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { PropRow } from '@/components/dialogs/prop-row'
import { FontPopover } from '@/components/plot/font/font-popover'
import { StrokeButton } from '@/components/plot/stroke-dropdown-menu'
import { PropsPanel } from '@/components/props-panel'
import { NumSlider } from '@/components/shadcn/ui/themed/v2/num-slider'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { produce } from 'immer'
import { useNetworkSettings } from '../network-settings-store'

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
            <PropRow title="Scale">
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
            </PropRow>
            <PropRow title="Opacity">
              <NumSlider
                min={0}
                max={1}
                step={0.01}
                dp={2}
                value={settings.plot.nodes.color.opacity}
                onNumChange={(value) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.nodes.color.opacity = value
                    })
                  )
                }
              />
            </PropRow>
            <PropRow title="Labels">
              <FontPopover
                fonts={[
                  {
                    title: 'Font',
                    textProps: settings.plot.nodes.labels.text,
                    update: (textProps) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.plot.nodes.labels.text = Object.assign(
                            { ...settings.plot.nodes.labels.text },
                            textProps
                          )
                        })
                      ),
                    ext: (
                      <CheckPropRow
                        title="Use colors"
                        className="ml-0.5 mt-1"

                        checked={settings.plot.nodes.labels.color.on}
                        onCheckedChange={(state) =>
                          updateSettings(
                            produce(settings, (draft) => {
                              draft.plot.nodes.labels.color.on = state
                            })
                          )
                        }
                      />
                    ),
                  },
                ]}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="edges">
          <AccordionTrigger>Edges</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Scale">
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
            </PropRow>

            <PropRow title="Line">
              <StrokeButton
                colors={[
                  {
                    color: settings.plot.edges.line.value,
                    show: settings.plot.edges.line.show,
                    onColorChange: ({ color, show }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.plot.edges.line.value = color
                          draft.plot.edges.line.show = show
                        })
                      ),
                  },
                ]}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
