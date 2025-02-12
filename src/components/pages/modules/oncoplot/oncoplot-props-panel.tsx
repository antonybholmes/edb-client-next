import { VCenterRow } from '@/components/layout/v-center-row'

import { Input } from '@components/shadcn/ui/themed/input'

import { forwardRef, useContext, type ForwardedRef } from 'react'

import { DoubleNumericalInput } from '@components/double-numerical-input'
import { PropRow } from '@components/prop-row'
import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { SwitchPropRow } from '@components/switch-prop-row'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color-picker-button'
import { FgBgColorPicker } from '@/components/fg-bg-color-picker'
import { COLOR_TRANSPARENT } from '@/consts'
import {
  DEFAULT_DISPLAY_PROPS,
  NO_ALTERATION_COLOR,
  NO_ALTERATIONS_TEXT,
} from './oncoplot-utils'
import { PlotContext } from './plot-provider'

export const OncoplotPropsPanel = forwardRef(function OncoplotPropsPanel(
  {},
  ref: ForwardedRef<HTMLDivElement>
) {
  const { plotState, plotDispatch } = useContext(PlotContext)
  const displayProps = plotState.displayProps

  return (
    <PropsPanel ref={ref}>
      <ScrollAccordion value={['grid', 'samples', 'features', 'mutations']}>
        <AccordionItem value="grid">
          <AccordionTrigger>Grid</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Label">
              <Input
                id="w"
                defaultValue={displayProps.legend.mutations.label}
                className="w-full rounded-theme"
                onChange={(event) => {
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      legend: {
                        ...displayProps.legend,
                        mutations: {
                          ...displayProps.legend.mutations,
                          label: event.currentTarget.value,
                        },
                      },
                    },
                  })
                }}
              />
            </PropRow>

            <PropRow title="Cell">
              <DoubleNumericalInput
                v1={displayProps.grid.cell.w}
                v2={displayProps.grid.cell.h}
                onNumChanged1={(v) => {
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      grid: {
                        ...displayProps.grid,
                        cell: {
                          ...displayProps.grid.cell,
                          w: v,
                        },
                      },
                    },
                  })
                }}
                onNumChanged2={(v) => {
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      grid: {
                        ...displayProps.grid,
                        cell: {
                          ...displayProps.grid.cell,
                          h: v,
                        },
                      },
                    },
                  })
                }}
              />
            </PropRow>
            <PropRow title="Spacing">
              <DoubleNumericalInput
                v1={displayProps.grid.spacing.x}
                v2={displayProps.grid.spacing.y}
                inputCls="w-16 rounded-theme"
                onNumChanged1={(v) => {
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      grid: {
                        ...displayProps.grid,
                        spacing: { x: v, y: displayProps.grid.spacing.y },
                      },
                    },
                  })
                }}
                onNumChanged2={(v) => {
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,

                      grid: {
                        ...displayProps.grid,
                        spacing: { x: displayProps.grid.spacing.x, y: v },
                      },
                    },
                  })
                }}
              />
            </PropRow>
            <PropRow title="Outline">
              <FgBgColorPicker
                fgColor={displayProps.border.color}
                bgColor={displayProps.grid.color}
                defaultFgColor={DEFAULT_DISPLAY_PROPS.border.color}
                defaultBgColor={DEFAULT_DISPLAY_PROPS.grid.color}
                allowNoColor={true}
                onFgColorChange={(color) =>
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      border: {
                        ...displayProps.border,
                        color,
                        show: color !== COLOR_TRANSPARENT,
                      },
                    },
                  })
                }
                onBgColorChange={(color) =>
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      grid: {
                        ...displayProps.grid,
                        color,
                        show: color !== COLOR_TRANSPARENT,
                      },
                    },
                  })
                }
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="samples">
          <AccordionTrigger>Samples</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="TMB graph"
              checked={displayProps.samples.graphs.show}
              onCheckedChange={(state) =>
                plotDispatch({
                  type: 'display',
                  displayProps: {
                    ...displayProps,
                    samples: {
                      ...displayProps.samples,
                      graphs: {
                        ...displayProps.samples.graphs,
                        show: state,
                      },
                    },
                  },
                })
              }
            />

            <SwitchPropRow
              title="Border"
              disabled={!displayProps.samples.graphs.show}
              checked={displayProps.samples.graphs.border.show}
              onCheckedChange={(state) =>
                plotDispatch({
                  type: 'display',
                  displayProps: {
                    ...displayProps,
                    samples: {
                      ...displayProps.samples,
                      graphs: {
                        ...displayProps.samples.graphs,
                        border: {
                          ...displayProps.samples.graphs.border,
                          show: state,
                        },
                      },
                    },
                  },
                })
              }
            >
              <ColorPickerButton
                color={displayProps.samples.graphs.border.color}
                onColorChange={(color) =>
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      samples: {
                        ...displayProps.samples,
                        graphs: {
                          ...displayProps.samples.graphs,
                          border: {
                            ...displayProps.samples.graphs.border,
                            color,
                          },
                        },
                      },
                    },
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features">
          <AccordionTrigger>Features</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Sample distribution graph"
              checked={displayProps.features.graphs.show}
              onCheckedChange={(state) =>
                plotDispatch({
                  type: 'display',
                  displayProps: {
                    ...displayProps,
                    features: {
                      ...displayProps.features,
                      graphs: {
                        ...displayProps.features.graphs,
                        show: state,
                      },
                    },
                  },
                })
              }
            />

            <SwitchPropRow
              title="Border"
              disabled={!displayProps.features.graphs.show}
              checked={displayProps.features.graphs.border.show}
              onCheckedChange={(state) =>
                plotDispatch({
                  type: 'display',
                  displayProps: {
                    ...displayProps,
                    features: {
                      ...displayProps.features,
                      graphs: {
                        ...displayProps.features.graphs,
                        border: {
                          ...displayProps.features.graphs.border,
                          show: state,
                        },
                      },
                    },
                  },
                })
              }
            >
              <ColorPickerButton
                color={displayProps.features.graphs.border.color}
                onColorChange={(color) =>
                  plotDispatch({
                    type: 'display',
                    displayProps: {
                      ...displayProps,
                      features: {
                        ...displayProps.features,
                        graphs: {
                          ...displayProps.features.graphs,
                          border: {
                            ...displayProps.features.graphs.border,
                            color,
                          },
                        },
                      },
                    },
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Percentages"
              disabled={!displayProps.features.graphs.show}
              checked={displayProps.features.graphs.percentages.show}
              onCheckedChange={(state) =>
                plotDispatch({
                  type: 'display',
                  displayProps: {
                    ...displayProps,
                    features: {
                      ...displayProps.features,
                      graphs: {
                        ...displayProps.features.graphs,
                        percentages: {
                          ...displayProps.features.graphs.percentages,
                          show: state,
                        },
                      },
                    },
                  },
                })
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="mutations">
          <AccordionTrigger>Mutations</AccordionTrigger>
          <AccordionContent>
            <VCenterRow className="flex-wrap gap-2">
              {displayProps.legend.mutations.names.map(
                (mutation: string, mi: number) => (
                  <VCenterRow key={mi} className="gap-x-2">
                    <ColorPickerButton
                      color={
                        displayProps.legend.mutations.colorMap.get(mutation) ??
                        displayProps.legend.mutations.noAlterationColor
                      }
                      onColorChange={(color) => {
                        plotDispatch({
                          type: 'display',
                          displayProps: {
                            ...displayProps,
                            legend: {
                              ...displayProps.legend,
                              mutations: {
                                ...displayProps.legend.mutations,
                                colorMap: new Map<string, string>([
                                  ...displayProps.legend.mutations.colorMap.entries(),
                                  [mutation, color],
                                ]),
                              },
                            },
                          },
                        })
                      }}
                      className={SIMPLE_COLOR_EXT_CLS}
                    />

                    <span>{mutation}</span>
                  </VCenterRow>
                )
              )}

              <VCenterRow className="gap-x-2">
                <ColorPickerButton
                  color={displayProps.legend.mutations.noAlterationColor}
                  defaultColor={NO_ALTERATION_COLOR}
                  onColorChange={(color) => {
                    plotDispatch({
                      type: 'display',
                      displayProps: {
                        ...displayProps,
                        legend: {
                          ...displayProps.legend,
                          mutations: {
                            ...displayProps.legend.mutations,
                            noAlterationColor: color,
                          },
                        },
                      },
                    })
                  }}
                  className={SIMPLE_COLOR_EXT_CLS}
                />

                <span>{NO_ALTERATIONS_TEXT}</span>
              </VCenterRow>
            </VCenterRow>
          </AccordionContent>
        </AccordionItem>
      </ScrollAccordion>
    </PropsPanel>
  )
})
