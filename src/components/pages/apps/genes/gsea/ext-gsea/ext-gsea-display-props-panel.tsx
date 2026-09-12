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
import { LinkButton } from '@/themed/link-button'
import { NumericalInput } from '@/themed/numerical-input'
import { produce } from 'immer'

import { FillButton } from '@/components/plot/fill-dropdown-menu'

import { CheckPropRow } from '@/components/dialogs/check-prop-row'

import { NumericalPropRow } from '@/components/dialogs/numerical-prop-row'
import { VCenterRow } from '@/components/layout/v-center-row'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { NumSlider } from '@/components/shadcn/ui/themed/v2/num-slider'
import { PercentSlider } from '@/components/shadcn/ui/themed/v2/percent-slider'
import { useHistory } from '../../../matcalc/history/history-provider/history-provider'
import { useExtGseaContext } from './ext-gsea-provider'
import { DEFAULT_EXT_GSEA_SETTINGS } from './ext-gsea-settings'

export function ExtGseaDisplayPropsPanel() {
  // const { plotsState, historyDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  // const IExtGseaDisplayOptions =
  //   plot!.displayOptions as IExtGseaDisplayOptions

  const { updatePlot } = useHistory()
  const { plot } = useExtGseaContext()

  const [openTabs, setOpenTabs] = useState<string[]>([
    'plot',
    'enrichment',
    'genes-in-genesets',
    'ranked-genes',
  ])

  if (!plot) {
    return null
  }

  const displayOptions = plot!.props

  return (
    <PropsPanel className="gap-y-1">
      <VCenterRow className="justify-end">
        <LinkButton
          onClick={() =>
            updatePlot(
              produce(plot, (draft) => {
                draft.props = { ...DEFAULT_EXT_GSEA_SETTINGS }
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
        onValueChange={(v) => setOpenTabs(v as string[])}
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
                w="xxs"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.axes.x.length = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Titles">
              <FontPopover
                fonts={[
                  {
                    title: 'Font',
                    textProps: displayOptions.title,
                    update: (textProps) =>
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.title = Object.assign(
                            { ...draft.props.title },
                            textProps
                          )
                        })
                      ),
                    ext: (
                      <NumericalPropRow
                        title="Offset"

                        value={displayOptions.title.offset}
                        onNumChanged={(state) =>
                          updatePlot(
                            produce(plot, (draft) => {
                              draft.props.title.offset = state
                            })
                          )
                        }
                      />
                    ),
                  },
                ]}
              />
            </PropRow>

            {/* <AxesPropRow axes={['x', 'y']} />
            <PropRow title="Axes">
              <AxesDisplayPropsPopover
                plots={[
                  {
                    id: plot!.id,
                    title: 'Ext GSEA',
                    groups: [
                      {
                        id: 'es',
                        title: 'ES',
                        axes: [
                          { id: 'x', title: 'X Axis' },
                          { id: 'y', title: 'Y Axis' },
                        ],
                      },
                      {
                        id: 'snr',
                        title: 'SNR',
                        axes: [{ id: 'y', title: 'Y Axis' }],
                      },
                    ],
                  },
                ]}
              />
            </PropRow> */}
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
                w="xxs"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.es.axes.y.length = v
                    })
                  )
                }}
              />
            </PropRow>
            <PropRow
              title="Step"
              htmlTooltip="Higher values give smoother enrichment curves"
            >
              <NumSlider
                min={1}
                max={500}
                step={1}
                value={displayOptions.es.step}
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.es.step = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Curves">
              <OutlineButton
                colors={[
                  {
                    color: displayOptions.es.gs1.curve.value,
                    opacity: displayOptions.es.gs1.curve.opacity,
                    show: displayOptions.es.gs1.curve.show,
                    onColorChange: ({
                      color,
                      opacity,
                      width,
                      dasharray,
                      show,
                    }) => {
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.es.gs1.curve.show =
                            show ?? draft.props.es.gs1.curve.show

                          draft.props.es.gs1.curve.value = color
                          draft.props.es.gs1.curve.opacity = opacity ?? 1
                          draft.props.es.gs1.curve.width =
                            width ?? draft.props.es.gs1.curve.width
                          //draft.props.es.gs1.line.dasharray =
                          //  dasharray ?? draft.props.es.gs1.line.dasharray
                        })
                      )
                    },
                  },
                ]}
                title="Enrichment Curve 1"
              />

              <OutlineButton
                colors={[
                  {
                    color: displayOptions.es.gs2.curve.value,
                    opacity: displayOptions.es.gs2.curve.opacity,
                    show: displayOptions.es.gs2.curve.show,
                    onColorChange: ({
                      color,
                      opacity,
                      width,
                      dasharray,
                      show,
                    }) => {
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.es.gs2.curve.show =
                            show ?? draft.props.es.gs2.curve.show

                          draft.props.es.gs2.curve.value = color
                          draft.props.es.gs2.curve.opacity = opacity ?? 1
                          draft.props.es.gs2.curve.width =
                            width ?? draft.props.es.gs2.curve.width
                          //draft.props.es.gs2.line.dasharray =
                          //  dasharray ?? draft.props.es.gs2.line.dasharray
                        })
                      )
                    },
                  },
                ]}
                title="Enrichment Curve 2"
              />
            </PropRow>

            {/* <SwitchPropRow
              title="Line"
              checked={displayOptions.es.gs1.line.show}
              onCheckedChange={(state) =>
                updatePlot(
                  produce(plot, (draft) => {
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
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.es.gs1.line.width = v
                      draft.props.es.gs2.line.width = v
                    })
                  )
                }}
              />
            </SwitchPropRow> */}

            <PropRow title="Leading Edges">
              <FillButton
                colors={[
                  {
                    color: displayOptions.es.gs1.leadingEdge.value,
                    opacity: displayOptions.es.gs1.leadingEdge.opacity,
                    show: displayOptions.es.gs1.leadingEdge.show,
                    onColorChange: ({
                      color,
                      opacity,

                      show,
                    }) => {
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.es.gs1.leadingEdge.show =
                            show ?? draft.props.es.gs1.curve.show

                          draft.props.es.gs1.leadingEdge.value = color
                          draft.props.es.gs1.leadingEdge.opacity = opacity ?? 1
                        })
                      )
                    },
                  },
                ]}
                title="Leading Edge 1"
              />
              <FillButton
                colors={[
                  {
                    color: displayOptions.es.gs2.leadingEdge.value,
                    opacity: displayOptions.es.gs2.leadingEdge.opacity,
                    show: displayOptions.es.gs2.leadingEdge.show,
                    onColorChange: ({
                      color,
                      opacity,

                      show,
                    }) => {
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.es.gs2.leadingEdge.show =
                            show ?? draft.props.es.gs2.leadingEdge.show

                          draft.props.es.gs2.leadingEdge.value = color
                          draft.props.es.gs2.leadingEdge.opacity = opacity ?? 1
                        })
                      )
                    },
                  },
                ]}
                title="Leading Edge 2"
              />
            </PropRow>

            {/* <CheckPropRow
              title="Leading edge"
              checked={displayOptions.es.gs1.leadingEdge.show}
              onCheckedChange={(v) =>
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.es.gs1.leadingEdge.show = v
                    draft.props.es.gs2.leadingEdge.show = v
                  })
                )
              }
            >
              <NumericalInput
                id="line1-leading-opacity"
                title="Opacity"
                disabled={!displayOptions.es.gs1.leadingEdge.show}
                value={displayOptions.es.gs1.leadingEdge.opacity}
                dp={1}
                step={0.1}
                limit={[0, 1]}
                placeholder="Opacity..."
                className="w-16 rounded-theme"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.es.gs1.leadingEdge.opacity = v
                      draft.props.es.gs2.leadingEdge.opacity = v
                    })
                  )
                }}
              />
            </CheckPropRow> */}

            <CheckPropRow
              title="Stats"
              checked={displayOptions.es.stats.show}
              onCheckedChange={(v) =>
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.es.stats.show = v
                  })
                )
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="genes-in-genesets">
          <AccordionTrigger
            rightChildren={
              <Switch
                checked={displayOptions.genes.line.show}
                onCheckedChange={(v) =>
                  updatePlot(
                    produce(plot, (draft) => {
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
            <PropRow title="Stroke">
              <NumericalInput
                id="genes-stroke-width"
                value={displayOptions.genes.line.width}
                placeholder="Stroke..."
                w="xxs"
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.genes.line.width = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow
              title="Gene Effect"
              htmlTooltip="Higher values have a stronger effect on hit color opacity"
            >
              <PercentSlider
                min={0}
                max={1}
                step={0.01}
                value={displayOptions.genes.geneScoreWeight}
                onNumChanged={(v) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.genes.geneScoreWeight = v
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
                    update: (textProps) =>
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.genes.labels.font = textProps
                        })
                      ),
                    ext: (
                      <CheckPropRow
                        title="Use colors"
                        className="ml-0.5 mt-1"
                        disabled={
                          !displayOptions.genes.line.show ||
                          !displayOptions.genes.labels.font.show
                        }
                        checked={displayOptions.genes.labels.isColored}
                        onCheckedChange={(state) =>
                          updatePlot(
                            produce(plot, (draft) => {
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
                onCheckedChange={(v) =>
                  updatePlot(
                    produce(plot, (draft) => {
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
              <OutlineButton
                colors={[
                  {
                    color: displayOptions.ranking.zeroCross.value,
                    opacity: displayOptions.ranking.zeroCross.opacity,
                    show: displayOptions.ranking.zeroCross.show,
                    onColorChange: ({
                      color,
                      opacity,
                      width,
                      dasharray,
                      show,
                    }) => {
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.ranking.zeroCross.show =
                            show ?? draft.props.ranking.zeroCross.show

                          draft.props.ranking.zeroCross.value = color
                          draft.props.ranking.zeroCross.opacity = opacity ?? 1
                          draft.props.ranking.zeroCross.width =
                            width ?? draft.props.ranking.zeroCross.width
                          draft.props.ranking.zeroCross.dasharray =
                            dasharray ?? draft.props.ranking.zeroCross.dasharray
                        })
                      )
                    },
                  },
                ]}
                title="Zero Cross"
              />

              <FillButton
                colors={[
                  {
                    color: displayOptions.ranking.fill.value,
                    opacity: displayOptions.ranking.fill.opacity,
                    allowNoColor: false,
                    onColorChange: ({ color, opacity }) =>
                      updatePlot(
                        produce(plot, (draft) => {
                          draft.props.ranking.fill.value = color
                          draft.props.ranking.fill.opacity = opacity
                        })
                      ),
                  },
                ]}
                disabled={!displayOptions.ranking.show}
                title="Ranking Fill"
              />

              {/* <PercentSlider
                value={displayOptions.ranking.fill.opacity}
                disabled={!displayOptions.ranking.show}

                title="Opacity"

                onValueChange={(value) => {
                  const v = Array.isArray(value) ? value[0] : value
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.ranking.fill.opacity = v
                    })
                  )
                }}
              /> */}
            </PropRow>

            {/* <CheckPropRow
              className="ml-2"
              title="Zero crossing"
              checked={displayOptions.ranking.zeroCross.show}
              disabled={!displayOptions.ranking.show}
              onCheckedChange={(v) =>
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.ranking.zeroCross.show = v
                  })
                )
              }
            /> */}
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
