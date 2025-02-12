import { DoubleNumericalInput } from '@components/double-numerical-input'
import { PropRow } from '@components/prop-row'
import { PropsPanel } from '@components/props-panel'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@components/shadcn/ui/themed/accordion'
import { NumericalInput } from '@components/shadcn/ui/themed/numerical-input'
import { SideRadioGroupItem } from '@components/shadcn/ui/themed/radio-group'
import { SwitchPropRow } from '@components/switch-prop-row'
import type { IClusterFrame } from '@lib/math/hcluster'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import { forwardRef, useContext, useState, type ForwardedRef } from 'react'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color-picker-button'
import { VCenterRow } from '@/components/layout/v-center-row'
import {
  DEFAULT_HEATMAP_PROPS,
  type IHeatMapDisplayOptions,
} from '@/components/plot/heatmap/heatmap-svg-props'
import type {
  ColorBarPos,
  LegendPos,
  TopBottomPos,
} from '@/components/plot/svg-props'
import { Button } from '@/components/shadcn/ui/themed/button'
import type { LeftRightPos } from '@/components/side'
import { TEXT_RESET } from '@/consts'
import {
  getPlotFromAddr,
  HistoryContext,
  type IHistItemAddr,
} from '@/providers/history-provider'
import { produce } from 'immer'
import { ColorMapMenu } from '../../color-map-menu'

export interface IProps {
  plotAddr: IHistItemAddr
  cf: IClusterFrame | null
}

export const HeatmapPropsPanel = forwardRef(function HeatmapPropsPanel(
  { plotAddr, cf }: IProps,
  ref: ForwardedRef<HTMLDivElement>
) {
  // const { plotsState, historyDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { history, historyDispatch } = useContext(HistoryContext)

  const plot = getPlotFromAddr(plotAddr, history)!

  const displayProps: IHeatMapDisplayOptions = plot.customProps
    .displayOptions as IHeatMapDisplayOptions

  const [openTabs, setOpenTabs] = useState<string[]>(['plot'])

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

              prop: { ...DEFAULT_HEATMAP_PROPS },
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
            <PropRow title="Cell size">
              <DoubleNumericalInput
                v1={displayProps.blockSize.w}
                v2={displayProps.blockSize.h}
                inputCls="w-14 rounded-theme"
                dp={0}
                onNumChanged1={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.blockSize.w = v
                    }),
                  })
                }}
                onNumChanged2={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.blockSize.h = v
                    }),
                  })
                }}
              />
            </PropRow>

            <PropRow title="Padding">
              <NumericalInput
                id="padding"
                value={displayProps.padding}
                placeholder="Padding..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.padding = v
                    }),
                  })
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Grid"
              checked={displayProps.grid.show}
              onCheckedChange={(v) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.grid.show = v
                  }),
                })
              }
            >
              <NumericalInput
                id="col-tree-stroke-width"
                value={displayProps.grid.width}
                disabled={!displayProps.grid.show}
                placeholder="Stroke..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.grid.width = v
                    }),
                  })
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.grid.color}
                disabled={!displayProps.grid.show}
                onColorChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.grid.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change grid lines color"
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Border"
              checked={displayProps.border.show}
              onCheckedChange={(v) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.border.show = v
                  }),
                })
              }
            >
              <NumericalInput
                id="border-stroke-width"
                value={displayProps.border.width}
                disabled={!displayProps.border.show}
                placeholder="Stroke..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.border.width = v
                    }),
                  })
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.border.color}
                disabled={!displayProps.border.show}
                onColorChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.border.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="legend">
          <AccordionTrigger>Legend</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show legend"
              checked={displayProps.legend.show}
              onCheckedChange={(v) => {
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.legend.show = v
                  }),
                })
              }}
            >
              <RadioGroupPrimitive.Root
                value={displayProps.legend.position}
                disabled={!displayProps.legend.show}
                onValueChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.legend.position = v as LegendPos
                    }),
                  })
                }
                className="flex flex-row justify-start gap-x-0.5"
              >
                {/* <SideRadioGroupItem
                  value="Off"
                  currentValue={displayProps.legend.position}
                  className="w-5"
                /> */}
                <SideRadioGroupItem
                  value="Right"
                  currentValue={displayProps.legend.position}
                  disabled={!displayProps.legend.show}
                  className="w-5"
                />
                <SideRadioGroupItem
                  value="Upper Right"
                  currentValue={displayProps.legend.position}
                  disabled={!displayProps.legend.show}
                  className="w-5"
                />
                <SideRadioGroupItem
                  value="Bottom"
                  currentValue={displayProps.legend.position}
                  disabled={!displayProps.legend.show}
                  className="w-5"
                />
              </RadioGroupPrimitive.Root>
            </SwitchPropRow>

            <SwitchPropRow
              className="ml-2"
              title="Border"
              checked={displayProps.legend.stroke.show}
              disabled={!displayProps.legend.show}
              onCheckedChange={(v) => {
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.legend.stroke.show = v
                  }),
                })
              }}
            >
              <NumericalInput
                id="legend-stroke-width"
                value={displayProps.legend.stroke.width}
                disabled={
                  !displayProps.legend.show || !displayProps.legend.stroke.show
                }
                placeholder="Stroke..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.legend.stroke.width = v
                    }),
                  })
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.legend.stroke.color}
                disabled={
                  !displayProps.legend.show || !displayProps.legend.stroke.show
                }
                onColorChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.legend.stroke.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colormap">
          <AccordionTrigger>Colormap</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Color map">
              <ColorMapMenu
                align="end"
                cmap={displayProps.cmap}
                onChange={(cmap) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: { ...displayProps, cmap },
                  })
                }
              />
            </PropRow>

            <PropRow title="Max">
              <NumericalInput
                id="max"
                value={displayProps.range[1]}
                limit={[0.5, 100]}
                inc={0.5}
                dp={1}
                placeholder="Max..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: {
                      ...displayProps,
                      range: [-v, v],
                    },
                  })
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Show color bar"
              checked={displayProps.colorbar.show}
              onCheckedChange={(v) => {
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.colorbar.show = v
                  }),
                })
              }}
            >
              <RadioGroupPrimitive.Root
                value={displayProps.colorbar.position}
                disabled={!displayProps.colorbar.show}
                onValueChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.colorbar.position = v as ColorBarPos
                    }),
                  })
                }
                className="flex flex-row justify-start gap-x-0.5"
              >
                {/* <SideRadioGroupItem
                  value="Off"
                  currentValue={displayProps.colorbar.position}
                  className="w-5"
                /> */}
                <SideRadioGroupItem
                  value="Right"
                  currentValue={displayProps.colorbar.position}
                  disabled={!displayProps.colorbar.show}
                  className="w-5"
                />
                {/* <SideRadioGroupItem
                  value="Upper Right"
                  currentValue={displayProps.colorbar.position}
                  className="w-5"
                /> */}
                <SideRadioGroupItem
                  value="Bottom"
                  currentValue={displayProps.colorbar.position}
                  disabled={!displayProps.colorbar.show}
                  className="w-5"
                />
              </RadioGroupPrimitive.Root>
            </SwitchPropRow>

            <PropRow title="Size" className="ml-2">
              <DoubleNumericalInput
                v1={displayProps.colorbar.size.width}
                v2={displayProps.colorbar.size.height}
                inputCls="w-14 rounded-theme"
                limit={[1, 1000]}
                dp={0}
                onNumChanged1={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.colorbar.size.width = v
                    }),
                  })
                }}
                onNumChanged2={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.colorbar.size.height = v
                    }),
                  })
                }}
              />
            </PropRow>

            <SwitchPropRow
              className="ml-2"
              title="Border"
              checked={displayProps.colorbar.stroke.show}
              disabled={!displayProps.colorbar.show}
              onCheckedChange={(v) => {
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.colorbar.stroke.show = v
                  }),
                })
              }}
            >
              <NumericalInput
                id="colorbar-stroke-width"
                value={displayProps.colorbar.stroke.width}
                disabled={
                  !displayProps.colorbar.show ||
                  !displayProps.colorbar.stroke.show
                }
                placeholder="Stroke..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.colorbar.stroke.width = v
                    }),
                  })
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.legend.stroke.color}
                disabled={
                  !displayProps.legend.show || !displayProps.legend.stroke.show
                }
                onColorChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.colorbar.stroke.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="row-labels">
          <AccordionTrigger>Row Labels</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show labels"
              checked={displayProps.rowLabels.show}
              onCheckedChange={(v) => {
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.rowLabels.show = v
                  }),
                })
              }}
            >
              <ColorPickerButton
                align="end"
                color={displayProps.rowLabels.color}
                disabled={!displayProps.rowLabels.show}
                onColorChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.rowLabels.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change text color"
              />
            </SwitchPropRow>

            <PropRow title="Position" className="ml-2">
              <RadioGroupPrimitive.Root
                value={displayProps.rowLabels.position}
                disabled={!displayProps.rowLabels.show}
                onValueChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.rowLabels.position = v as LeftRightPos
                    }),
                  })
                }
                className="flex flex-row justify-start gap-x-0.5"
              >
                {/* <SideRadioGroupItem
                  value="Off"
                  currentValue={displayProps.rowLabels.position}
                  className="w-5"
                /> */}
                <SideRadioGroupItem
                  disabled={!displayProps.rowLabels.show}
                  value="Left"
                  currentValue={displayProps.rowLabels.position}
                  className="w-5"
                />
                <SideRadioGroupItem
                  disabled={!displayProps.rowLabels.show}
                  value="Right"
                  currentValue={displayProps.rowLabels.position}
                  className="w-5"
                />
              </RadioGroupPrimitive.Root>
            </PropRow>

            <PropRow title="Width" className="ml-2">
              <NumericalInput
                id="row-label-size"
                value={displayProps.rowLabels.width}
                disabled={!displayProps.rowLabels.show}
                limit={[1, 200]}
                placeholder="Row label size..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.rowLabels.width = v
                    }),
                  })
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        {cf?.rowTree && (
          <AccordionItem value="row-tree">
            <AccordionTrigger>Row Tree</AccordionTrigger>
            <AccordionContent>
              <SwitchPropRow
                title="Show tree"
                checked={displayProps.rowTree.show}
                onCheckedChange={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.rowTree.show = v
                    }),
                  })
                }}
              >
                <ColorPickerButton
                  align="end"
                  color={displayProps.rowTree.stroke.color}
                  disabled={!displayProps.rowTree.show}
                  onColorChange={(v) =>
                    historyDispatch({
                      type: 'update-custom-prop',
                      addr: plotAddr,
                      name: 'displayOptions',
                      prop: produce(displayProps, (draft) => {
                        draft.rowTree.stroke.color = v
                      }),
                    })
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Change tree color"
                />

                <RadioGroupPrimitive.Root
                  value={displayProps.rowTree.position}
                  disabled={!displayProps.rowTree.show}
                  onValueChange={(v) =>
                    historyDispatch({
                      type: 'update-custom-prop',
                      addr: plotAddr,
                      name: 'displayOptions',
                      prop: produce(displayProps, (draft) => {
                        draft.rowTree.position = v as LeftRightPos
                      }),
                    })
                  }
                  className="flex flex-row justify-start gap-x-0.5"
                >
                  {/* <SideRadioGroupItem
                      value="Off"
                      currentValue={displayProps.rowTree.position}
                      className="w-5"
                    /> */}
                  <SideRadioGroupItem
                    disabled={!displayProps.rowTree.show}
                    value="Left"
                    currentValue={displayProps.rowTree.position}
                    className="w-5"
                  />
                  <SideRadioGroupItem
                    disabled={!displayProps.rowTree.show}
                    value="Right"
                    currentValue={displayProps.rowTree.position}
                    className="w-5"
                  />
                </RadioGroupPrimitive.Root>
              </SwitchPropRow>

              <PropRow title="Stroke" className="ml-2">
                <NumericalInput
                  id="row-tree-stroke-width"
                  value={displayProps.rowTree.stroke.width}
                  disabled={!displayProps.rowTree.show}
                  placeholder="Stroke..."
                  className="w-14 rounded-theme"
                  onNumChanged={(v) => {
                    historyDispatch({
                      type: 'update-custom-prop',
                      addr: plotAddr,
                      name: 'displayOptions',
                      prop: produce(displayProps, (draft) => {
                        draft.rowTree.stroke.width = v
                      }),
                    })
                  }}
                />
              </PropRow>

              <PropRow title="Width" className="ml-2">
                <NumericalInput
                  id="row-tree-size"
                  value={displayProps.rowTree.width}
                  disabled={!displayProps.rowTree.show}
                  limit={[1, 200]}
                  placeholder="Tree size..."
                  className="w-14 rounded-theme"
                  onNumChanged={(v) => {
                    historyDispatch({
                      type: 'update-custom-prop',
                      addr: plotAddr,
                      name: 'displayOptions',
                      prop: produce(displayProps, (draft) => {
                        draft.rowTree.width = v
                      }),
                    })
                  }}
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="column-labels">
          <AccordionTrigger>Column Labels</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show labels"
              checked={displayProps.colLabels.show}
              onCheckedChange={(v) => {
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.colLabels.show = v
                  }),
                })
              }}
            >
              <ColorPickerButton
                align="end"
                color={displayProps.colLabels.color}
                disabled={!displayProps.colLabels.show}
                onColorChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.colLabels.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change text color"
              />
            </SwitchPropRow>

            <PropRow title="Position" className="ml-2">
              <RadioGroupPrimitive.Root
                value={displayProps.colLabels.position}
                disabled={!displayProps.colLabels.show}
                onValueChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.colLabels.position = v as TopBottomPos
                    }),
                  })
                }
                className="flex flex-row justify-start gap-x-0.5"
              >
                {/* <SideRadioGroupItem
                  value="Off"
                  currentValue={displayProps.colLabels.position}
                  className="w-5"
                /> */}
                <SideRadioGroupItem
                  disabled={!displayProps.colLabels.show}
                  value="Top"
                  currentValue={displayProps.colLabels.position}
                  className="w-5"
                />
                <SideRadioGroupItem
                  disabled={!displayProps.colLabels.show}
                  value="Bottom"
                  currentValue={displayProps.colLabels.position}
                  className="w-5"
                />
              </RadioGroupPrimitive.Root>
            </PropRow>

            <PropRow title="Width" className="ml-2">
              <NumericalInput
                id="col-label-size"
                value={displayProps.colLabels.width}
                disabled={!displayProps.colLabels.show}
                limit={[1, 200]}
                placeholder="Column label size..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.colLabels.width = v
                    }),
                  })
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Color by group"
              disabled={!displayProps.colLabels.show}
              className="ml-2"
              checked={displayProps.colLabels.isColored}
              onCheckedChange={(v) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.colLabels.isColored = v
                  }),
                })
              }
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="column-groups">
          <AccordionTrigger>Column Groups</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show groups"
              checked={displayProps.groups.show}
              onCheckedChange={(v) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.groups.show = v
                  }),
                })
              }
            />

            <SwitchPropRow
              title="Grid"
              className="ml-2"
              disabled={!displayProps.groups.show}
              checked={displayProps.groups.grid.show}
              onCheckedChange={(v) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.groups.grid.show = v
                  }),
                })
              }
            >
              <NumericalInput
                id="groups-grid-stroke-width"
                value={displayProps.groups.grid.width}
                disabled={
                  !displayProps.groups.show || !displayProps.groups.grid.show
                }
                placeholder="Stroke..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.groups.grid.width = v
                    }),
                  })
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.groups.grid.color}
                disabled={!displayProps.groups.show}
                onColorChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.groups.grid.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change grid color"
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Border"
              className="ml-2"
              disabled={!displayProps.groups.show}
              checked={displayProps.groups.border.show}
              onCheckedChange={(v) =>
                historyDispatch({
                  type: 'update-custom-prop',
                  addr: plotAddr,
                  name: 'displayOptions',
                  prop: produce(displayProps, (draft) => {
                    draft.groups.border.show = v
                  }),
                })
              }
            >
              <NumericalInput
                id="groups-border-stroke-width"
                value={displayProps.groups.border.width}
                disabled={
                  !displayProps.groups.show || !displayProps.groups.border.show
                }
                placeholder="Stroke..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.groups.border.width = v
                    }),
                  })
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.groups.border.color}
                disabled={!displayProps.groups.show}
                onColorChange={(v) =>
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.groups.border.color = v
                    }),
                  })
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
            </SwitchPropRow>

            <PropRow title="Height" className="ml-2">
              <NumericalInput
                id="max"
                disabled={!displayProps.groups.show}
                value={displayProps.groups.height}
                limit={[1, 100]}
                placeholder="Height..."
                className="w-14 rounded-theme"
                onNumChanged={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.groups.height = v
                    }),
                  })
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>
        {cf?.colTree && (
          <AccordionItem value="column-tree">
            <AccordionTrigger>Column Tree</AccordionTrigger>
            <AccordionContent>
              <SwitchPropRow
                title="Show tree"
                checked={displayProps.colTree.show}
                onCheckedChange={(v) => {
                  historyDispatch({
                    type: 'update-custom-prop',
                    addr: plotAddr,
                    name: 'displayOptions',
                    prop: produce(displayProps, (draft) => {
                      draft.colTree.show = v
                    }),
                  })
                }}
              >
                <ColorPickerButton
                  align="end"
                  color={displayProps.colTree.stroke.color}
                  disabled={!displayProps.colTree.show}
                  onColorChange={(v) =>
                    historyDispatch({
                      type: 'update-custom-prop',
                      addr: plotAddr,
                      name: 'displayOptions',
                      prop: produce(displayProps, (draft) => {
                        draft.colTree.stroke.color = v
                      }),
                    })
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Change tree color"
                />
              </SwitchPropRow>

              <PropRow title="Stroke" className="ml-2">
                <NumericalInput
                  id="col-tree-stroke-width"
                  value={displayProps.colTree.stroke.width}
                  disabled={!displayProps.colTree.show}
                  placeholder="Stroke..."
                  className="w-14 rounded-theme"
                  onNumChanged={(v) => {
                    historyDispatch({
                      type: 'update-custom-prop',
                      addr: plotAddr,
                      name: 'displayOptions',
                      prop: produce(displayProps, (draft) => {
                        draft.colTree.stroke.width = v
                      }),
                    })
                  }}
                />
              </PropRow>

              <PropRow title="Height" className="ml-2">
                <NumericalInput
                  id="col-tree-size"
                  value={displayProps.colTree.width}
                  disabled={!displayProps.colTree.show}
                  limit={[1, 200]}
                  placeholder="Tree size..."
                  className="w-14 rounded-theme"
                  onNumChanged={(v) => {
                    historyDispatch({
                      type: 'update-custom-prop',
                      addr: plotAddr,
                      name: 'displayOptions',
                      prop: produce(displayProps, (draft) => {
                        draft.colTree.width = v
                      }),
                    })
                  }}
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>
        )}
      </ScrollAccordion>
    </PropsPanel>
  )
})
