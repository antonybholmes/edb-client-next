import { PropsPanel } from '@/components/props-panel'
import { PropRow } from '@/dialogs/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { TEXT_OK, TEXT_RESET } from '@/consts'

import { CheckPropRow } from '@/dialogs/check-prop-row'
import { LinkButton } from '@/themed/link-button'
import { NumericalInput } from '@/themed/numerical-input'

import { useDialogs } from '@/components/dialogs/dialogs'
import { VCenterRow } from '@/components/layout/v-center-row'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { SideBarHeader } from '@/components/sidebar/resizable-sidebar'
import { produce } from 'immer'
import { FontPopover } from '../../../../plot/font/font-popover'
import { MarginPopover } from '../../../../plot/margin-popover'
import { useGseaSettings } from './gsea-settings-store'
import APP_INFO from './manifest.json'

export function GseaDisplayPropsPanel() {
  const { settings, updateSettings, reset } = useGseaSettings()
  const { open: openDialog } = useDialogs()

  // const [text, setText] = useState<string>(
  //   process.env.NODE_ENV === 'development' ? 'BCL6\nPRDM1\nKMT2D' : ''
  // )

  // function setProps(dataset: IGexDataset, props: IGexPlotDisplayProps) {
  //   updateGexPlotSettings(
  //     Object.fromEntries([
  //       ...Object.entries(gexPlotSettings).filter(
  //         ([id, _]) => id !== dataset.id.toString()
  //       ),
  //       [dataset.id.toString(), props],
  //     ])
  //   )
  // }

  return (
    <PropsPanel className="gap-y-2">
      <SideBarHeader>
        <LinkButton
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: APP_INFO.name,

                content: 'Are you sure you want to reset all settings?',
                callback: (response) => {
                  if (response === TEXT_OK) {
                    reset()
                  }
                },
              },
            })
          }}
          title="Reset settings to default"
          className="text-xs"
        >
          {TEXT_RESET}
        </LinkButton>
      </SideBarHeader>
      <ScrollAccordion
        value={[
          'page',
          'padding',
          'enrichment-plot',
          'genes-plot',
          'rank-plot',
        ]}
      >
        <AccordionItem value="page">
          <AccordionTrigger
            rightChildren={
              <>
                <MarginPopover />
                <FontPopover
                  fonts={[
                    {
                      title: 'Titles',
                      textProps: settings.title,
                      update: (f) =>
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.title.font = f.font
                            draft.title.show = f.show
                          })
                        ),
                    },
                  ]}
                />
              </>
            }
          >
            Page
          </AccordionTrigger>
          <AccordionContent>
            <PropRow title="Axes">
              <FontPopover
                fonts={[
                  {
                    title: 'Labels',
                    textProps: settings.axes.labels,
                    update: (f) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.axes.labels = f
                        })
                      ),
                  },
                  {
                    title: 'Ticks',
                    textProps: settings.axes.ticks,
                    update: (f) =>
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.axes.ticks = f
                        })
                      ),
                  },
                ]}
              />
            </PropRow>
            <CheckPropRow
              title="Invert Phenotypes"
              checked={settings.phenotypes.invert}
              onCheckedChange={(state) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.phenotypes.invert = state
                  })
                )
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="enrichment-plot">
          <AccordionTrigger
            rightChildren={
              <>
                <FontPopover
                  fonts={[
                    {
                      title: 'Labels',
                      textProps: settings.es.labels,
                      update: (f) => {
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.es.labels = f
                          })
                        )
                      },
                    },
                    {
                      title: 'Phenotypes',
                      textProps: settings.es.phenotypes,
                      update: (f) => {
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.es.phenotypes = f
                          })
                        )
                      },
                    },
                  ]}
                />
                <Switch
                  title="Show"
                  checked={settings.es.show}
                  onCheckedChange={(state) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.es.show = state
                      })
                    )
                  }}
                />
              </>
            }
          >
            Enrichment
          </AccordionTrigger>
          <AccordionContent>
            <PropRow title="Line">
              <OutlineButton
                colors={[
                  {
                    color: settings.es.line.value,
                    opacity: settings.es.line.opacity,
                    onColorChange: ({
                      color,
                      opacity,
                      width,
                      dasharray,
                      show,
                    }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.es.line.show = show ?? draft.es.line.show

                          draft.es.line.value = color
                          draft.es.line.opacity = opacity ?? 1
                          draft.es.line.width = width ?? draft.es.line.width
                          draft.es.line.dasharray =
                            dasharray ?? draft.es.line.dasharray
                        })
                      )
                    },
                  },
                ]}
                title="Line Outline"
              />

              {/* <ColorPickerButton
                colors={[
                  {
                    color: settings.es.line.value,
                    opacity: settings.es.line.opacity,
                    onColorChange: ({ color, opacity }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.es.line.value = color
                          draft.es.line.opacity = opacity ?? 1
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
                title="Line color"
              /> */}
            </PropRow>

            <PropRow title="Leading Edge">
              <VCenterRow>
                <OutlineButton
                  colors={[
                    {
                      color: settings.es.leadingEdge.line.value,
                      opacity: settings.es.leadingEdge.line.opacity,
                      onColorChange: ({
                        color,
                        opacity,
                        width,
                        dasharray,
                        show,
                      }) => {
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.es.leadingEdge.line.show =
                              show ?? draft.es.leadingEdge.line.show

                            draft.es.leadingEdge.line.value = color
                            draft.es.leadingEdge.line.opacity = opacity ?? 1
                            draft.es.leadingEdge.line.width =
                              width ?? draft.es.leadingEdge.line.width
                            draft.es.leadingEdge.line.dasharray =
                              dasharray ?? draft.es.leadingEdge.line.dasharray
                          })
                        )
                      },
                    },
                  ]}
                  title="Leading Edge Outline"
                />

                <FillButton
                  colors={[
                    {
                      color: settings.es.leadingEdge.fill.value,
                      opacity: settings.es.leadingEdge.fill.opacity,
                      onColorChange: ({ color, opacity, show }) => {
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.es.leadingEdge.fill.show =
                              show ?? draft.es.leadingEdge.fill.show

                            draft.es.leadingEdge.fill.value = color
                            draft.es.leadingEdge.fill.opacity = opacity ?? 1
                          })
                        )
                      },
                    },
                  ]}
                  title="Leading Edge Fill"
                />
              </VCenterRow>
            </PropRow>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="genes-plot">
          <AccordionTrigger
            rightChildren={
              <Switch
                title="Show"
                checked={settings.genes.show}
                onCheckedChange={(state) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.show = state
                    })
                  )
                }}
              />
            }
          >
            Genes
          </AccordionTrigger>
          <AccordionContent>
            <PropRow title="Height">
              <NumericalInput
                value={settings.genes.height}
                disabled={!settings.genes.show}
                placeholder="Height"
                limit={[1, 100]}
                step={1}
                onNumChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.height = v
                    })
                  )
                }}
                w="xxs"
              />
            </PropRow>

            <CheckPropRow
              title="Colors"
              checked={settings.genes.color.on}
              onCheckedChange={(state) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.genes.color.on = state
                  })
                )
              }}
            >
              <VCenterRow>
                <FillButton
                  colors={[
                    {
                      color: settings.genes.pos.value,
                      opacity: settings.genes.pos.opacity,
                      onColorChange: ({ color, opacity }) => {
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.genes.pos.value = color
                            draft.genes.pos.opacity = opacity ?? 1
                          })
                        )
                      },
                    },
                  ]}
                  title="Positive Genes Fill"
                />

                <FillButton
                  colors={[
                    {
                      color: settings.genes.neg.value,
                      opacity: settings.genes.neg.opacity,
                      onColorChange: ({ color, opacity }) => {
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.genes.neg.value = color
                            draft.genes.neg.opacity = opacity ?? 1
                          })
                        )
                      },
                    },
                  ]}

                  title="Negative Genes Fill"
                />
              </VCenterRow>

              {/* <ColorPickerButton
                disabled={!settings.genes.show}
                colors={[
                  {
                    title: 'Positive color',
                    color: settings.genes.pos.value,
                    opacity: settings.genes.pos.opacity,
                    onColorChange: ({ color, opacity }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.genes.pos.value = color
                          draft.genes.pos.opacity = opacity ?? 1
                        })
                      )
                    },
                  },

                  {
                    title: 'Negative color',
                    color: settings.genes.neg.value,
                    opacity: settings.genes.neg.opacity,
                    onColorChange: ({ color, opacity }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.genes.neg.value = color
                          draft.genes.neg.opacity = opacity ?? 1
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
                title="Positive/negative color"
              /> */}
            </CheckPropRow>

            <CheckPropRow
              title="Gradient"
              checked={settings.genes.gradient.on}
              onCheckedChange={(state) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.genes.gradient.on = state
                  })
                )
              }}
              className="ml-2"
              disabled={!settings.genes.color.on}
            >
              <NumericalInput
                value={settings.genes.gradient.alpha}
                disabled={!settings.genes.gradient.on}
                placeholder="Alpha"
                limit={[0, 1]}
                step={0.1}
                dp={1}
                onNumChange={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.gradient.alpha = v
                    })
                  )
                }}
                w="xxs"
                title="Opacity"
              />
            </CheckPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rank-plot">
          <AccordionTrigger
            rightChildren={
              <>
                {/* <ColorPickerButton
                  colors={[
                    {
                      color: settings.ranking.fill.value,
                      opacity: settings.ranking.fill.opacity,
                      onColorChange: ({ color, opacity }) => {
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.ranking.fill.value = color
                            draft.ranking.fill.opacity = opacity ?? 1
                          })
                        )
                      },
                    },
                  ]}
                  disabled={!settings.ranking.show}
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Ranked genes color"
                /> */}
                <FillButton
                  colors={[
                    {
                      color: settings.ranking.fill.value,
                      opacity: settings.ranking.fill.opacity,
                      onColorChange: ({ color, opacity, show }) => {
                        updateSettings(
                          produce(settings, (draft) => {
                            draft.ranking.fill.value = color
                            draft.ranking.fill.opacity = opacity ?? 1
                            draft.ranking.fill.show =
                              show ?? draft.ranking.fill.show
                          })
                        )
                      },
                    },
                  ]}

                  title="Ranked Genes Fill"
                />
                <Switch
                  title="Show"
                  checked={settings.ranking.show}
                  onCheckedChange={(state) => {
                    updateSettings(
                      produce(settings, (draft) => {
                        draft.ranking.show = state
                      })
                    )
                  }}
                />
              </>
            }
          >
            Ranked Genes
          </AccordionTrigger>
          <AccordionContent>
            <PropRow title="Zero Crossing">
              <OutlineButton
                colors={[
                  {
                    color: settings.ranking.zeroCross.line.value,
                    opacity: settings.ranking.zeroCross.line.opacity,
                    onColorChange: ({
                      color,
                      opacity,
                      width,
                      dasharray,
                      show,
                    }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.ranking.zeroCross.line.show =
                            show ?? draft.ranking.zeroCross.line.show

                          draft.ranking.zeroCross.line.value = color
                          draft.ranking.zeroCross.line.opacity = opacity ?? 1
                          draft.ranking.zeroCross.line.width =
                            width ?? draft.ranking.zeroCross.line.width
                          draft.ranking.zeroCross.line.dasharray =
                            dasharray ?? draft.ranking.zeroCross.line.dasharray
                        })
                      )
                    },
                  },
                ]}
                title="Zero Crossing Outline"
              />

              {/* <ColorPickerButton
                disabled={!settings.ranking.zeroCross.show}
                colors={[
                  {
                    color: settings.ranking.zeroCross.line.value,
                    opacity: settings.ranking.zeroCross.line.opacity,
                    onColorChange: ({ color, opacity }) => {
                      updateSettings(
                        produce(settings, (draft) => {
                          draft.ranking.zeroCross.line.value = color
                          draft.ranking.zeroCross.line.opacity = opacity ?? 1
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
                title="Zero crossing color"
              /> */}
            </PropRow>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
