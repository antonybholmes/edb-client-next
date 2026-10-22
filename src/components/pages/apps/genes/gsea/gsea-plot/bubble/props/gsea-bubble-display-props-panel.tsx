import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { PropRow } from '@/dialogs/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/baseui/accordion'
import { NumericalInput } from '@/themed/numerical-input'

import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { TextPropRow } from '@/components/dialogs/text-prop-row'
import { CollapseIcon } from '@/components/icons/collapse-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { RadiusScaleModeSelectList } from '@/components/pages/apps/heatmap/props-panel/radius-scale-mode-selectlist'

import { AxesDisplayPropsPopover } from '@/components/plot/axes/props/axes-groups-popover'
import { FontPopover } from '@/components/plot/font/font-popover'
import { StrokeButton } from '@/components/plot/stroke-dropdown-menu'
import { NumSlider } from '@/components/shadcn/ui/themed/baseui/num-slider'
import { PercentSlider } from '@/components/shadcn/ui/themed/baseui/percent-slider'
import {
  SelectItem,
  SelectList,
} from '@/components/shadcn/ui/themed/baseui/select'
import { SmallSwitch } from '@/components/shadcn/ui/themed/baseui/small-switch'
import { IconButton } from '@/components/shadcn/ui/themed/icon-button'
import { TEXT_SORT } from '@/consts'
import { ColorMapName, getColorMap } from '@/lib/color/colormap'
import { numSort } from '@/lib/math/math'
import { round } from '@/lib/math/round'
import { produce } from 'immer'
import { useState } from 'react'
import { ColorMapMenu } from '../../../../../matcalc/color-map-menu'
import { SORT_BY_ITEMS } from '../../../bubble/gsea-bubble-dialog'
import { useGseaBubbleContext } from '../gsea-bubble-provider'
import {
  Mode,
  MODE_ITEMS,
  SortBy,
  useGseaBubbleSettings,
} from '../gsea-bubble-settings'
import { MarginPopover } from './margin-popover'

const TABS = ['plot', 'style', 'statistics', 'bubbles', 'size', 'groups']

export function GseaBubbleDisplayPropsPanel() {
  const { settings, updateSettings } = useGseaBubbleSettings()
  const { plots } = useGseaBubbleContext()
  const [collapsed, setCollapsed] = useState(false)
  const [openTabs, setOpenTabs] = useState(TABS)

  const axes = plots
    .map((p) => ({
      id: p.id,
      title: p.name,
      groups: [
        {
          id: 'nes',
          title: 'NES',
          axes: [{ id: 'x', title: 'X' }],
        },
      ],
    }))
    .concat({
      id: 'cbar',
      title: 'Color Bar',
      groups: [
        {
          id: 'cbar',
          title: 'Color Bar',
          axes: [{ id: 'cbar', title: 'Color Bar Axis' }],
        },
      ],
    })

  return (
    <>
      <VCenterRow className="gap-x-2 justify-end">
        <IconButton
          size="icon-xs"

          onClick={() => {
            setOpenTabs(collapsed ? TABS : [])
            setCollapsed(!collapsed)
          }}
          title={collapsed ? 'Expand All' : 'Collapse All'}
        >
          <CollapseIcon collapsed={collapsed} size={14} />
        </IconButton>
      </VCenterRow>
      <ScrollAccordion value={openTabs} onValueChange={setOpenTabs}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Size" contentCls="gap-x-2">
              <MarginPopover />
              <DoubleNumericalInput
                id="size"
                v1={settings.axes.x.length}
                v2={settings.axes.y.rowHeight}
                placeholder="Size..."
                h="toolbar"
                dp={0}
                inc={1}
                limit={[1, 1000]}
                w="xxs"
                onNumChanged1={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.axes.x.length = v
                    })
                  )
                }}
                onNumChanged2={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.axes.y.rowHeight = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Layout" contentCls="gap-x-2">
              <StrokeButton
                title="Border"
                colors={[
                  {
                    color: settings.border.value,
                    show: settings.border.show,
                    width: settings.border.width,
                    dasharray: settings.border.dasharray,
                    onColorChange: ({ color, show, width, dasharray }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.border.value = color
                          draft.border.show = show
                          draft.border.width = width
                          draft.border.dasharray = dasharray
                        })
                      ),
                  },
                ]}
              />

              <NumericalInput
                h="toolbar"
                title="Grid Cols"
                value={settings.page.grid.cols}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.page.grid.cols = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Axes">
              <AxesDisplayPropsPopover plots={axes} />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="style">
          <AccordionTrigger>Style</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Mode">
              <SelectList
                variant="toolbar"
                items={MODE_ITEMS}
                onValueChange={(v) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.scale.mode = v as Mode
                    })
                  )
                }
                value={settings.scale.mode}
                w="sm"
              >
                {MODE_ITEMS.map((item) => (
                  <SelectItem value={item.value} key={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectList>
            </PropRow>
            <CheckPropRow
              title="Merge Phenotypes"
              checked={settings.phenotypes.merge}
              onCheckedChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.phenotypes.merge = v
                  })
                )
              }}
            />

            <PropRow title="Colormap">
              <ColorMapMenu
                cmap={getColorMap(settings.scale.cmap)}
                onChange={(cmap) => {
                  // store the cmap the user likes
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.scale.cmap = cmap.id as ColorMapName
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="statistics">
          <AccordionTrigger>Statistics</AccordionTrigger>
          <AccordionContent>
            <CheckPropRow
              title="Auto NES"
              checked={settings.axes.x.auto}
              onCheckedChange={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.axes.x.auto = v
                  })
                )
              }}
            />
            <PropRow title="NES Limit">
              <DoubleNumericalInput
                h="toolbar"
                id="x-limit"
                v1={settings.axes.x.domain[0]}
                v2={settings.axes.x.domain[1]}
                placeholder="Limit..."
                disabled={settings.axes.x.auto}
                dp={1}
                limit={[-10000, 10000]}
                w="xxs"
                onNumChanged1={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.axes.x.domain = [
                        v,
                        round(settings.axes.x.domain[1], 1),
                      ]
                    })
                  )
                }}
                onNumChanged2={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.axes.x.domain = [
                        round(draft.axes.x.domain[0], 1),
                        v,
                      ]
                    })
                  )
                }}
              >
                <span>to</span>
              </DoubleNumericalInput>
            </PropRow>
            <PropRow title="Max P-value">
              <NumericalInput
                id="size"
                h="toolbar"
                value={settings.scale.p.range[1]}
                placeholder="Size..."
                dp={0}
                limit={[1, 1000]}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.scale.p.range[1] = v
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bubbles">
          <AccordionTrigger>Bubbles</AccordionTrigger>
          <AccordionContent>
            <PropRow title={TEXT_SORT}>
              <SelectList
                variant="toolbar"
                items={SORT_BY_ITEMS}
                onValueChange={(v) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.sortBy = v as SortBy
                    })
                  )
                }
                value={settings.sortBy}
                w="sm"
              >
                {SORT_BY_ITEMS.map((item) => (
                  <SelectItem value={item.value} key={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectList>
            </PropRow>
            <PropRow title="Radius">
              <NumSlider
                value={settings.bubbles.size}

                min={1}
                max={100}
                step={1}

                onValueChange={(values) => {
                  const v = Array.isArray(values) ? values[0] : values

                  const newSettings = produce(settings, (draft) => {
                    draft.bubbles.size = v
                  })

                  updateSettings(newSettings)
                }}
              />
              {/* <NumericalInput
                id="size"
                value={settings.bubbles.size}
                placeholder="Size..."
                dp={0}

                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.bubbles.size = v
                    })
                  )
                }}
              /> */}
            </PropRow>
            <PropRow title="Scale Mode">
              <RadiusScaleModeSelectList
                value={settings.bubbles.scale.mode}
                onValueChange={(value) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.bubbles.scale.mode = value
                    })
                  )
                }
              />
            </PropRow>
            <PropRow title="Opacity">
              <PercentSlider
                value={settings.bubbles.fill.opacity}
                disabled={false}
                min={0}
                max={1}
                step={0.05}

                onValueChange={(values) => {
                  const v = Array.isArray(values) ? values[0] : values

                  const newSettings = produce(settings, (draft) => {
                    draft.bubbles.fill.opacity = v
                  })

                  updateSettings(newSettings)
                }}
              />
            </PropRow>
            <PropRow title="Border">
              <StrokeButton
                colors={[
                  {
                    color: settings.bubbles.stroke.value,
                    show: settings.bubbles.stroke.show,
                    onColorChange: ({ color, show }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.bubbles.stroke.value = color
                          draft.bubbles.stroke.show = show
                        })
                      ),
                  },
                ]}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Max">
              <NumericalInput
                id="size"
                h="toolbar"
                value={settings.size.maxSize}
                placeholder="Size..."
                dp={0}
                limit={[1, 1000]}

                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.size.maxSize = v
                    })
                  )
                }}
              />
            </PropRow>

            <TextPropRow
              title="Legend"
              value={settings.legend.bubbles.sizes.join(', ')}
              onTextChanged={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.legend.bubbles.sizes = numSort(
                      v.split(',').map((x) => parseFloat(x.trim()))
                    )
                  })
                )
              }}
              w="md"
              h="toolbar"
            />

            {/* <PropRow title="Colorbar">
              <RadioGroup
                value={displayProps.colorbar.position}
                disabled={!displayProps.colorbar.show}
                onValueChange={(v) =>
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.colorbar.position = v as ColorBarPos
                    })
                  )
                }
                className="flex flex-row justify-start gap-x-1"
              >
                <SideRadioGroupItem
                  value="right"
                  title="Right"
                  currentValue={displayProps.colorbar.position}
                  disabled={!displayProps.colorbar.show}
                  className="w-5.5"
                />

                <SideRadioGroupItem
                  value="bottom"
                  title="Bottom"
                  currentValue={displayProps.colorbar.position}
                  disabled={!displayProps.colorbar.show}
                  className="w-5.5"
                />
              </RadioGroup>
            </PropRow> */}
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="groups">
          <AccordionTrigger
            leftChildren={
              <SmallSwitch
                title="Show"
                checked={settings.groups.show}
                onCheckedChange={(state) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.groups.show = state
                    })
                  )
                }
              />
            }
            rightChildren={
              <FontPopover
                fonts={[
                  {
                    title: 'Font',
                    textProps: settings.groups.font,
                    showRotation: true,
                    update: (textProps) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.groups.font = Object.assign(
                            { ...draft.groups.font },
                            textProps
                          )
                        })
                      ),
                    ext: (
                      <CheckPropRow
                        title="Auto-color"

                        checked={settings.groups.colored}
                        onCheckedChange={(state) =>
                          updateSettings(
                            produce(settings, (draft) => {
                              draft.groups.colored = state
                            })
                          )
                        }
                      />
                    ),
                  },
                ]}
              />
            }
          >
            Groups
          </AccordionTrigger>
          <AccordionContent>
            <CheckPropRow
              title="Separate Borders"
              checked={settings.groups.border.separate.on}
              onCheckedChange={(state) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.groups.border.separate.on = state
                  })
                )
              }
            />
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </>
  )
}
