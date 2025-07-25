import { DoubleNumericalInput } from '@components/double-numerical-input'
import { PropsPanel } from '@components/props-panel'
import { PropRow } from '@dialog/prop-row'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import type { IClusterFrame } from '@lib/math/hcluster'
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@themed/accordion'
import { NumericalInput } from '@themed/numerical-input'
import { SideRadioGroupItem } from '@themed/radio-group'
import { useState } from 'react'

import { TEXT_BORDER, TEXT_RESET, TEXT_SHOW, TEXT_TITLE } from '@/consts'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import {
  DEFAULT_HEATMAP_PROPS,
  type IHeatMapDisplayOptions,
} from '@components/plot/heatmap/heatmap-svg-props'
import type {
  ColorBarPos,
  LegendPos,
  TopBottomPos,
} from '@components/plot/svg-props'
import type { LeftRightPos } from '@components/side'
import { VCenterRow } from '@layout/v-center-row'
import { LinkButton } from '@themed/link-button'

import { COLOR_MAPS } from '@/lib/color/colormap'
import { InfoHoverCard } from '@components/shadcn/ui/themed/hover-card'
import { Input } from '@components/shadcn/ui/themed/input'
import { Label } from '@components/shadcn/ui/themed/label'
import {
  Popover,
  PopoverContent,
  PopoverSpeechArrow,
  PopoverTrigger,
} from '@components/shadcn/ui/themed/popover'
import { Switch } from '@components/shadcn/ui/themed/switch'
import type { IDivProps } from '@interfaces/div-props'
import { cn } from '@lib/shadcn-utils'
import { produce } from 'immer'
import { ColorMapMenu } from '../../color-map-menu'
import { useHistory, usePlot } from '../../history/history-store'

export interface IProps extends IDivProps {
  plotAddr: string
}

export function HeatmapPropsPanel({ ref, plotAddr }: IProps) {
  // const { plotsState, historyDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { updateProps } = useHistory()

  const plot = usePlot(plotAddr)

  const cf = plot?.dataframes['main'] as IClusterFrame

  const displayProps: IHeatMapDisplayOptions = plot?.customProps
    .displayOptions as IHeatMapDisplayOptions

  const [openTabs, setOpenTabs] = useState<string[]>(['plot'])

  return (
    <PropsPanel ref={ref}>
      <VCenterRow className="justify-end pb-2">
        <LinkButton
          onClick={() => {
            // reset properties for either heatmaps or dot plots
            const props: IHeatMapDisplayOptions = {
              ...DEFAULT_HEATMAP_PROPS,
              mode: displayProps.mode,
              dot: displayProps.dot,
            }

            updateProps(plotAddr, 'displayOptions', props)
          }}
          title="Reset Properties to Defaults"
        >
          {TEXT_RESET}
        </LinkButton>
      </VCenterRow>
      <ScrollAccordion value={openTabs} onValueChange={setOpenTabs}>
        <AccordionItem value="plot">
          <AccordionTrigger>Plot</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Cell size">
              <DoubleNumericalInput
                v1={displayProps.blockSize.w}
                v2={displayProps.blockSize.h}
                inputCls="rounded-theme"
                //w="w-14"
                dp={0}
                onNumChanged1={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.blockSize.w = v
                    })
                  )
                }}
                onNumChanged2={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.blockSize.h = v
                    })
                  )
                }}
              />
            </PropRow>

            <PropRow title="Padding">
              <NumericalInput
                id="padding"
                w="w-16"
                value={displayProps.padding}
                placeholder="Padding..."
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.padding = v
                    })
                  )
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Grid"
              checked={displayProps.grid.show}
              onCheckedChange={v =>
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.grid.show = v
                  })
                )
              }
            >
              <NumericalInput
                id="col-tree-stroke-width"
                w="w-16"
                value={displayProps.grid.width}
                disabled={!displayProps.grid.show}
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.grid.width = v
                    })
                  )
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.grid.color}
                disabled={!displayProps.grid.show}
                onColorChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.grid.color = v
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change grid lines color"
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Border"
              checked={displayProps.border.show}
              onCheckedChange={v =>
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.border.show = v
                  })
                )
              }
            >
              <NumericalInput
                id="border-stroke-width"
                w="w-16"
                value={displayProps.border.width}
                disabled={!displayProps.border.show}
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.border.width = v
                    })
                  )
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.border.color}
                disabled={!displayProps.border.show}
                onColorChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.border.color = v
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cells">
          <AccordionTrigger>Cells</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Values"
              checked={displayProps.cells.values.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.cells.values.show = v
                  })
                )
              }}
            >
              <PropRow title="DP" className="ml-3">
                <NumericalInput
                  id="cell-dp"
                  value={displayProps.cells.values.dp}
                  limit={[0, 10]}
                  //disabled={!displayProps.cells.values.show}
                  placeholder="Decimals"
                  w="w-16"
                  className="rounded-theme"
                  onNumChanged={v => {
                    updateProps(
                      plotAddr,
                      'displayOptions',
                      produce(displayProps, draft => {
                        draft.cells.values.dp = v
                      })
                    )
                  }}
                />
              </PropRow>
            </SwitchPropRow>
            <PropRow title="Color" className="ml-3">
              <ColorPickerButton
                align="end"
                disabled={!displayProps.cells.values.show}
                color={displayProps.cells.values.color}
                onColorChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.cells.values.color = v
                      // turn off auto color if we pick a color
                      draft.cells.values.autoColor.on = false
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change value color"
              />
              <Popover>
                <PopoverTrigger title="Auto Color Threshold">
                  Auto Threshold
                </PopoverTrigger>
                <PopoverContent
                  className="relative"
                  variant="content"
                  sideOffset={10}
                  align="center"
                >
                  <PopoverSpeechArrow />

                  <VCenterRow className="gap-x-2">
                    <Label>Threshold</Label>
                    <NumericalInput
                      id="cell-autocolor-threshold"
                      value={displayProps.cells.values.autoColor.threshold}
                      limit={[0, 255]}
                      //disabled={!displayProps.cells.values.show}
                      placeholder="Threshold"
                      w="w-16"
                      className="rounded-theme"
                      onNumChanged={v => {
                        updateProps(
                          plotAddr,
                          'displayOptions',
                          produce(displayProps, draft => {
                            draft.cells.values.autoColor.threshold = v
                          })
                        )
                      }}
                    />
                    <InfoHoverCard title="Auto Color Threshold">
                      Threshold for auto coloring value text so it it contrasts
                      with the cell color. For example, it will change the color
                      to white when cell color is blue. Adjust between 0-255 to
                      find a suitable threshold for your data.
                    </InfoHoverCard>
                  </VCenterRow>
                </PopoverContent>
              </Popover>
              <Switch
                title="Threshold"
                checked={displayProps.cells.values.autoColor.on}
                disabled={!displayProps.cells.values.show}
                onCheckedChange={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.cells.values.autoColor.on = v
                    })
                  )
                }}
              />
              {/* <NumericalInput
                  id="cell-autocolor-threshold"
                  value={displayProps.cells.values.autoColor.threshold}
                  limit={[0, 255]}
                  //disabled={!displayProps.cells.values.show}
                  placeholder="Threshold"
                  w="w-16"
                  className="rounded-theme"
                  onNumChanged={v => {
                    updateProps(
                      plotAddr,
                      'displayOptions',
                      produce(displayProps, draft => {
                        draft.cells.values.autoColor.threshold = v
                      })
                    )
                  }}
                /> */}
            </PropRow>

            <SwitchPropRow
              className="ml-3"
              title="Only Values &ge;"
              checked={displayProps.cells.values.filter.on}
              disabled={!displayProps.cells.values.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.cells.values.filter.on = v
                  })
                )
              }}
            >
              <NumericalInput
                id="cell-filter"
                w="w-16"
                value={displayProps.cells.values.filter.value}
                limit={[0, 10000]}
                disabled={
                  !displayProps.cells.values.show ||
                  !displayProps.cells.values.filter.on
                }
                placeholder="Filter"
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.cells.values.filter.value = v
                    })
                  )
                }}
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Border"
              checked={displayProps.cells.border.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.cells.border.show = v
                  })
                )
              }}
            >
              <NumericalInput
                id="cell-stroke-width"
                value={displayProps.cells.border.width}
                placeholder="Stroke..."
                className="rounded-theme"
                w="w-16"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.cells.border.width = v
                    })
                  )
                }}
              />
              <ColorPickerButton
                align="end"
                color={displayProps.cells.border.color}
                onColorChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.cells.border.color = v
                    })
                  )
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
              title={TEXT_SHOW}
              checked={displayProps.legend.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.legend.show = v
                  })
                )
              }}
            >
              <RadioGroupPrimitive.Root
                value={displayProps.legend.position}
                disabled={!displayProps.legend.show}
                onValueChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.legend.position = v as LegendPos
                    })
                  )
                }
                className={cn('flex flex-row justify-start gap-x-1')}
                orientation="horizontal"
              >
                {/* <SideRadioGroupItem
                  value="Off"
                  currentValue={displayProps.legend.position}
                  className="w-5"
                /> */}
                <SideRadioGroupItem
                  title="Right"
                  value="right"
                  currentValue={displayProps.legend.position}
                  disabled={!displayProps.legend.show}
                  className="w-5"
                />
                <SideRadioGroupItem
                  title="Upper Right"
                  value="upper-right"
                  currentValue={displayProps.legend.position}
                  disabled={!displayProps.legend.show}
                  className="w-5"
                />
                <SideRadioGroupItem
                  title="Bottom"
                  value="bottom"
                  currentValue={displayProps.legend.position}
                  disabled={!displayProps.legend.show}
                  className="w-5"
                />
              </RadioGroupPrimitive.Root>
            </SwitchPropRow>

            <SwitchPropRow
              title={TEXT_TITLE}
              className="ml-3"
              checked={displayProps.legend.title.show}
              disabled={!displayProps.legend.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.legend.title.show = v
                  })
                )
              }}
            >
              <Input
                value={displayProps.legend.title.text}
                disabled={!displayProps.legend.show}
                onTextChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.legend.title.text = v
                    })
                  )
                }}
              />
            </SwitchPropRow>

            <SwitchPropRow
              className="ml-3"
              title={TEXT_BORDER}
              checked={displayProps.legend.stroke.show}
              disabled={!displayProps.legend.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.legend.stroke.show = v
                  })
                )
              }}
            >
              <NumericalInput
                id="legend-stroke-width"
                value={displayProps.legend.stroke.width}
                disabled={
                  !displayProps.legend.show || !displayProps.legend.stroke.show
                }
                w="w-16"
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.legend.stroke.width = v
                    })
                  )
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.legend.stroke.color}
                disabled={
                  !displayProps.legend.show || !displayProps.legend.stroke.show
                }
                onColorChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.legend.stroke.color = v
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Dot Legend"
              checked={displayProps.dot.legend.show}
              //disabled={!displayProps.legend.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.dot.legend.show = v
                  })
                )
              }}
            />
            <SwitchPropRow
              title={TEXT_TITLE}
              className="ml-3"
              checked={displayProps.dot.legend.title.show}
              disabled={!displayProps.dot.legend.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.dot.legend.title.show = v
                  })
                )
              }}
            >
              <Input
                value={displayProps.dot.legend.title.text}
                disabled={!displayProps.dot.legend.show}
                onTextChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.dot.legend.title.text = v
                    })
                  )
                }}
              />
            </SwitchPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colormap">
          <AccordionTrigger>Colormap</AccordionTrigger>
          <AccordionContent>
            <PropRow title="Colors">
              <ColorMapMenu
                align="end"
                cmap={COLOR_MAPS[displayProps.cmap]!}
                onChange={cmap =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.cmap = cmap.name
                    })
                  )
                }
              />
            </PropRow>

            <PropRow title="Max">
              <NumericalInput
                id="max"
                value={displayProps.range[1]}
                limit={[0.5, 100]}
                step={0.5}
                dp={1}
                placeholder="Max..."
                w="w-16"
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.range = [-v, v]
                    })
                  )
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Color Bar"
              checked={displayProps.colorbar.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.colorbar.show = v
                  })
                )
              }}
            >
              <RadioGroupPrimitive.Root
                value={displayProps.colorbar.position}
                disabled={!displayProps.colorbar.show}
                onValueChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.colorbar.position = v as ColorBarPos
                    })
                  )
                }
                className="flex flex-row justify-start gap-x-1"
              >
                {/* <SideRadioGroupItem
                  value="Off"
                  currentValue={displayProps.colorbar.position}
                  className="w-5"
                /> */}
                <SideRadioGroupItem
                  value="right"
                  title="Right"
                  currentValue={displayProps.colorbar.position}
                  disabled={!displayProps.colorbar.show}
                  className="w-5"
                />

                <SideRadioGroupItem
                  value="bottom"
                  title="Bottom"
                  currentValue={displayProps.colorbar.position}
                  disabled={!displayProps.colorbar.show}
                  className="w-5"
                />
              </RadioGroupPrimitive.Root>
            </SwitchPropRow>

            <PropRow title="Size" className="ml-3">
              <DoubleNumericalInput
                v1={displayProps.colorbar.size.w}
                v2={displayProps.colorbar.size.h}
                inputCls="rounded-theme"
                limit={[1, 1000]}
                dp={0}
                onNumChanged1={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.colorbar.size.w = v
                    })
                  )
                }}
                onNumChanged2={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.colorbar.size.h = v
                    })
                  )
                }}
              />
            </PropRow>

            <SwitchPropRow
              className="ml-3"
              title="Border"
              checked={displayProps.colorbar.stroke.show}
              disabled={!displayProps.colorbar.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.colorbar.stroke.show = v
                  })
                )
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
                w="w-16"
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.colorbar.stroke.width = v
                    })
                  )
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.legend.stroke.color}
                disabled={
                  !displayProps.legend.show || !displayProps.legend.stroke.show
                }
                onColorChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.colorbar.stroke.color = v
                    })
                  )
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
              title="Show"
              checked={displayProps.rowLabels.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.rowLabels.show = v
                  })
                )
              }}
            >
              <ColorPickerButton
                align="end"
                color={displayProps.rowLabels.color}
                disabled={!displayProps.rowLabels.show}
                onColorChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.rowLabels.color = v
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change text color"
              />
            </SwitchPropRow>

            <SwitchPropRow
              className="ml-3"
              title="Metadata"
              checked={displayProps.rowLabels.showMetadata}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.rowLabels.showMetadata = v
                  })
                )
              }}
            />

            <PropRow title="Position" className="ml-3">
              <RadioGroupPrimitive.Root
                value={displayProps.rowLabels.position}
                disabled={!displayProps.rowLabels.show}
                onValueChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.rowLabels.position = v as LeftRightPos
                    })
                  )
                }
                className="flex flex-row justify-start gap-x-1"
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

            <PropRow title="Width" className="ml-3">
              <NumericalInput
                id="row-label-size"
                w="w-16"
                value={displayProps.rowLabels.width}
                disabled={!displayProps.rowLabels.show}
                limit={[1, 200]}
                placeholder="Row label size..."
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.rowLabels.width = v
                    })
                  )
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
                onCheckedChange={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.rowTree.show = v
                    })
                  )
                }}
              >
                <ColorPickerButton
                  align="end"
                  color={displayProps.rowTree.stroke.color}
                  disabled={!displayProps.rowTree.show}
                  onColorChange={v =>
                    updateProps(
                      plotAddr,
                      'displayOptions',
                      produce(displayProps, draft => {
                        draft.rowTree.stroke.color = v
                      })
                    )
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Change tree color"
                />

                <RadioGroupPrimitive.Root
                  value={displayProps.rowTree.position}
                  disabled={!displayProps.rowTree.show}
                  onValueChange={v =>
                    updateProps(
                      plotAddr,
                      'displayOptions',
                      produce(displayProps, draft => {
                        draft.rowTree.position = v as LeftRightPos
                      })
                    )
                  }
                  className="flex flex-row justify-start gap-x-1"
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

              <PropRow title="Stroke" className="ml-3">
                <NumericalInput
                  id="row-tree-stroke-width"
                  value={displayProps.rowTree.stroke.width}
                  disabled={!displayProps.rowTree.show}
                  placeholder="Stroke..."
                  className="rounded-theme"
                  onNumChanged={v => {
                    updateProps(
                      plotAddr,
                      'displayOptions',
                      produce(displayProps, draft => {
                        draft.rowTree.stroke.width = v
                      })
                    )
                  }}
                />
              </PropRow>

              <PropRow title="Width" className="ml-3">
                <NumericalInput
                  id="row-tree-size"
                  value={displayProps.rowTree.width}
                  disabled={!displayProps.rowTree.show}
                  limit={[1, 200]}
                  w="w-16"
                  placeholder="Tree size..."
                  className="rounded-theme"
                  onNumChanged={v => {
                    updateProps(
                      plotAddr,
                      'displayOptions',
                      produce(displayProps, draft => {
                        draft.rowTree.width = v
                      })
                    )
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
              title="Show"
              checked={displayProps.colLabels.show}
              onCheckedChange={v => {
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.colLabels.show = v
                  })
                )
              }}
            >
              <ColorPickerButton
                align="end"
                color={displayProps.colLabels.color}
                disabled={!displayProps.colLabels.show}
                onColorChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.colLabels.color = v
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change text color"
              />
            </SwitchPropRow>

            <PropRow title="Position" className="ml-3">
              <RadioGroupPrimitive.Root
                value={displayProps.colLabels.position}
                disabled={!displayProps.colLabels.show}
                onValueChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.colLabels.position = v as TopBottomPos
                    })
                  )
                }
                className="flex flex-row justify-start gap-x-1"
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

            <PropRow title="Width" className="ml-3">
              <NumericalInput
                id="col-label-size"
                value={displayProps.colLabels.width}
                disabled={!displayProps.colLabels.show}
                limit={[1, 200]}
                w="w-16"
                placeholder="Column label size..."
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.colLabels.width = v
                    })
                  )
                }}
              />
            </PropRow>

            <SwitchPropRow
              title="Color By Group"
              disabled={!displayProps.colLabels.show}
              className="ml-3"
              checked={displayProps.colLabels.isColored}
              onCheckedChange={v =>
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.colLabels.isColored = v
                  })
                )
              }
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="column-groups">
          <AccordionTrigger>Column Groups</AccordionTrigger>
          <AccordionContent>
            <SwitchPropRow
              title="Show"
              checked={displayProps.groups.show}
              onCheckedChange={v =>
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.groups.show = v
                  })
                )
              }
            />

            <SwitchPropRow
              title="Grid"
              className="ml-3"
              disabled={!displayProps.groups.show}
              checked={displayProps.groups.grid.show}
              onCheckedChange={v =>
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.groups.grid.show = v
                  })
                )
              }
            >
              <NumericalInput
                id="groups-grid-stroke-width"
                value={displayProps.groups.grid.width}
                disabled={
                  !displayProps.groups.show || !displayProps.groups.grid.show
                }
                w="w-16"
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.groups.grid.width = v
                    })
                  )
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.groups.grid.color}
                disabled={!displayProps.groups.show}
                onColorChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.groups.grid.color = v
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change grid color"
              />
            </SwitchPropRow>

            <SwitchPropRow
              title="Border"
              className="ml-3"
              disabled={!displayProps.groups.show}
              checked={displayProps.groups.border.show}
              onCheckedChange={v =>
                updateProps(
                  plotAddr,
                  'displayOptions',
                  produce(displayProps, draft => {
                    draft.groups.border.show = v
                  })
                )
              }
            >
              <NumericalInput
                id="groups-border-stroke-width"
                w="w-16"
                value={displayProps.groups.border.width}
                disabled={
                  !displayProps.groups.show || !displayProps.groups.border.show
                }
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.groups.border.width = v
                    })
                  )
                }}
              />

              <ColorPickerButton
                align="end"
                color={displayProps.groups.border.color}
                disabled={!displayProps.groups.show}
                onColorChange={v =>
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.groups.border.color = v
                    })
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
            </SwitchPropRow>

            <PropRow title="Height" className="ml-3">
              <NumericalInput
                id="max"
                disabled={!displayProps.groups.show}
                value={displayProps.groups.height}
                limit={[1, 100]}
                w="w-16"
                placeholder="Height..."
                className="rounded-theme"
                onNumChanged={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.groups.height = v
                    })
                  )
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
                onCheckedChange={v => {
                  updateProps(
                    plotAddr,
                    'displayOptions',
                    produce(displayProps, draft => {
                      draft.colTree.show = v
                    })
                  )
                }}
              >
                <ColorPickerButton
                  align="end"
                  color={displayProps.colTree.stroke.color}
                  disabled={!displayProps.colTree.show}
                  onColorChange={v =>
                    updateProps(
                      plotAddr,
                      'displayOptions',
                      produce(displayProps, draft => {
                        draft.colTree.stroke.color = v
                      })
                    )
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Change tree color"
                />
              </SwitchPropRow>

              <PropRow title="Stroke" className="ml-3">
                <NumericalInput
                  id="col-tree-stroke-width"
                  value={displayProps.colTree.stroke.width}
                  disabled={!displayProps.colTree.show}
                  placeholder="Stroke..."
                  className="rounded-theme"
                  onNumChanged={v => {
                    updateProps(
                      plotAddr,
                      'displayOptions',
                      produce(displayProps, draft => {
                        draft.colTree.stroke.width = v
                      })
                    )
                  }}
                />
              </PropRow>

              <PropRow title="Height" className="ml-3">
                <NumericalInput
                  id="col-tree-size"
                  value={displayProps.colTree.width}
                  disabled={!displayProps.colTree.show}
                  limit={[1, 200]}
                  placeholder="Tree size..."
                  className="rounded-theme"
                  onNumChanged={v => {
                    updateProps(
                      plotAddr,
                      'displayOptions',
                      produce(displayProps, draft => {
                        draft.colTree.width = v
                      })
                    )
                  }}
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>
        )}
      </ScrollAccordion>
    </PropsPanel>
  )
}
