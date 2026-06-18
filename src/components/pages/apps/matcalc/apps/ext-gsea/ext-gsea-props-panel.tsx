import { PropsPanel } from '@/components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { useState } from 'react'

import { FontPopover } from '@/components/plot/font/font-popover'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { TEXT_RESET } from '@/consts'
import { PropRow } from '@/dialogs/prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import type { IDivProps } from '@/interfaces/div-props'
import { VCenterRow } from '@/layout/v-center-row'
import { LinkButton } from '@/themed/link-button'
import { NumericalInput } from '@/themed/numerical-input'
import { produce } from 'immer'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '../../../../../plot/color-picker-popover'
import {
  useHistory,
  usePlot,
  type ExtGseaPlot,
} from '../../history/history-store'
import { DEFAULT_EXT_GSEA_PROPS } from './ext-gsea-store'

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

  const { updatePlot } = useHistory()

  const plot = usePlot(plotAddr)! as ExtGseaPlot

  const displayOptions = plot!.props

  const [openTabs, setOpenTabs] = useState<string[]>([
    'plot',
    'enrichment',
    'genes-in-genesets',
    'ranked-genes',
  ])

  return (
    <PropsPanel ref={ref} className="pr-1">
      <VCenterRow className="justify-end pb-2">
        <LinkButton
          onClick={() =>
            updatePlot(
              produce(plot, draft => {
                draft.props = { ...DEFAULT_EXT_GSEA_PROPS }
              })
            )
          }
          title="Reset Properties to Defaults"
        >
          {TEXT_RESET}
        </LinkButton>
      </VCenterRow>
      <ScrollAccordion
        value={openTabs}
        onValueChange={v => setOpenTabs(v as string[])}
      >
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
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.axes.x.length = v
                    })
                  )
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
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.es.axes.y.length = v
                    })
                  )
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Line"
              checked={displayOptions.es.gs1.line.show}
              onCheckedChange={state =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.es.gs1.line.show = state
                    draft.props.es.gs2.line.show = state
                  })
                )
              }
            >
              <NumericalInput
                id="line1-stroke-width"
                title="Stroke width"
                value={displayOptions.es.gs1.line.width}
                disabled={!displayOptions.es.gs1.line.show}
                placeholder="Stroke..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.es.gs1.line.width = v
                      draft.props.es.gs2.line.width = v
                    })
                  )
                }}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Leading edge"
              checked={displayOptions.es.gs1.leadingEdge.fill.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.es.gs1.leadingEdge.fill.show = v
                    draft.props.es.gs2.leadingEdge.fill.show = v
                  })
                )
              }
            >
              <NumericalInput
                id="line1-leading-opacity"
                title="Opacity"
                disabled={!displayOptions.es.gs1.leadingEdge.fill.show}
                value={displayOptions.es.gs1.leadingEdge.fill.opacity}
                dp={1}
                step={0.1}
                limit={[0, 1]}
                placeholder="Opacity..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.es.gs1.leadingEdge.fill.opacity = v
                      draft.props.es.gs2.leadingEdge.fill.opacity = v
                    })
                  )
                }}
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="genes-in-genesets">
          <AccordionTrigger
            rightChildren={
              <Switch
                checked={displayOptions.genes.line.show}
                onCheckedChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.genes.line.show = v
                    })
                  )
                }
              />
            }
          >
            Genes
          </AccordionTrigger>
          <AccordionContent>
            <PropRow title="Bars">
              <NumericalInput
                id="genes-stroke-width"
                value={displayOptions.genes.line.width}
                placeholder="Stroke..."
                className="w-16 rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.genes.line.width = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Labels">
              <FontPopover
                fonts={[
                  {
                    title: 'Font',
                    textProps: displayOptions.genes.labels.font,
                    update: textProps =>
                      updatePlot(
                        produce(plot, draft => {
                          draft.props.genes.labels.font = textProps
                        })
                      ),
                    ext: (
                      <SwitchPropRow
                        title="Use colors"
                        className="ml-2"
                        disabled={
                          !displayOptions.genes.line.show ||
                          !displayOptions.genes.labels.font.show
                        }
                        checked={displayOptions.genes.labels.isColored}
                        onCheckedChange={state =>
                          updatePlot(
                            produce(plot, draft => {
                              draft.props.genes.labels.isColored = state
                            })
                          )
                        }
                      />
                    ),
                  },
                ]}
              />
            </PropRow>
            {/* <SwitchPropRow
              title="Color labels"
              className="ml-2"
              disabled={
                !displayOptions.genes.line.show ||
                !displayOptions.genes.labels.font.show
              }
              checked={displayOptions.genes.labels.isColored}
              onCheckedChange={state =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.genes.labels.isColored = state
                  })
                )
              }
            /> */}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ranked-genes">
          <AccordionTrigger
            rightChildren={
              <Switch
                checked={displayOptions.ranking.show}
                onCheckedChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.ranking.show = v
                    })
                  )
                }
              />
            }
          >
            Ranked Genes
          </AccordionTrigger>
          <AccordionContent>
            <PropRow title="Color" className="ml-2">
              <NumericalInput
                value={displayOptions.ranking.fill.opacity}
                disabled={!displayOptions.ranking.show}
                placeholder="Opacity"
                title="Opacity"
                limit={[0, 1]}
                step={0.1}
                dp={1}
                onNumChanged={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.ranking.fill.opacity = v
                    })
                  )
                }
                className="w-16 rounded-theme"
              />

              <ColorPickerButton
                colors={[
                  {
                    color: displayOptions.ranking.fill.value,

                    onColorChange: color =>
                      updatePlot(
                        produce(plot, draft => {
                          draft.props.ranking.fill.value = color
                        })
                      ),
                  },
                ]}
                disabled={!displayOptions.ranking.show}
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </PropRow>

            <SwitchPropRow
              className="ml-2"
              title="Zero crossing"
              checked={displayOptions.ranking.zeroCross.show}
              disabled={!displayOptions.ranking.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.ranking.zeroCross.show = v
                  })
                )
              }
            />
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
