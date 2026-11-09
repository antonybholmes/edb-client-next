import { PropsPanel } from '@/components/props-panel'
import { PropRow } from '@/dialogs/prop-row'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/baseui/accordion'

import { TEXT_OK, TEXT_RESET } from '@/consts'

import { LinkButton } from '@/themed/link-button'

import { useDialogs } from '@/components/dialogs/dialogs'
import { VCenterRow } from '@/components/layout/v-center-row'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { StrokeButton } from '@/components/plot/stroke-dropdown-menu'
import { produce } from 'immer'

import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { NumSlider } from '@/components/shadcn/ui/themed/baseui/num-slider'
import { SmallSwitch } from '@/components/shadcn/ui/themed/baseui/small-switch'
import { useGseaSettings } from '../gsea-settings'
import APP_INFO from '../manifest.json'
import { GeneProps } from './gene-props'
import { MarginPopover } from './margin-popover'

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
            <PropRow title="Size" contentCls="gap-x-2">
              <MarginPopover />
              <DoubleNumericalInput
                h="toolbar"
                v1={settings.es.axes.x.length}
                placeholder="Width"
                limit={[1, 1000]}
                dp={0}
                onNumChange1={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.es.axes.x.length = v
                    })
                  )
                }}
                v2={settings.es.axes.y.length}
                onNumChange2={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.es.axes.y.length = v
                    })
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="enrichment-plot">
          <AccordionTrigger
            leftChildren={
              <SmallSwitch
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
              <StrokeButton
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
            </PropRow>

            <PropRow title="Leading Edge">
              <StrokeButton
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
            </PropRow>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="genes-plot">
          <AccordionTrigger
            leftChildren={
              <SmallSwitch
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
            <GeneProps />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="rank-plot">
          <AccordionTrigger
            leftChildren={
              <SmallSwitch
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
            <PropRow title="Height">
              <NumSlider
                value={settings.ranking.axes.y.length}

                min={1}
                max={500}
                step={1}
                onNumChanged={(v) => {
                  updateSettings(
                    produce(settings, (draft) => {
                      draft.ranking.axes.y.length = v
                    })
                  )
                }}
              />
            </PropRow>
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
              <StrokeButton
                colors={[
                  {
                    color: settings.ranking.zeroCross.value,
                    opacity: settings.ranking.zeroCross.opacity,
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
