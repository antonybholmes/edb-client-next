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
import { useEdbSettings } from '@/components/edb/edb-settings'
import { StrokeButton } from '@/components/plot/stroke-dropdown-menu'
import { NumSlider } from '@/components/shadcn/ui/themed/v2/num-slider'
import { SideBarHeader } from '@/components/sidebar/resizable-sidebar'
import { getCmapFromColorMap, getColorMap } from '@/lib/color/colormap'
import { ColorMapMenu } from '../../../matcalc/color-map-menu'
import { useHistory } from '../../../matcalc/history/history-provider/history-provider'
import { GeneProps } from '../gsea-plot/display-props/gene-props'
import { useGseaSettings } from '../gsea-plot/gsea-settings-store'
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
  const { settings, updateSettings } = useGseaSettings()
  const { settings: edbSettings, updateSettings: updateEdbSettings } =
    useEdbSettings()

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
    <PropsPanel>
      <SideBarHeader>
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
      </SideBarHeader>
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
                value={settings.es.axes.x.length}
                limit={[1, 1000]}
                placeholder="Width..."
                w="xxs"
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.es.axes.x.length = v
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
                    textProps: settings.title,
                    update: (textProps) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.title = Object.assign(
                            { ...draft.title },
                            textProps
                          )
                        })
                      ),
                    ext: (
                      <NumericalPropRow
                        title="Offset"

                        value={settings.title.offset}
                        onNumChanged={(state) =>
                          updateSettings(
                            produce(settings, (draft) => {
                              draft.title.offset = state
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
            {/* <PropRow title="Height">
              <NumericalInput
                id="height"
                value={settings.es.axes.y.length}
                limit={[1, 1000]}
                placeholder="Height..."
                w="xxs"
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.es.axes.y.length = v
                    })
                  )
                }}
              />
            </PropRow> */}
            <PropRow
              title="Height"
              htmlTooltip="Higher values give smoother enrichment curves"
            >
              <NumSlider
                min={1}
                max={500}
                step={1}
                value={settings.es.axes.y.length}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.es.axes.y.length = v
                    })
                  )
                }}
              />
            </PropRow>

            {/* <PropRow
              title="Step"
              htmlTooltip="Higher values give smoother enrichment curves"
            >
              <NumSlider
                min={1}
                max={500}
                step={1}
                value={settings.es.step}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.es.step = v
                    })
                  )
                }}
              />
            </PropRow> */}

            <PropRow title="Color">
              <ColorMapMenu
                cmap={getColorMap(edbSettings.plots.cmap)}
                onChange={(colormap) => {
                  updateEdbSettings(
                    produce(edbSettings, (draft) => {
                      draft.plots.cmap = getCmapFromColorMap(colormap)
                    })
                  )
                }}
              />
            </PropRow>

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
                checked={settings.genes.stroke.show}
                onCheckedChange={(v) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.stroke.show = v
                    })
                  )
                }
              />
            }
          >
            Genes
          </AccordionTrigger>
          <AccordionContent>
            {/* <PropRow title="Stroke">
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
              title="Opacity"
              htmlTooltip="Higher values have a stronger effect on hit color opacity"
            >
              <PercentSlider
                min={0}
                max={1}
                step={0.01}
                value={settings.genes.color.gradient.opacity}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.color.gradient.opacity = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow
              title="Weight"
              htmlTooltip="Higher values have a stronger effect on hit color weight"
            >
              <PercentSlider
                min={0}
                max={1}
                step={0.01}
                value={settings.genes.color.gradient.weight}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.color.gradient.weight = v
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

              
            </PropRow> */}

            <GeneProps />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="ranked-genes">
          <AccordionTrigger
            rightChildren={
              <Switch
                checked={settings.ranking.show}
                onCheckedChange={(v) =>
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.ranking.show = v
                    })
                  )
                }
              />
            }
          >
            Ranked Genes
          </AccordionTrigger>
          <AccordionContent>
            <PropRow title="Height">
              <NumericalInput
                id="height"
                value={settings.ranking.axes.y.length}
                limit={[1, 1000]}
                placeholder="Height..."
                w="xxs"
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.ranking.axes.y.length = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Color" className="ml-2">
              <StrokeButton
                colors={[
                  {
                    color: settings.ranking.zeroCross.value,
                    opacity: settings.ranking.zeroCross.opacity,
                    show: settings.ranking.zeroCross.show,
                    onColorChange: ({
                      color,
                      opacity,
                      width,
                      dasharray,
                      show,
                    }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.ranking.zeroCross.show =
                            show ?? draft.ranking.zeroCross.show

                          draft.ranking.zeroCross.value = color
                          draft.ranking.zeroCross.opacity = opacity ?? 1
                          draft.ranking.zeroCross.width =
                            width ?? draft.ranking.zeroCross.width
                          draft.ranking.zeroCross.dasharray =
                            dasharray ?? draft.ranking.zeroCross.dasharray
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
                    color: settings.ranking.fill.value,
                    opacity: settings.ranking.fill.opacity,
                    allowNoColor: false,
                    onColorChange: ({ color, opacity }) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.ranking.fill.value = color
                          draft.ranking.fill.opacity = opacity
                        })
                      ),
                  },
                ]}
                disabled={!settings.ranking.show}
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
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
