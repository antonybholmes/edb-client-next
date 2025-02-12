import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color-picker-button'
import { VerticalGripIcon } from '@/components/icons/vertical-grip-icon'
import { VCenterRow } from '@/components/layout/v-center-row'
import { IFillProps, IStrokeProps } from '@/components/plot/svg-props'
import { PropRow } from '@/components/prop-row'
import { MenuSeparator } from '@/components/shadcn/ui/themed/dropdown-menu'
import { capitalCase } from '@/lib/text/capital-case'
import {
  getPlotFromAddr,
  HistoryContext,
  type IHistItemAddr,
} from '@/providers/history-provider'
import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  SubAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { Reorder } from 'motion/react'
import { forwardRef, useContext, type ForwardedRef } from 'react'

export interface IProps {
  plotAddr: IHistItemAddr
}

export const BoxPlotDataPanel = forwardRef(function BoxPlotDataPanel(
  { plotAddr }: IProps,
  _ref: ForwardedRef<HTMLDivElement>
) {
  //const { plotsState, plotsDispatch } = useContext(PlotsContext)

  const { history, historyDispatch } = useContext(HistoryContext)

  const plot = getPlotFromAddr(plotAddr, history)!

  const singlePlotDisplayOptions = plot.customProps
    .singlePlotDisplayOptions as {
    [key: string]: {
      [key: string]: {
        [key: string]: { stroke: IStrokeProps; fill: IFillProps }
      }
    }
  }

  const xOrder: string[] = plot.customProps.xOrder as string[]
  const hueOrder: string[] = plot.customProps.hueOrder as string[]
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
          historyDispatch({
            type: 'update-custom-prop',
            addr: plotAddr,
            name: 'xOrder',
            prop: order,
          })
        }}
      >
        {xOrder.map((item: string) => (
          <Reorder.Item
            key={item}
            value={item}
            className="flex flex-row items-center gap-x-4 px-2 py-2 rounded-theme trans-color hover:bg-muted"
          >
            <VCenterRow className="cursor-ns-resize">
              <VerticalGripIcon w="h-5" className="bg-foreground/50" />
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
              historyDispatch({
                type: 'update-custom-prop',
                addr: plotAddr,
                name: 'hueOrder',
                prop: order,
              })
            }}
          >
            {hueOrder.map((item: string) => (
              <Reorder.Item
                key={item}
                value={item}
                className="flex flex-row items-center gap-x-4 px-2 py-2 rounded-theme trans-color hover:bg-muted"
              >
                <VCenterRow className="cursor-ns-resize">
                  <VerticalGripIcon w="h-5" className="bg-foreground/50" />
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
                                  color={
                                    singlePlotDisplayOptions[x]![hue]![t]!
                                      .stroke.color
                                  }
                                  onColorChange={(color) =>
                                    historyDispatch({
                                      type: 'update-custom-prop',
                                      addr: plotAddr,
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
                                                ]!.stroke,
                                                color,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    })
                                  }
                                  className={SIMPLE_COLOR_EXT_CLS}
                                  title="Change border color"
                                />
                              </PropRow>

                              <PropRow title="Fill">
                                <ColorPickerButton
                                  align="end"
                                  color={
                                    singlePlotDisplayOptions[x]![hue]![t]!.fill
                                      .color
                                  }
                                  onColorChange={(color) =>
                                    historyDispatch({
                                      type: 'update-custom-prop',
                                      addr: plotAddr,
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
                                              fill: {
                                                ...singlePlotDisplayOptions[x]![
                                                  hue
                                                ]!.fill,
                                                color,
                                              },
                                            },
                                          },
                                        },
                                      },
                                    })
                                  }
                                  className={SIMPLE_COLOR_EXT_CLS}
                                  title="Change border color"
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
})
