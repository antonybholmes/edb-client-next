import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import type { IPaintProps, IStrokeProps } from '@/components/plot/svg-props'
import { PropsPanel } from '@/components/props-panel'
import { MenuSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
import { PropRow } from '@/dialogs/prop-row'
import { VerticalGripIcon } from '@/icons/vertical-grip-icon'
import { VCenterRow } from '@/layout/v-center-row'
import { capitalCase } from '@/lib/text/capital-case'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  SubAccordion,
} from '@/themed/v2/accordion'
import { produce } from 'immer'
import { Reorder } from 'motion/react'
import { useHistory } from '../../history/history-provider/history-provider'
import { useBoxPlotContext } from './boxplot-provider'

export function BoxPlotDataPanel() {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  const { updatePlot } = useHistory()

  const { plot } = useBoxPlotContext()

  const singlePlotDisplayOptions = plot.singlePlotDisplayOptions as {
    [key: string]: {
      [key: string]: {
        [key: string]: { stroke: IStrokeProps; fill: IPaintProps }
      }
    }
  }

  const xOrder: string[] = plot.xOrder as string[]
  const hueOrder: string[] = plot.hueOrder as string[]
  const typeOrder = ['violin', 'box', 'swarm']

  //const [typeTabs, setTypeTabs] = useState(typeOrder)
  //const [xTabs, setXTabs] = useState<string[]>([])
  //const [hueTabs, setXTabs] = useState<string[]>([])

  return (
    <PropsPanel>
      <p className="font-semibold py-1">X-Axis Order</p>
      <Reorder.Group
        axis="y"
        values={xOrder}
        onReorder={(order: unknown) => {
          updatePlot(
            produce(plot, (draft) => {
              draft.xOrder = order as string[]
            })
          )
        }}
      >
        {xOrder.map((item: string) => (
          <Reorder.Item
            key={item}
            value={item}
            className="flex flex-row items-center gap-x-4 px-2 py-2 rounded-theme trans-color hover:bg-muted"
          >
            <VCenterRow className="cursor-ns-resize">
              <VerticalGripIcon className="bg-foreground/50" />
            </VCenterRow>

            <span>{item}</span>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      <MenuSeparator />

      {hueOrder.length > 1 && (
        <>
          <p className="font-semibold py-1">Hue Order</p>
          <Reorder.Group
            axis="y"
            values={hueOrder}
            onReorder={(order: unknown) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.hueOrder = order as string[]
                })
              )
            }}
          >
            {hueOrder.map((item: string) => (
              <Reorder.Item
                key={item}
                value={item}
                className="flex flex-row items-center gap-x-4 px-2 py-2 rounded-theme trans-color hover:bg-muted"
              >
                <VCenterRow className="cursor-ns-resize">
                  <VerticalGripIcon className="bg-foreground/50" />
                </VCenterRow>

                <span className="grow">{item}</span>
              </Reorder.Item>
            ))}
          </Reorder.Group>
          <MenuSeparator />
        </>
      )}

      <SubAccordion value={[]}>
        {typeOrder.map((t) => (
          <AccordionItem value={t} key={t}>
            <AccordionTrigger>{capitalCase(t)}</AccordionTrigger>
            <AccordionContent>
              <SubAccordion value={[]}>
                {xOrder.map((x) => (
                  <AccordionItem value={x} key={x}>
                    <AccordionTrigger>{x}</AccordionTrigger>
                    <AccordionContent>
                      <SubAccordion value={[]}>
                        {hueOrder.map((hue) => (
                          <AccordionItem value={hue} key={hue}>
                            <AccordionTrigger>
                              {capitalCase(hue)}
                            </AccordionTrigger>
                            <AccordionContent>
                              <PropRow title="Stroke">
                                {/* <NumericalInput
                                  value={
                                    singlePlotDisplayOptions[x]![hue]![t]!
                                      .stroke.width
                                  }
                                  placeholder="Stroke..."
                                  className="w-14 rounded-theme"
                                  onNumChanged={v => {
                                    plotsDispatch({
                                      type: 'update-custom-prop',
                                      id: plot.id,
                                      name: 'singlePlotDisplayOptions',
                                      prop: {
                                        ...singlePlotDisplayOptions,
                                        [x]: {
                                          ...singlePlotDisplayOptions[x]!,
                                          [hue]: {
                                            ...singlePlotDisplayOptions[x]![
                                              hue
                                            ]!,
                                            [t]: {
                                              ...singlePlotDisplayOptions[x]![
                                                hue
                                              ]![t]!,
                                              stroke: {
                                                ...singlePlotDisplayOptions[x]![
                                                  hue
                                                ]![t]!.stroke,
                                                width: v,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    })
                                  }}
                                /> */}

                                <ColorPickerButton
                                  align="end"
                                  colors={[
                                    {
                                      color:
                                        singlePlotDisplayOptions[x]![hue]![t]!
                                          .stroke.value,

                                      onColorChange: (color) =>
                                        updatePlot(
                                          produce(plot, (draft) => {
                                            ;(
                                              draft.singlePlotDisplayOptions as any
                                            )[x]![hue]![t]!.stroke.value = color
                                          })
                                        ),
                                    },
                                  ]}
                                  className={SIMPLE_COLOR_EXT_CLS}
                                  title="Border Color"
                                />
                              </PropRow>

                              <PropRow title="Fill">
                                <ColorPickerButton
                                  align="end"
                                  colors={[
                                    {
                                      color:
                                        singlePlotDisplayOptions[x]![hue]![t]!
                                          .fill.value,
                                      onColorChange: (color) =>
                                        updatePlot(
                                          produce(plot, (draft) => {
                                            ;(
                                              draft.singlePlotDisplayOptions as any
                                            )[x]![hue]![t]!.fill.color = color
                                          })
                                        ),
                                    },
                                  ]}
                                  className={SIMPLE_COLOR_EXT_CLS}
                                  title="Border Color"
                                />
                              </PropRow>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </SubAccordion>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </SubAccordion>
            </AccordionContent>
          </AccordionItem>
        ))}
      </SubAccordion>
    </PropsPanel>
  )
}
