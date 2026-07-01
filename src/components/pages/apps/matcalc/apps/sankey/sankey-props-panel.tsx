import { PropsPanel } from '@/components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { NumericalPropRow } from '@/components/dialogs/numerical-prop-row'
import { PropRow } from '@/components/dialogs/prop-row'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { FontPopover } from '@/components/plot/font/font-popover'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { produce } from 'immer'
import { useSankeySettings } from './sankey-settings-store'

export function SankeyPropsPanel() {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { settings, updateSettings } = useSankeySettings()

  return (
    <PropsPanel>
      <ScrollAccordion value={['plot', 'nodes', 'links']}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Size">
              <DoubleNumericalInput
                v1={settings.width}
                v2={settings.height}
                onNumChange1={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.width = v
                    })
                  )
                }}
                onNumChange2={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.height = v
                    })
                  )
                }}
                dp={0}
                limit={[100, 2000]}
              />
            </PropRow>

            <NumericalPropRow
              value={settings.optimization.steps}
              onNumChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.optimization.steps = value
                  })
                )
              }}
              title="Iterations"
            />

            <CheckPropRow
              checked={settings.optimization.on}
              onCheckedChange={(checked) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.optimization.on = checked
                  })
                )
              }}
              title="Optimize Layout"
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="nodes">
          <AccordionTrigger>Nodes</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Shape">
              <SelectList
                items={[
                  { value: 'rect', label: 'Rectangle' },
                  { value: 'circle', label: 'Circle' },
                ]}
                value={settings.nodes.shape}
                onValueChange={(value) => {
                  const shape = value as 'rect' | 'circle'
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.nodes.shape = shape
                    })
                  )
                }}
                w="sm"
              >
                <SelectItem value="rect">Rectangle</SelectItem>
                <SelectItem value="circle">Circle</SelectItem>
              </SelectList>
            </PropRow>
            <NumericalPropRow
              title="Rounding"
              limit={[0, 100]}
              value={settings.nodes.rounding}
              onNumChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.nodes.rounding = value
                  })
                )
              }}
            />
            <PropRow title="Labels">
              <FontPopover
                fonts={[
                  {
                    textProps: settings.nodes.labels.font,
                    update: (f) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.nodes.labels.font = f
                        })
                      ),
                  },
                ]}
              />
              <SelectList
                items={[
                  { value: 'left', label: 'Left' },
                  { value: 'right', label: 'Right' },
                  { value: 'center', label: 'Center' },
                  { value: 'top', label: 'Top' },
                  { value: 'bottom', label: 'Bottom' },
                ]}
                value={settings.nodes.labels.position}
                onValueChange={(value) => {
                  const position = value as
                    'left' | 'right' | 'center' | 'top' | 'bottom'
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.nodes.labels.position = position
                    })
                  )
                }}
                w="xs"
              >
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="right">Right</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="top">Top</SelectItem>
                <SelectItem value="bottom">Bottom</SelectItem>
              </SelectList>
            </PropRow>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="links">
          <AccordionTrigger>Links</AccordionTrigger>
          <AccordionContent>
            <NumericalPropRow
              value={settings.links.opacity}
              limit={[0, 1]}
              dp={1}
              step={0.1}
              onNumChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.links.opacity = value
                  })
                )
              }}
              title="Opacity"
            />
            <PropRow title="Color">
              <SelectList
                items={[
                  { value: 'gradient', label: 'Gradient' },
                  { value: 'static', label: 'Static' },
                  { value: 'source', label: 'Source' },
                  { value: 'target', label: 'Target' },
                ]}
                value={settings.links.colorMode}
                onValueChange={(value) => {
                  const color = value as
                    'gradient' | 'static' | 'source' | 'target'
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.links.colorMode = color
                    })
                  )
                }}

                w="xs"
              >
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="static">Static</SelectItem>
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="target">Target</SelectItem>
              </SelectList>
            </PropRow>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
