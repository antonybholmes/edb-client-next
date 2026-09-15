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

import { useDialogs } from '@/components/dialogs/dialogs'
import { VCenterRow } from '@/components/layout/v-center-row'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { NumSlider } from '@/components/shadcn/ui/themed/v2/num-slider'
import { PercentSlider } from '@/components/shadcn/ui/themed/v2/percent-slider'
import { produce } from 'immer'

import { MarginPopover } from '@/components/pages/apps/genes/gsea/gsea-plot/margin-popover'
import { SelectItem, SelectList } from '@/components/shadcn/ui/themed/v2/select'
import { ColorMapName, getColorMap } from '@/lib/color/colormap'
import { ColorMapMenu } from '../../../matcalc/color-map-menu'
import { useGseaSettings } from './gsea-settings-store'
import APP_INFO from './manifest.json'

export function GseaPlotDisplayPropsPanel() {
  const { settings, updateSettings, reset } = useGseaSettings()

  const { open: openDialog } = useDialogs()

  return (
    <PropsPanel className="gap-y-2">
      <VCenterRow className="justify-end">
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
      </VCenterRow>
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
          <AccordionTrigger>Page</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Margins">
              <MarginPopover />
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

            <CheckPropRow
              title="Color Phenotypes"
              checked={settings.genes.labels.color.on}
              onCheckedChange={(state) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.genes.labels.color.on = state
                  })
                )
              }}
            />
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
              <NumSlider
                value={settings.genes.height}
                disabled={!settings.genes.show}

                min={1}
                max={100}
                step={1}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.height = v
                    })
                  )
                }}
              />
            </PropRow>

            <CheckPropRow
              title="Color"
              checked={settings.genes.color.on}
              onCheckedChange={(state) => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.genes.color.on = state
                  })
                )
              }}
            >
              {/* <VCenterRow>
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
                  title="Positive Gene Color"
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

                  title="Negative Gene Color"
                />
              </VCenterRow> */}

              <SelectList
                items={[
                  { label: 'Score', value: 'score' },
                  { label: 'Rank', value: 'rank' },
                ]}
                value={settings.genes.color.mode}
                onValueChange={(value) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.color.mode = value as 'score' | 'rank'
                    })
                  )
                }}
                w="xs"
              >
                <SelectItem value="score">Score</SelectItem>
                <SelectItem value="rank">Rank</SelectItem>
              </SelectList>

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
              title="Colormap"
              checked={settings.genes.color.gradient.mode === 'cmap'}
              onCheckedChange={() => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.genes.color.gradient.mode = 'cmap'
                  })
                )
              }}
            >
              <ColorMapMenu
                cmap={getColorMap(settings.genes.color.gradient.cmap.name)}
                onChange={(cmap, reversed) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.color.gradient.cmap.name =
                        cmap.id as ColorMapName
                      //draft.genes.color.gradient.cmap.opacity = cmap.opacity
                      draft.genes.color.gradient.cmap.reversed = reversed
                      draft.genes.color.gradient.mode = 'cmap'
                    })
                  )
                }}
              />
            </CheckPropRow>

            <CheckPropRow
              title="Custom colors"
              checked={settings.genes.color.gradient.mode === 'user'}
              onCheckedChange={() => {
                updateSettings(
                  produce(settings, (draft) => {
                    draft.genes.color.gradient.mode = 'user'
                  })
                )
              }}
            >
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
                title="Positive Gene Color"
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

                title="Negative Gene Color"
              />
            </CheckPropRow>

            <PropRow title="Opacity">
              <PercentSlider
                value={settings.genes.color.gradient.opacity}
                min={0}
                max={1}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.color.gradient.opacity = v
                    })
                  )
                }}
                step={0.05}
              />
            </PropRow>

            <PropRow title="Weight">
              <PercentSlider
                value={settings.genes.color.gradient.weight}
                min={0}
                max={1}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.genes.color.gradient.weight = v
                    })
                  )
                }}
                step={0.05}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rank-plot">
          <AccordionTrigger
            rightChildren={
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
            }
          >
            Ranked Genes
          </AccordionTrigger>
          <AccordionContent>
            <PropRow title="Fill">
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
            </PropRow>
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
