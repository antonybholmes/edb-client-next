import { PropsPanel } from '@/components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { useDialogs } from '@/components/dialogs/dialogs'
import { NumericalPropRow } from '@/components/dialogs/numerical-prop-row'
import { PropRow } from '@/components/dialogs/prop-row'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { FontPopover } from '@/components/plot/font/font-popover'
import { LinkButton } from '@/components/shadcn/ui/themed/link-button'
import { PercentSlider } from '@/components/shadcn/ui/themed/v2/percent-slider'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { Slider } from '@/components/shadcn/ui/themed/v2/slider'
import { SideBarHeader } from '@/components/sidebar/resizable-sidebar'
import { TEXT_OK, TEXT_RESET } from '@/consts'
import { produce } from 'immer'
import { useSankeySettings } from '../sankey-settings-store'

export function PlotPropsPanel() {
  const { open: openDialog } = useDialogs()

  const { settings, updateSettings, resetSettings } = useSankeySettings()

  return (
    <PropsPanel>
      <SideBarHeader>
        <LinkButton
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: 'Reset settings',
                content: 'Are you sure you want to reset all Sankey settings?',
                callback: (response) => {
                  if (response === TEXT_OK) {
                    resetSettings()
                  }
                },
              },
            })
          }}
          title="Reset Properties to Defaults"
          className="text-xs"
        >
          {TEXT_RESET}
        </LinkButton>
      </SideBarHeader>
      <ScrollAccordion value={['nodes', 'links']}>
        <AccordionItem value="nodes">
          <AccordionTrigger
            rightChildren={
              <FontPopover
                fonts={[
                  {
                    textProps: settings.nodes.labels.font,
                    showRotation: true,
                    update: (f) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.nodes.labels.font = f
                        })
                      ),
                    ext: (
                      <PropRow title="Position">
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
                          w="sm"
                        >
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="top">Top</SelectItem>
                          <SelectItem value="bottom">Bottom</SelectItem>
                        </SelectList>
                      </PropRow>
                    ),
                  },
                ]}
              />
            }
          >
            Nodes
          </AccordionTrigger>
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
              title="Width"
              limit={[1, 1000]}
              value={settings.nodes.width}
              onNumChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.nodes.width = value
                  })
                )
              }}
            />

            <PropRow title="Rounding">
              {' '}
              <span className="text-alt-foreground">
                {settings.nodes.rounding}
              </span>
              <Slider
                value={settings.nodes.rounding}
                min={0}
                max={100}
                //format={(v) => v.toString()}
                onValueChange={(value: number | readonly number[]) => {
                  const newValue = Array.isArray(value) ? value[0]! : value
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.nodes.rounding = newValue
                    })
                  )
                }}
                step={1}
                //className="w-20"
              />
            </PropRow>
            <PropRow
              title="Oversize"
              tooltip="Allow nodes to be larger than their links"
            >
              <span className="text-alt-foreground">
                {settings.nodes.oversize}
              </span>
              <Slider
                value={settings.nodes.oversize}
                min={0}
                max={100}
                //format={(v) => v.toString()}
                onValueChange={(value: number | readonly number[]) => {
                  const newValue = Array.isArray(value) ? value[0]! : value
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.nodes.oversize = newValue
                    })
                  )
                }}
                step={1}
              />
            </PropRow>
            <NumericalPropRow
              title="Gap"
              limit={[0, 1000]}
              value={settings.nodes.gap}
              onNumChange={(value) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.nodes.gap = value
                  })
                )
              }}
            />

            <PropRow title="Opacity">
              <PercentSlider
                value={settings.nodes.opacity}
                min={0}
                max={1}
                onValueChange={(value: number | readonly number[]) => {
                  const newValue = Array.isArray(value) ? value[0]! : value
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.nodes.opacity = newValue
                    })
                  )
                }}
                step={0.05}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="links">
          <AccordionTrigger
            rightChildren={
              <FillButton
                colors={[
                  {
                    color: settings.links.color,
                    opacity: settings.links.opacity,
                    onColorChange: ({ color, opacity }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.links.color = color
                          draft.links.opacity = opacity ?? 1
                        })
                      )
                    },
                  },
                ]}

                title="Links Fill"
              />
            }
          >
            Links
          </AccordionTrigger>
          <AccordionContent>
            <PropRow title="Color Mode">
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

                w="sm"
              >
                <SelectItem value="gradient">Gradient</SelectItem>
                <SelectItem value="static">Static</SelectItem>
                <SelectItem value="source">Source</SelectItem>
                <SelectItem value="target">Target</SelectItem>
              </SelectList>
            </PropRow>
            <PropRow title="Opacity">
              <PercentSlider
                value={settings.links.opacity}
                min={0}
                max={1}
                onValueChange={(value: number | readonly number[]) => {
                  const newValue = Array.isArray(value) ? value[0]! : value
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.links.opacity = newValue
                    })
                  )
                }}
                step={0.05}
              />
            </PropRow>
            <PropRow title="Gradient Offset">
              <PercentSlider
                value={settings.links.gradientOffset}
                min={0}
                max={1}
                onValueChange={(value: number | readonly number[]) => {
                  const newValue = Array.isArray(value) ? value[0]! : value
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.links.gradientOffset = newValue
                    })
                  )
                }}
                step={0.05}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
