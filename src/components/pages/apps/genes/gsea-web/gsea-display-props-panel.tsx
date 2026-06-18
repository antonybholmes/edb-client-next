import { PropsPanel } from '@/components/props-panel'
import { PropRow } from '@/dialogs/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { TEXT_OK, TEXT_RESET } from '@/consts'

import { CheckPropRow } from '@/dialogs/check-prop-row'
import { VCenterRow } from '@/layout/v-center-row'
import { LinkButton } from '@/themed/link-button'
import { NumericalInput } from '@/themed/numerical-input'

import { useDialogs } from '@/components/dialogs/dialogs'
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
    <PropsPanel className="pr-1 gap-y-4">
      <VCenterRow className="justify-end px-1">
        {/* <LinkButton
            onClick={() => reset()}
            title="Reset Properties to Defaults"
          >
            {TEXT_RESET}
          </LinkButton> */}

        <LinkButton
          onClick={() => {
            openDialog({
              type: 'warning',
              payload: {
                title: APP_INFO.name,

                content: 'Are you sure you want to reset all settings?',
                callback: response => {
                  if (response === TEXT_OK) {
                    reset()
                  }
                },
              },
            })
          }}
          title="Reset settings to default"
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
          <AccordionTrigger
            rightChildren={
              <>
                <MarginPopover />
                <FontPopover
                  fonts={[
                    {
                      title: 'Titles',
                      textProps: settings.title,
                      update: f =>
                        updateSettings(
                          produce(settings, draft => {
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
                    update: f =>
                      updateSettings(
                        produce(settings, draft => {
                          draft.axes.labels = f
                        })
                      ),
                  },
                  {
                    title: 'Ticks',
                    textProps: settings.axes.ticks,
                    update: f =>
                      updateSettings(
                        produce(settings, draft => {
                          draft.axes.ticks = f
                        })
                      ),
                  },
                ]}
              />
            </PropRow>
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
                      update: f => {
                        updateSettings(
                          produce(settings, draft => {
                            draft.es.labels = f
                          })
                        )
                      },
                    },
                    {
                      title: 'Phenotypes',
                      textProps: settings.es.phenotypes,
                      update: f => {
                        updateSettings(
                          produce(settings, draft => {
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
                  onCheckedChange={state => {
                    updateSettings(
                      produce(settings, draft => {
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
              <ColorPickerButton
                colors={[
                  {
                    color: settings.es.line.value,
                    opacity: settings.es.line.opacity,
                    onColorChange: (color, alpha) => {
                      updateSettings(
                        produce(settings, draft => {
                          draft.es.line.value = color
                          draft.es.line.opacity = alpha
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
                title="Line color"
              />
            </PropRow>

            <CheckPropRow
              title="Leading Edge"
              checked={settings.es.leadingEdge.show}
              onCheckedChange={state => {
                updateSettings(
                  produce(settings, draft => {
                    draft.es.leadingEdge.show = state
                  })
                )
              }}
            >
              <ColorPickerButton
                colors={[
                  {
                    color: settings.es.leadingEdge.fill.value,
                    opacity: settings.es.leadingEdge.fill.opacity,
                    onColorChange: (color, alpha) => {
                      updateSettings(
                        produce(settings, draft => {
                          draft.es.leadingEdge.fill.value = color
                          draft.es.leadingEdge.fill.opacity = alpha
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
                title="Leading edge color"
              />
            </CheckPropRow>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="genes-plot">
          <AccordionTrigger
            rightChildren={
              <Switch
                title="Show"
                checked={settings.genes.show}
                onCheckedChange={state => {
                  updateSettings(
                    produce(settings, draft => {
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
                onNumChange={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.genes.height = v
                    })
                  )
                }}
                className="w-16 rounded-theme"
              />
            </PropRow>

            <CheckPropRow
              title="Colors"
              checked={settings.genes.color.on}
              onCheckedChange={state => {
                updateSettings(
                  produce(settings, draft => {
                    draft.genes.color.on = state
                  })
                )
              }}
            >
              <ColorPickerButton
                disabled={!settings.genes.show}
                colors={[
                  {
                    title: 'Positive color',
                    color: settings.genes.pos.value,
                    opacity: settings.genes.pos.opacity,
                    onColorChange: (color, alpha) => {
                      updateSettings(
                        produce(settings, draft => {
                          draft.genes.pos.value = color
                          draft.genes.pos.opacity = alpha
                        })
                      )
                    },
                  },

                  {
                    title: 'Negative color',
                    color: settings.genes.neg.value,
                    opacity: settings.genes.neg.opacity,
                    onColorChange: (color, alpha) => {
                      console.log('neg color change', { color, alpha })
                      updateSettings(
                        produce(settings, draft => {
                          draft.genes.neg.value = color
                          draft.genes.neg.opacity = alpha
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
                title="Positive/negative color"
              />
            </CheckPropRow>

            <CheckPropRow
              title="Gradient"
              checked={settings.genes.gradient.on}
              onCheckedChange={state => {
                updateSettings(
                  produce(settings, draft => {
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
                onNumChange={v => {
                  updateSettings(
                    produce(settings, draft => {
                      draft.genes.gradient.alpha = v
                    })
                  )
                }}
                className="w-16 rounded-theme"
                title="Opacity"
              />
            </CheckPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rank-plot">
          <AccordionTrigger
            rightChildren={
              <>
                <ColorPickerButton
                  colors={[
                    {
                      color: settings.ranking.fill.value,
                      opacity: settings.ranking.fill.opacity,
                      onColorChange: (color, alpha) => {
                        updateSettings(
                          produce(settings, draft => {
                            draft.ranking.fill.value = color
                            draft.ranking.fill.opacity = alpha
                          })
                        )
                      },
                    },
                  ]}
                  disabled={!settings.ranking.show}
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Ranked genes color"
                />
                <Switch
                  title="Show"
                  checked={settings.ranking.show}
                  onCheckedChange={state => {
                    updateSettings(
                      produce(settings, draft => {
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
            <CheckPropRow
              title="Zero crossing"
              checked={settings.ranking.zeroCross.show}
              disabled={!settings.ranking.show}
              onCheckedChange={state =>
                updateSettings(
                  produce(settings, draft => {
                    draft.ranking.zeroCross.show = state
                  })
                )
              }
            >
              <ColorPickerButton
                disabled={!settings.ranking.zeroCross.show}
                colors={[
                  {
                    color: settings.ranking.zeroCross.line.value,
                    opacity: settings.ranking.zeroCross.line.opacity,
                    onColorChange: (color, alpha) => {
                      updateSettings(
                        produce(settings, draft => {
                          draft.ranking.zeroCross.line.value = color
                          draft.ranking.zeroCross.line.opacity = alpha
                        })
                      )
                    },
                  },
                ]}
                className={SIMPLE_COLOR_EXT_CLS}
                title="Zero crossing color"
              />
            </CheckPropRow>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
}
