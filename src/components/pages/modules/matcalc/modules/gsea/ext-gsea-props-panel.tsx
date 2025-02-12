import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'

import { forwardRef, useContext, useState, type ForwardedRef } from 'react'

import { VCenterRow } from '@/components/layout/v-center-row'
import { PropRow } from '@/components/prop-row'
import { Button } from '@/components/shadcn/ui/themed/button'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { SwitchPropRow } from '@/components/switch-prop-row'
import { TEXT_RESET } from '@/consts'
import {
  getPlotFromAddr,
  HistoryContext,
  type IHistItemAddr,
} from '@/providers/history-provider'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '../../../../../color-picker-button'
import {
  DEFAULT_EXT_GSEA_PROPS,
  type IExtGseaDisplayOptions,
} from '../../../gene/gsea/ext-gsea-store'

export interface IProps {
  plotAddr: IHistItemAddr
}

export const ExtGseaPropsPanel = forwardRef(function ExtGseaPropsPanel(
  { plotAddr }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  // const { plotsState, historyDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  // const prop: IExtGseaDisplayOptions =
  //   plot.displayOptions as IExtGseaDisplayOptions

  const { history, historyDispatch } = useContext(HistoryContext)

  const plot = getPlotFromAddr(plotAddr, history)!

  const displayOptions = plot.customProps
    .displayOptions as IExtGseaDisplayOptions

  const [openTabs, setOpenTabs] = useState<string[]>([
    'plot',
    'enrichment',
    'genes-in-genesets',
    'ranked-genes',
  ])

  return (
    <PropsPanel ref={ref}>
      <VCenterRow className="justify-end pb-2">
        <Button
          multiProps="link"
          onClick={() =>
            historyDispatch({
              type: 'update-custom-prop',
              addr: plotAddr,
              name: 'displayOptions',
              prop: { ...DEFAULT_EXT_GSEA_PROPS },
            })
          }
          title="Reset properties to default values"
        >
          {TEXT_RESET}
        </Button>
      </VCenterRow>
      <ScrollAccordion value={openTabs} onValueChange={setOpenTabs}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Width">
              <NumericalInput
                id="width"
                value={displayOptions.axes.x.length}
                limit={[1, 1000]}
                placeholder="Width..."
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: {
                      ...displayOptions,
                      axes: {
                        ...displayOptions.axes,
                        x: {
                          ...displayOptions.axes.x,
                          length: v,
                        },
                      },
                    },
                  })
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="enrichment">
          <AccordionTrigger>Enrichment</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Height">
              <NumericalInput
                id="height"
                value={displayOptions.es.axes.y.length}
                limit={[1, 1000]}
                placeholder="Height..."
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: {
                      ...displayOptions,
                      es: {
                        ...displayOptions.es,
                        axes: {
                          ...displayOptions.es.axes,
                          y: { ...displayOptions.es.axes.y, length: v },
                        },
                      },
                    },
                  })
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Line"
              checked={displayOptions.es.gs1.line.show}
              onCheckedChange={(state) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: {
                    ...displayOptions,
                    es: {
                      ...displayOptions.es,
                      gs1: {
                        ...displayOptions.es.gs1,
                        line: { ...displayOptions.es.gs1.line, show: state },
                      },
                      gs2: {
                        ...displayOptions.es.gs2,
                        line: { ...displayOptions.es.gs2.line, show: state },
                      },
                    },
                  },
                })
              }
            />
            <PropRow title="Stroke width" className="ml-2">
              <NumericalInput
                id="line1-stroke-width"
                value={displayOptions.es.gs1.line.width}
                disabled={!displayOptions.es.gs1.line.show}
                placeholder="Stroke..."
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: {
                      ...displayOptions,
                      es: {
                        ...displayOptions.es,
                        gs1: {
                          ...displayOptions.es.gs1,
                          line: { ...displayOptions.es.gs1.line, width: v },
                        },
                        gs2: {
                          ...displayOptions.es.gs2,
                          line: { ...displayOptions.es.gs2.line, width: v },
                        },
                      },
                    },
                  })
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Leading edge"
              checked={displayOptions.es.gs1.leadingEdge.show}
              onCheckedChange={(state) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: {
                    ...displayOptions,
                    es: {
                      ...displayOptions.es,
                      gs1: {
                        ...displayOptions.es.gs1,
                        leadingEdge: {
                          ...displayOptions.es.gs1.leadingEdge,
                          show: state,
                        },
                      },
                      gs2: {
                        ...displayOptions.es.gs2,
                        leadingEdge: {
                          ...displayOptions.es.gs2.leadingEdge,
                          show: state,
                        },
                      },
                    },
                  },
                })
              }
            ></SwitchPropRow>
            <PropRow title="Opacity" className="ml-2">
              <NumericalInput
                id="line1-leading-opacity"
                disabled={!displayOptions.es.gs1.leadingEdge.show}
                value={displayOptions.es.gs1.leadingEdge.fill.alpha}
                dp={1}
                inc={0.1}
                limit={[0, 1]}
                placeholder="Opacity..."
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: {
                      ...displayOptions,
                      es: {
                        ...displayOptions.es,
                        gs1: {
                          ...displayOptions.es.gs1,
                          leadingEdge: {
                            ...displayOptions.es.gs1.leadingEdge,
                            fill: {
                              ...displayOptions.es.gs1.leadingEdge.fill,
                              opacity: v,
                            },
                          },
                        },
                        gs2: {
                          ...displayOptions.es.gs2,
                          leadingEdge: {
                            ...displayOptions.es.gs2.leadingEdge,
                            fill: {
                              ...displayOptions.es.gs2.leadingEdge.fill,
                              opacity: v,
                            },
                          },
                        },
                      },
                    },
                  })
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        {/* <AccordionItem value="gs2">
          <AccordionTrigger>Gene Set 2</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Line"
              checked={displayOptions.es.gs2.line.show}
              onCheckedChange={state =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr, name: "displayOptions",
                  props: {
                    ...displayOptions,
                    es: {
                      ...displayOptions.es,
                      gs2: {
                        ...displayOptions.es.gs2,
                        line: { ...displayOptions.es.gs2.line, show: state },
                      },
                    },
                  },
                })
              }
            >
              <NumericalInput
                id="line2-stroke-width"
                value={displayOptions.es.gs2.line.width}
                placeholder="Stroke..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr, name: "displayOptions",
                    props: {
                      ...displayOptions,
                      es: {
                        ...displayOptions.es,
                        gs2: {
                          ...displayOptions.es.gs2,
                          line: { ...displayOptions.es.gs2.line, width: v },
                        },
                      },
                    },
                  })
                }}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Leading edge"
              checked={displayOptions.es.gs2.leadingEdge.show}
              onCheckedChange={state =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr, name: "displayOptions",
                  props: {
                    ...displayOptions,
                    es: {
                      ...displayOptions.es,
                      gs2: {
                        ...displayOptions.es.gs2,
                        leadingEdge: {
                          ...displayOptions.es.gs2.leadingEdge,
                          show: state,
                        },
                      },
                    },
                  },
                })
              }
            >
              <NumericalInput
                id="line1-leading-opacity"
                value={displayOptions.es.gs2.leadingEdge.fill.opacity}
                dp={1}
                inc={0.1}
                limit={[0, 1]}
                placeholder="Opacity..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr, name: "displayOptions",
                    props: {
                      ...displayOptions,
                      es: {
                        ...displayOptions.es,
                        gs2: {
                          ...displayOptions.es.gs2,
                          leadingEdge: {
                            ...displayOptions.es.gs2.leadingEdge,
                            fill: {
                              ...displayOptions.es.gs2.leadingEdge.fill,
                              opacity: v,
                            },
                          },
                        },
                      },
                    },
                  })
                }}
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem> */}

        <AccordionItem value="genes-in-genesets">
          <AccordionTrigger>Genes In Gene Sets</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Bars"
              checked={displayOptions.genes.line.show}
              onCheckedChange={(state) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: {
                    ...displayOptions,
                    genes: {
                      ...displayOptions.genes,
                      line: { ...displayOptions.genes.line, show: state },
                    },
                  },
                })
              }
            />
            <PropRow title="Stroke width" className="ml-2">
              <NumericalInput
                id="genes-stroke-width"
                value={displayOptions.genes.line.width}
                placeholder="Stroke..."
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: {
                      ...displayOptions,
                      genes: {
                        ...displayOptions.genes,

                        line: { ...displayOptions.es.gs2.line, width: v },
                      },
                    },
                  })
                }}
              />
            </PropRow>
            <SwitchPropRow
              title="Labels"
              className="ml-2"
              disabled={!displayOptions.genes.line.show}
              checked={displayOptions.genes.labels.show}
              onCheckedChange={(state) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: {
                    ...displayOptions,
                    genes: {
                      ...displayOptions.genes,
                      labels: {
                        ...displayOptions.genes.labels,
                        show: state,
                      },
                    },
                  },
                })
              }
            />
            <SwitchPropRow
              title="Color labels"
              className="ml-2"
              disabled={
                !displayOptions.genes.line.show ||
                !displayOptions.genes.labels.show
              }
              checked={displayOptions.genes.labels.isColored}
              onCheckedChange={(state) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: {
                    ...displayOptions,
                    genes: {
                      ...displayOptions.genes,
                      labels: {
                        ...displayOptions.genes.labels,
                        isColored: state,
                      },
                    },
                  },
                })
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ranked-genes">
          <AccordionTrigger>Ranked Genes</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={displayOptions.ranking.show}
              onCheckedChange={(state) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: {
                    ...displayOptions,
                    ranking: {
                      ...displayOptions.ranking,
                      show: state,
                    },
                  },
                })
              }
            />

            <PropRow title="Color" className="ml-2">
              <ColorPickerButton
                color={displayOptions.ranking.fill.color}
                disabled={!displayOptions.ranking.show}
                onColorChange={(color) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: {
                      ...displayOptions,
                      ranking: {
                        ...displayOptions.ranking,
                        fill: {
                          ...displayOptions.ranking.fill,
                          color,
                        },
                      },
                    },
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Positive color"
              />
            </PropRow>

            <PropRow title="Opacity" className="ml-2">
              <NumericalInput
                value={displayOptions.ranking.fill.alpha}
                disabled={!displayOptions.ranking.show}
                placeholder="Opacity"
                limit={[0, 1]}
                inc={0.1}
                dp={1}
                onNumChanged={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: {
                      ...displayOptions,
                      ranking: {
                        ...displayOptions.ranking,
                        fill: {
                          ...displayOptions.ranking.fill,
                          opacity: v,
                        },
                      },
                    },
                  })
                }
                className="w-16 rounded-theme"
              />
            </PropRow>

            <SwitchPropRow
              className="ml-2"
              title="Zero crossing"
              checked={displayOptions.ranking.zeroCross.show}
              disabled={!displayOptions.ranking.show}
              onCheckedChange={(state) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: {
                    ...displayOptions,
                    ranking: {
                      ...displayOptions.ranking,
                      zeroCross: {
                        ...displayOptions.ranking.zeroCross,
                        show: state,
                      },
                    },
                  },
                })
              }
            />
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
})
