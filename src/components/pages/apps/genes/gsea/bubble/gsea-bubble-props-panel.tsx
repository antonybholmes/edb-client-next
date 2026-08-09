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

import { NumericalPropRow } from '@/components/dialogs/numerical-prop-row'
import { TextPropRow } from '@/components/dialogs/text-prop-row'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { PercentSlider } from '@/components/shadcn/ui/themed/v2/percent-slider'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { TEXT_SORT_BY } from '@/consts'
import { ColorMapName, getColorMap } from '@/lib/color/colormap'
import { numSort } from '@/lib/math/math'
import { round } from '@/lib/math/round'
import { produce } from 'immer'
import { ColorMapMenu } from '../../../matcalc/color-map-menu'
import { useHistory } from '../../../matcalc/history/history-provider/history-provider'
import { SORT_BY_ITEMS } from './gsea-bubble-dialog'
import { useGseaBubbleContext } from './gsea-bubble-provider'
import { SortBy, useGseaBubbleSettings } from './gsea-bubble-settings-store'
import { MarginPopover } from './margin-popover'

export function GseaBubblePropsPanel() {
  const { updatePlot } = useHistory()
  const { settings, updateSettings } = useGseaBubbleSettings()

  const { plot } = useGseaBubbleContext()

  if (!plot) {
    return null
  }

  const displayProps = plot.props

  return (
    <PropsPanel>
      <ScrollAccordion value={['plot', 'p-value', 'bubble', 'size']}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Width">
              <NumericalInput
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
              />
            </PropRow>

            <NumericalPropRow
              title="Row Height"
              value={settings.axes.y.rowHeight}
              onNumChanged={(v) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.axes.y.rowHeight = v
                  })
                )
              }}
            />

            <PropRow title="X-axis">
              <DoubleNumericalInput
                id="x-limit"
                v1={displayProps.axes.xaxis.domain[0]}
                v2={displayProps.axes.xaxis.domain[1]}
                placeholder="Limit..."
                dp={1}
                limit={[-10000, 10000]}
                w="xxs"
                onNumChanged1={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.axes.xaxis.domain = [
                        v,
                        round(displayProps.axes.xaxis.domain[1], 1),
                      ]
                    })
                  )
                }}
                onNumChanged2={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.axes.xaxis.domain = [
                        round(draft.props.axes.xaxis.domain[0], 1),
                        v,
                      ]
                    })
                  )
                }}
              >
                <span>to</span>
              </DoubleNumericalInput>
            </PropRow>

            <PropRow title="Border">
              <FillButton
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
            </PropRow>

            <PropRow title="Margins">
              {/* <NumericalInput
                value={settings.margin.left}

                limit={[1, 1000]}
                dp={0}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.margin.left = v
                    })
                  )
                }}
              /> */}

              <MarginPopover />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="p-value">
          <AccordionTrigger>P-value</AccordionTrigger>
          <AccordionContent>
            {/* <TextPropRow
              title="Label"
              value={displayProps.p.label}
              onTextChange={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.p.label = v
                  })
                )
              }}
              w="md"
            /> */}

            <PropRow title="Max">
              <NumericalInput
                id="size"
                value={settings.p.range[1]}
                placeholder="Size..."
                dp={0}
                limit={[1, 1000]}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.p.range[1] = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Colormap">
              <ColorMapMenu
                align="end"
                cmap={getColorMap(settings.p.cmap)} // COLOR_MAPS[settings.cmap]!}
                onChange={(cmap) => {
                  // store the cmap the user likes
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.p.cmap = cmap.id as ColorMapName
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="bubble">
          <AccordionTrigger>Bubbles</AccordionTrigger>
          <AccordionContent>
            <PropRow title={TEXT_SORT_BY}>
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
