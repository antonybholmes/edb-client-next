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
import { getColorMap } from '@/lib/color/colormap'
import { numSort } from '@/lib/math/math'
import { produce } from 'immer'
import { ColorMapMenu } from '../../color-map-menu'
import { useHistory } from '../../history/history-provider/history-provider'
import { useGseaDotContext } from './gsea-dot-provider'

export function GseaDotPropsPanel() {
  const { updatePlot } = useHistory()

  const { plot } = useGseaDotContext()

  const displayProps = plot.props

  return (
    <PropsPanel>
      <ScrollAccordion value={['plot', 'p-value', 'size']}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Width">
              <NumericalInput
                value={displayProps.axes.xaxis.length}

                limit={[1, 1000]}
                dp={0}
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.axes.xaxis.length = v
                    })
                  )
                }}
              />
            </PropRow>

            <NumericalPropRow
              title="Row Height"
              value={displayProps.axes.yaxis.rowHeight}
              onNumChanged={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.axes.yaxis.rowHeight = v
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
                dp={0}
                limit={[-10000, 10000]}
                w="xxs"
                onNumChanged1={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.axes.xaxis.domain = [
                        v,
                        draft.props.axes.xaxis.domain[1],
                      ]
                    })
                  )
                }}
                onNumChanged2={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.axes.xaxis.domain = [
                        draft.props.axes.xaxis.domain[0],
                        v,
                      ]
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Border">
              <FillButton
                colors={[
                  {
                    color: displayProps.border.value,
                    show: displayProps.border.show,
                    onColorChange: ({ color, show }) =>
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.border.value = color
                          draft.props.border.show = show
                        })
                      ),
                  },
                ]}
              />
            </PropRow>

            <PropRow title="Left Margin">
              <NumericalInput
                value={displayProps.margin.left}

                limit={[1, 1000]}
                dp={0}
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.margin.left = v
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="p-value">
          <AccordionTrigger>P-value</AccordionTrigger>
          <AccordionContent>
            <TextPropRow
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
            />

            <PropRow title="Max">
              <NumericalInput
                id="size"
                value={displayProps.p.range[1]}
                placeholder="Size..."
                dp={0}
                limit={[1, 1000]}
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.p.range[1] = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Colormap">
              <ColorMapMenu
                align="end"
                cmap={getColorMap(displayProps.p.cmap)} // COLOR_MAPS[settings.cmap]!}
                onChange={(cmap) => {
                  // store the cmap the user likes
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.p.cmap = cmap.name
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="size">
          <AccordionTrigger>Size</AccordionTrigger>
          <AccordionContent>
            <TextPropRow
              title="Label"
              value={displayProps.size.label}
              onTextChange={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.size.label = v
                  })
                )
              }}
              w="md"
            />

            <PropRow title="Dot Radius">
              <NumericalInput
                id="size"
                value={displayProps.dots.size}
                placeholder="Size..."
                dp={0}
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.dots.size = v
                    })
                  )
                }}
              />

              {/* <FillButton
                colors={[
                  {
                    color: displayProps.dots.color,
                    onColorChange: ({ color }) =>
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.dots.color = color
                        })
                      ),
                  },
                ]}
              /> */}
            </PropRow>

            <PropRow title="Max">
              <NumericalInput
                id="size"
                value={displayProps.size.maxSize}
                placeholder="Size..."
                dp={0}
                limit={[1, 1000]}
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.size.maxSize = v
                    })
                  )
                }}
              />
            </PropRow>

            <TextPropRow
              title="Legend"
              value={displayProps.legend.dots.sizes.join(', ')}
              onTextChanged={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.legend.dots.sizes = numSort(
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
