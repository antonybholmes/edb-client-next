import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'

import { useState } from 'react'

import { TEXT_RESET } from '@/consts'
import { PropRow } from '@dialog/prop-row'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import type { IDivProps } from '@interfaces/div-props'
import { VCenterRow } from '@layout/v-center-row'
import { LinkButton } from '@themed/link-button'
import { NumericalInput } from '@themed/numerical-input'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '../../../../../color/color-picker-button'
import {
  DEFAULT_EXT_GSEA_PROPS,
  type IExtGseaDisplayOptions,
} from '../../../genes/gsea/ext-gsea-store'
import { useHistory, usePlot } from '../../history/history-store'

export interface IProps extends IDivProps {
  plotAddr: string
}

export function ExtGseaPropsPanel({ ref, plotAddr }: IProps) {
  // const { plotsState, historyDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  // const IExtGseaDisplayOptions =
  //   plot!.displayOptions as IExtGseaDisplayOptions

  const { updateProps } = useHistory()

  const plot = usePlot(plotAddr)

  const displayOptions = plot!.customProps
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
        <LinkButton
          onClick={() =>
            updateProps(plotAddr, 'displayOptions', {
              ...DEFAULT_EXT_GSEA_PROPS,
            })
          }
          title="Reset Properties to Defaults"
        >
          {TEXT_RESET}
        </LinkButton>
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
                  updateProps(plotAddr, 'displayOptions', {
                    ...displayOptions,
                    axes: {
                      ...displayOptions.axes,
                      x: {
                        ...displayOptions.axes.x,
                        length: v,
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
                  updateProps(plotAddr, 'displayOptions', {
                    ...displayOptions,
                    es: {
                      ...displayOptions.es,
                      axes: {
                        ...displayOptions.es.axes,
                        y: { ...displayOptions.es.axes.y, length: v },
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
                updateProps(plotAddr, 'displayOptions', {
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
                  updateProps(plotAddr, 'displayOptions', {
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
                  })
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Leading edge"
              checked={displayOptions.es.gs1.leadingEdge.show}
              onCheckedChange={(state) =>
                updateProps(plotAddr, 'displayOptions', {
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
                })
              }
            ></SwitchPropRow>
            <PropRow title="Opacity" className="ml-2">
              <NumericalInput
                id="line1-leading-opacity"
                disabled={!displayOptions.es.gs1.leadingEdge.show}
                value={displayOptions.es.gs1.leadingEdge.fill.opacity}
                dp={1}
                step={0.1}
                limit={[0, 1]}
                placeholder="Opacity..."
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  updateProps(plotAddr, 'displayOptions', {
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
                  })
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="genes-in-genesets">
          <AccordionTrigger>Genes In Gene Sets</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Bars"
              checked={displayOptions.genes.line.show}
              onCheckedChange={(state) =>
                updateProps(plotAddr, 'displayOptions', {
                  ...displayOptions,
                  genes: {
                    ...displayOptions.genes,
                    line: { ...displayOptions.genes.line, show: state },
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
                  updateProps(plotAddr, 'displayOptions', {
                    ...displayOptions,
                    genes: {
                      ...displayOptions.genes,

                      line: { ...displayOptions.es.gs2.line, width: v },
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
                updateProps(plotAddr, 'displayOptions', {
                  ...displayOptions,
                  genes: {
                    ...displayOptions.genes,
                    labels: {
                      ...displayOptions.genes.labels,
                      show: state,
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
                updateProps(plotAddr, 'displayOptions', {
                  ...displayOptions,
                  genes: {
                    ...displayOptions.genes,
                    labels: {
                      ...displayOptions.genes.labels,
                      isColored: state,
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
                updateProps(plotAddr, 'displayOptions', {
                  ...displayOptions,
                  ranking: {
                    ...displayOptions.ranking,
                    show: state,
                  },
                })
              }
            />

            <PropRow title="Color" className="ml-2">
              <ColorPickerButton
                color={displayOptions.ranking.fill.color}
                disabled={!displayOptions.ranking.show}
                onColorChange={(color) =>
                  updateProps(plotAddr, 'displayOptions', {
                    ...displayOptions,
                    ranking: {
                      ...displayOptions.ranking,
                      fill: {
                        ...displayOptions.ranking.fill,
                        color,
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
                value={displayOptions.ranking.fill.opacity}
                disabled={!displayOptions.ranking.show}
                placeholder="Opacity"
                limit={[0, 1]}
                step={0.1}
                dp={1}
                onNumChanged={(v) =>
                  updateProps(plotAddr, 'displayOptions', {
                    ...displayOptions,
                    ranking: {
                      ...displayOptions.ranking,
                      fill: {
                        ...displayOptions.ranking.fill,
                        opacity: v,
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
                updateProps(plotAddr, 'displayOptions', {
                  ...displayOptions,
                  ranking: {
                    ...displayOptions.ranking,
                    zeroCross: {
                      ...displayOptions.ranking.zeroCross,
                      show: state,
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
}
