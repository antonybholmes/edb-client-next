import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { PropRow } from '@/components/dialogs/prop-row'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { VCenterRow } from '@/components/layout/v-center-row'
import { FontPopover } from '@/components/plot/font/font-popover'
import { StrokeButton } from '@/components/plot/stroke-dropdown-menu'
import { PropsPanel } from '@/components/props-panel'
import { Button } from '@/components/shadcn/ui/themed/v2/button'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { NumSlider } from '@/components/shadcn/ui/themed/v2/num-slider'
import { PercentSlider } from '@/components/shadcn/ui/themed/v2/percent-slider'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { RunningIndicator } from '@/components/toolbar/running-indicator'
import { TEXT_APPLY } from '@/consts'
import { getCmapFromColorMap, getColorMap } from '@/lib/color/colormap'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { produce } from 'immer'
import { useState } from 'react'
import { RadiusScaleModeSelectList } from '../../matcalc/apps/heatmap/props-panel/radius-scale-mode-selectlist'
import { ColorMapMenu } from '../../matcalc/color-map-menu'
import { POSITIONS, useNetworkSettings } from '../network-settings-store'
import { useNetwork, useNetworkSim } from '../network-store'
import { FieldSelectList } from './field-select-list'

export function NetworkDisplayPropsPanel() {
  const { settings, updateSettings } = useNetworkSettings()
  const { network } = useNetwork()
  const { run } = useNetworkSim()
  const [message, setMessage] = useState('')

  return (
    <PropsPanel>
      <ScrollAccordion
        value={[
          'layout',
          'plot',
          'nodes',
          'edges',
          'statistics',
          'bubbles',
          'size',
        ]}
      >
        <AccordionItem value="layout">
          <AccordionTrigger>Layout</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Distance">
              <NumSlider
                min={0}
                max={200}

                value={settings.layout.linkDistance}
                onNumChanged={(value) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.layout.linkDistance = value
                    })
                  )
                }
              />
            </PropRow>
            <PropRow title="Charge">
              <NumSlider
                min={-100}
                max={100}

                value={settings.layout.chargeStrength}
                onNumChanged={(value) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.layout.chargeStrength = value
                    })
                  )
                }
              />
            </PropRow>
            {/* <CheckPropRow
              title="Use Edge Strength"
              checked={settings.layout.useStrength}
              onCheckedChange={(checked) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.layout.useStrength = checked
                  })
                )
              }
            /> */}

            <VCenterRow className="gap-x-2">
              <Button
                variant="app-theme"
                onClick={() => {
                  setMessage('Creating graph...')
                  run(network, () => setMessage(''))
                }}
              >
                {TEXT_APPLY}
              </Button>
              <RunningIndicator message={message} />
            </VCenterRow>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Size">
              <DoubleNumericalInput
                h="sm"
                w="xs"
                v1={settings.plot.size.w}
                placeholder="Width"
                limit={[1, 5000]}
                dp={0}
                onNumChanged1={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.size.w = v
                    })
                  )
                }}
                v2={settings.plot.size.h}
                onNumChanged2={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.size.h = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Border">
              <StrokeButton
                colors={[
                  {
                    color: settings.plot.border.value,
                    show: settings.plot.border.show,
                    onColorChange: ({ color, show }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.plot.border.value = color
                          draft.plot.border.show = show
                        })
                      ),
                  },
                ]}
              />
            </PropRow>
            <CheckPropRow
              title="Clamp"
              tooltip="Nodes will be clamped within the plot boundaries."
              checked={settings.plot.nodes.clamp}
              onCheckedChange={(checked) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.clamp = checked
                  })
                )
              }
            />
            <CheckPropRow
              title="Clip"
              tooltip="Clip nodes at the plot boundaries."
              checked={settings.plot.nodes.clip}
              onCheckedChange={(checked) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.nodes.clip = checked
                  })
                )
              }
            />
            <CheckPropRow
              title="Auto Fit"
              checked={settings.plot.autoFit}
              onCheckedChange={(checked) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plot.autoFit = checked
                  })
                )
              }
            ></CheckPropRow>

            <PropRow title="Scale">
              <NumSlider
                min={0}
                max={5}
                step={0.1}
                dp={1}

                value={settings.plot.scale}
                onNumChanged={(value) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.scale = value
                    })
                  )
                }
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="nodes">
          <AccordionTrigger>Nodes</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Radius">
              <NumSlider
                min={0}
                max={200}
                //step={0.1}
                //dp={1}
                value={settings.plot.nodes.radius}
                onNumChanged={(value) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.nodes.radius = value
                    })
                  )
                }
              />
            </PropRow>
            <PropRow title="Scale Mode">
              <RadiusScaleModeSelectList
                value={settings.plot.nodes.scale.mode}
                onValueChange={(value) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.nodes.scale.mode = value
                    })
                  )
                }
              />
            </PropRow>
            {/* <PropRow title="Scale">
              <NumSlider
                min={0}
                max={1}
                step={0.01}
                dp={2}
                value={settings.plot.nodes.scale}
                onNumChanged={(value) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.nodes.scale = value
                    })
                  )
                }
              />
            </PropRow> */}
            <PropRow title="Opacity">
              <PercentSlider
                min={0}
                max={1}
                step={0.01}
                //dp={2}
                value={settings.plot.nodes.color.opacity}
                onNumChanged={(value) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.nodes.color.opacity = value
                    })
                  )
                }
              />
            </PropRow>
            <PropRow title="Hidden Opacity">
              <PercentSlider
                min={0}
                max={1}
                step={0.01}
                //dp={2}
                value={settings.plot.nodes.view.hidden.opacity}
                onNumChanged={(value) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.nodes.view.hidden.opacity = value
                    })
                  )
                }
              />
            </PropRow>
            <PropRow title="Colormap">
              <ColorMapMenu
                cmap={getColorMap(settings.plot.nodes.color.cmap)}

                onChange={(cmap) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.nodes.color.cmap = getCmapFromColorMap(cmap)
                    })
                  )
                }
              />
            </PropRow>
            <PropRow title="Line">
              <Checkbox
                checked={settings.plot.nodes.line.autoColor}
                onCheckedChange={(checked) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.nodes.line.autoColor = checked
                    })
                  )
                }
              >
                Auto Color
              </Checkbox>
              <StrokeButton
                colors={[
                  {
                    color: settings.plot.nodes.line.value,
                    show: settings.plot.nodes.line.show,
                    onColorChange: ({ color, show }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.plot.nodes.line.value = color
                          draft.plot.nodes.line.show = show
                        })
                      ),
                  },
                ]}
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

              <SelectList
                items={POSITIONS}
                value={settings.plot.nodes.labels.position}
                onValueChange={(value) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.plot.nodes.labels.position = value as
                        'left' | 'center' | 'right' | 'below' | 'above'
                    })
                  )
                }}
                w="xs"
                variant="toolbar"
              >
                {POSITIONS.map((position) => (
                  <SelectItem key={position.value} value={position.value}>
                    {position.label}
                  </SelectItem>
                ))}
              </SelectList>
            </PropRow>

            <PropRow title="Field">
              <FieldSelectList />
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
                onNumChanged={(value) =>
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
