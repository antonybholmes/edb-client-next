import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { PropsPanel } from '@/components/props-panel'
import { PropRow } from '@/dialogs/prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { TextPropRow } from '@/components/dialogs/text-prop-row'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { PercentSlider } from '@/components/shadcn/ui/themed/v2/percent-slider'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { TEXT_SORT } from '@/consts'
import { ColorMapName, getColorMap } from '@/lib/color/colormap'
import { numSort } from '@/lib/math/math'
import { round } from '@/lib/math/round'
import { produce } from 'immer'
import { ColorMapMenu } from '../../../../matcalc/color-map-menu'
import { SORT_BY_ITEMS } from '../../bubble/gsea-bubble-dialog'
import { MarginPopover } from '../../bubble/margin-popover'
import { AxesPropsPopover } from './axes-props-popover'
import {
  Mode,
  MODE_ITEMS,
  SortBy,
  useGseaBubbleSettings,
} from './gsea-bubble-settings-store'

export function GseaBubbleDisplayPropsPanel() {
  const { settings, updateSettings } = useGseaBubbleSettings()

  return (
    <PropsPanel>
      <ScrollAccordion
        value={['plot', 'style', 'statistics', 'bubbles', 'size']}
      >
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Size">
              <DoubleNumericalInput
                id="size"
                v1={settings.axes.x.length}
                v2={settings.axes.y.rowHeight}
                placeholder="Size..."

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

              {/* <NumericalInput
                value={settings.axes.x.length}

                limit={[1, 1000]}
                dp={0}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      console.log('Updating x-axis length to', v)
                      draft.axes.x.length = v
                    })
                  )
                }}
              /> */}
            </PropRow>

            {/* <NumericalPropRow
              title="Row Height"
              value={settings.axes.y.rowHeight}
              onNumChanged={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.axes.y.rowHeight = v
                  })
                )
              }}
            /> */}

            <PropRow title="Layout">
              <FillButton
                title="Border"
                colors={[
                  {
                    color: settings.border.value,
                    show: settings.border.show,
                    onColorChange: ({ color, show }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.border.value = color
                          draft.border.show = show
                        })
                      ),
                  },
                ]}
              />
              <MarginPopover />

              <NumericalInput
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
              <AxesPropsPopover />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="style">
          <AccordionTrigger>Style</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Mode">
              <SelectList
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
                align="end"
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
              <NumericalInput
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
              <OutlineButton
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
      </ScrollAccordion>
    </PropsPanel>
  )
}
