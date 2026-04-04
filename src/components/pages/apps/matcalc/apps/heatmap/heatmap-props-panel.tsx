import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { PropsPanel } from '@/components/props-panel'
import { PropRow } from '@/dialog/prop-row'
import { ExtTitle, SwitchPropRow } from '@/dialog/switch-prop-row'
import type { IClusterFrame } from '@/lib/math/hcluster'
import { NumericalInput } from '@/themed/numerical-input'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  ScrollAccordion,
} from '@/themed/v2/accordion'
import { RadioGroup, SideRadioGroupItem } from '@/themed/v2/radio-group'

import { useState } from 'react'

import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color/color-picker-button'
import {
  DEFAULT_HEATMAP_PROPS,
  type IHeatMapDisplayOptions,
} from '@/components/plot/heatmap/heatmap-svg-props'
import type {
  ColorBarPos,
  LegendPos,
  TopBottomPos,
} from '@/components/plot/svg-props'
import type { LeftRightPos } from '@/components/side'
import { TEXT_BORDER, TEXT_RESET, TEXT_SHOW, TEXT_TITLE } from '@/consts'
import { VCenterRow } from '@/layout/v-center-row'
import { LinkButton } from '@/themed/link-button'

import { CheckPropRow } from '@/components/dialog/check-prop-row'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import type { IDivProps } from '@/interfaces/div-props'
import { COLOR_MAPS } from '@/lib/color/colormap'
import { produce } from 'immer'
import { ColorMapMenu } from '../../color-map-menu'
import {
  useHistory,
  usePlot,
  type HeatMapPlot,
} from '../../history/history-store'

export interface IProps extends IDivProps {
  plotAddr: string
}

export function HeatmapPropsPanel({ ref, plotAddr }: IProps) {
  // const { plotsState, historyDispatch } = useContext(PlotsContext)

  // const plot = plotsState.plotMap[plotId]

  // if (!plot) {
  //   return null
  // }

  const { updatePlot } = useHistory()

  const plot = usePlot(plotAddr)! as HeatMapPlot

  const cf = plot?.dataframes['main'] as IClusterFrame

  const displayProps: IHeatMapDisplayOptions = plot.props

  const [openTabs, setOpenTabs] = useState<string[]>(['plot'])

  return (
    <PropsPanel ref={ref} className="pr-1.5">
      <VCenterRow className="justify-end pb-2">
        <LinkButton
          onClick={() => {
            // reset properties for either heatmaps or dot plots
            const props: IHeatMapDisplayOptions = {
              ...DEFAULT_HEATMAP_PROPS,
              mode: displayProps.mode,
              dot: displayProps.dot,
            }

            updatePlot(
              produce(plot, draft => {
                draft.props = props
              }),
              { file: plotAddr }
            )
          }}
          title="Reset Properties to Defaults"
        >
          {TEXT_RESET}
        </LinkButton>
      </VCenterRow>
      <ScrollAccordion
        value={openTabs}
        onValueChange={v => setOpenTabs(v as string[])}
        //multiple={false}
        variant="sidebar"
      >
        <AccordionItem value="plot">
          <AccordionTrigger variant="sidebar">Plot</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <CheckPropRow
              title="Title"
              checked={displayProps.title.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.title.show = v
                  }),
                  { file: plotAddr }
                )
              }
            >
              <Input
                id="title-text"
                value={displayProps.title.text}
                disabled={!displayProps.title.show}
                placeholder="Title..."
                className="rounded-theme"
                onChange={e => {
                  const val = e.target.value
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.title.text = val
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </CheckPropRow>

            <PropRow title="Cell size">
              <DoubleNumericalInput
                v1={displayProps.blockSize.w}
                v2={displayProps.blockSize.h}
                inputCls="rounded-theme"
                dp={0}
                onNumChanged1={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.blockSize.w = v
                    }),
                    { file: plotAddr }
                  )
                }}
                onNumChanged2={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.blockSize.h = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>

            <PropRow title="Padding">
              <NumericalInput
                id="padding"
                value={displayProps.padding}
                placeholder="Padding..."
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.padding = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>

            <CheckPropRow
              title="Grid"
              checked={displayProps.grid.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.grid.show = v
                  }),
                  { file: plotAddr }
                )
              }
            >
              <ColorPickerButton
                align="end"
                color={displayProps.grid.color}
                disabled={!displayProps.grid.show}
                onColorChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.grid.color = v
                    }),
                    { file: plotAddr }
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change grid lines color"
              />
              <NumericalInput
                id="col-tree-stroke-width"
                value={displayProps.grid.width}
                disabled={!displayProps.grid.show}
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.grid.width = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </CheckPropRow>

            <CheckPropRow
              title="Border"
              checked={displayProps.border.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.border.show = v
                  }),
                  { file: plotAddr }
                )
              }
            >
              <ColorPickerButton
                align="end"
                color={displayProps.border.color}
                disabled={!displayProps.border.show}
                onColorChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.border.color = v
                    }),
                    { file: plotAddr }
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
              <NumericalInput
                id="border-stroke-width"
                value={displayProps.border.width}
                disabled={!displayProps.border.show}
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.border.width = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </CheckPropRow>

            <CheckPropRow
              title="Actions list"
              checked={displayProps.actions.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.actions.show = v
                  }),
                  { file: plotAddr }
                )
              }
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="cells">
          <AccordionTrigger variant="sidebar">Cells</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <CheckPropRow
              title="Values"
              checked={displayProps.cells.values.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.cells.values.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <span>Precision</span>
              <NumericalInput
                id="cell-dp"
                value={displayProps.cells.values.dp}
                limit={[0, 10]}
                //disabled={!displayProps.cells.values.show}
                placeholder="Decimals"
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.cells.values.dp = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
              <span>dp</span>
            </CheckPropRow>
            <PropRow title={<ExtTitle title="Color"></ExtTitle>}>
              <ColorPickerButton
                align="end"
                disabled={!displayProps.cells.values.show}
                color={displayProps.cells.values.color}
                onColorChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.cells.values.color = v
                      draft.props.cells.values.autoColor.on = false
                    }),
                    { file: plotAddr }
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change value color"
              />
            </PropRow>

            <CheckPropRow
              className="ml-4"
              title="Auto-threshold"
              checked={displayProps.cells.values.autoColor.on}
              disabled={!displayProps.cells.values.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.cells.values.autoColor.on = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <InfoHoverCard>
                Threshold for auto coloring value text so it it contrasts with
                the cell color. For example, it will change the color to white
                when cell color is blue. Adjust between 0-255 to find a suitable
                threshold for your data.
              </InfoHoverCard>
            </CheckPropRow>

            <CheckPropRow
              title="Only Values &ge;"
              checked={displayProps.cells.values.filter.on}
              disabled={!displayProps.cells.values.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.cells.values.filter.on = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <NumericalInput
                id="cell-filter"
                value={displayProps.cells.values.filter.value}
                limit={[0, 10000]}
                disabled={
                  !displayProps.cells.values.show ||
                  !displayProps.cells.values.filter.on
                }
                placeholder="Filter"
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.cells.values.filter.value = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </CheckPropRow>

            <CheckPropRow
              title="Border"
              checked={displayProps.cells.border.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.cells.border.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <ColorPickerButton
                align="end"
                color={displayProps.cells.border.color}
                onColorChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.cells.border.color = v
                    }),
                    { file: plotAddr }
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
              <NumericalInput
                id="cell-stroke-width"
                value={displayProps.cells.border.width}
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.cells.border.width = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </CheckPropRow>

            <CheckPropRow
              title="Tooltips"
              checked={displayProps.tooltip.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.tooltip.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            ></CheckPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="legend">
          <AccordionTrigger variant="sidebar">Legend</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <CheckPropRow
              title={TEXT_SHOW}
              checked={displayProps.legend.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.legend.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <RadioGroup
                value={displayProps.legend.position}
                disabled={!displayProps.legend.show}
                onValueChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.legend.position = v as LegendPos
                    }),
                    { file: plotAddr }
                  )
                }
                className="flex flex-row justify-start gap-x-1"
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
                  className="w-5.5"
                />
                <SideRadioGroupItem
                  title="Upper Right"
                  value="upper-right"
                  currentValue={displayProps.legend.position}
                  disabled={!displayProps.legend.show}
                  className="w-5.5"
                />
                <SideRadioGroupItem
                  title="Bottom"
                  value="bottom"
                  currentValue={displayProps.legend.position}
                  disabled={!displayProps.legend.show}
                  className="w-5.5"
                />
              </RadioGroup>
            </CheckPropRow>

            <CheckPropRow
              title={TEXT_TITLE}
              checked={displayProps.legend.title.show}
              disabled={!displayProps.legend.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.legend.title.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <Input
                value={displayProps.legend.title.text}
                disabled={!displayProps.legend.show}
                onTextChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.legend.title.text = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </CheckPropRow>

            <CheckPropRow
              title="Border"
              checked={displayProps.legend.stroke.show}
              disabled={!displayProps.legend.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.legend.stroke.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <ColorPickerButton
                align="end"
                color={displayProps.legend.stroke.color}
                disabled={
                  !displayProps.legend.show || !displayProps.legend.stroke.show
                }
                onColorChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.legend.stroke.color = v
                    }),
                    { file: plotAddr }
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
              <NumericalInput
                id="legend-stroke-width"
                value={displayProps.legend.stroke.width}
                disabled={
                  !displayProps.legend.show || !displayProps.legend.stroke.show
                }
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.legend.stroke.width = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </CheckPropRow>

            <CheckPropRow
              title="Dot Legend"
              checked={displayProps.dot.legend.show}
              //disabled={!displayProps.legend.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.dot.legend.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            />
            <CheckPropRow
              title={TEXT_TITLE}
              checked={displayProps.dot.legend.title.show}
              disabled={!displayProps.dot.legend.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.dot.legend.title.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <Input
                value={displayProps.dot.legend.title.text}
                disabled={!displayProps.dot.legend.show}
                onTextChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.dot.legend.title.text = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </CheckPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colormap">
          <AccordionTrigger variant="sidebar">Colormap</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <PropRow title="Colors">
              <ColorMapMenu
                align="end"
                cmap={COLOR_MAPS[displayProps.cmap]!}
                onChange={cmap =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.cmap = cmap.name
                    }),
                    { file: plotAddr }
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
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.range = [-v, v]
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>

            <CheckPropRow
              title="Color Bar"
              checked={displayProps.colorbar.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.colorbar.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <RadioGroup
                value={displayProps.colorbar.position}
                disabled={!displayProps.colorbar.show}
                onValueChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.colorbar.position = v as ColorBarPos
                    }),
                    { file: plotAddr }
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
                  className="w-5.5"
                />

                <SideRadioGroupItem
                  value="bottom"
                  title="Bottom"
                  currentValue={displayProps.colorbar.position}
                  disabled={!displayProps.colorbar.show}
                  className="w-5.5"
                />
              </RadioGroup>
            </CheckPropRow>

            <PropRow title="Size">
              <DoubleNumericalInput
                v1={displayProps.colorbar.size.w}
                v2={displayProps.colorbar.size.h}
                inputCls="rounded-theme"
                limit={[1, 1000]}
                dp={0}
                onNumChanged1={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.colorbar.size.w = v
                    }),
                    { file: plotAddr }
                  )
                }}
                onNumChanged2={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.colorbar.size.h = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>

            <CheckPropRow
              title={TEXT_BORDER}
              checked={displayProps.colorbar.stroke.show}
              disabled={!displayProps.colorbar.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.colorbar.stroke.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <ColorPickerButton
                align="end"
                color={displayProps.legend.stroke.color}
                disabled={
                  !displayProps.legend.show || !displayProps.legend.stroke.show
                }
                onColorChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.colorbar.stroke.color = v
                    }),
                    { file: plotAddr }
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />

              <NumericalInput
                id="colorbar-stroke-width"
                value={displayProps.colorbar.stroke.width}
                disabled={
                  !displayProps.colorbar.show ||
                  !displayProps.colorbar.stroke.show
                }
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.colorbar.stroke.width = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </CheckPropRow>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="row-labels">
          <AccordionTrigger variant="sidebar">Row Labels</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <CheckPropRow
              title={<ExtTitle title="Show"></ExtTitle>}
              checked={displayProps.rowLabels.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.rowLabels.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <ColorPickerButton
                align="end"
                color={displayProps.rowLabels.color}
                disabled={!displayProps.rowLabels.show}
                onColorChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.rowLabels.color = v
                    }),
                    { file: plotAddr }
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change text color"
              />
            </CheckPropRow>

            <CheckPropRow
              title="Metadata"
              checked={displayProps.rowLabels.showMetadata}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.rowLabels.showMetadata = v
                  }),
                  { file: plotAddr }
                )
              }}
            />

            <PropRow title="Position">
              <RadioGroup
                value={displayProps.rowLabels.position}
                disabled={!displayProps.rowLabels.show}
                onValueChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.rowLabels.position = v as LeftRightPos
                    }),
                    { file: plotAddr }
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
                  className="w-5.5"
                />
                <SideRadioGroupItem
                  disabled={!displayProps.rowLabels.show}
                  value="Right"
                  currentValue={displayProps.rowLabels.position}
                  className="w-5.5"
                />
              </RadioGroup>
            </PropRow>

            <PropRow title="Width">
              <NumericalInput
                id="row-label-size"
                value={displayProps.rowLabels.width}
                disabled={!displayProps.rowLabels.show}
                limit={[1, 200]}
                placeholder="Row label size..."
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.rowLabels.width = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>

        {cf?.rowTree && (
          <AccordionItem value="row-tree">
            <AccordionTrigger variant="sidebar">Row Tree</AccordionTrigger>
            <AccordionContent variant="sidebar">
              <CheckPropRow
                title={TEXT_SHOW}
                checked={displayProps.rowTree.show}
                onCheckedChange={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.rowTree.show = v
                    }),
                    { file: plotAddr }
                  )
                }}
              >
                <RadioGroup
                  value={displayProps.rowTree.position}
                  disabled={!displayProps.rowTree.show}
                  onValueChange={v =>
                    updatePlot(
                      produce(plot, draft => {
                        draft.props.rowTree.position = v as LeftRightPos
                      }),
                      { file: plotAddr }
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
                    className="w-5.5"
                  />
                  <SideRadioGroupItem
                    disabled={!displayProps.rowTree.show}
                    value="Right"
                    currentValue={displayProps.rowTree.position}
                    className="w-5.5"
                  />
                </RadioGroup>

                <ColorPickerButton
                  align="end"
                  color={displayProps.rowTree.stroke.color}
                  disabled={!displayProps.rowTree.show}
                  onColorChange={v =>
                    updatePlot(
                      produce(plot, draft => {
                        draft.props.rowTree.stroke.color = v
                      }),
                      { file: plotAddr }
                    )
                  }
                  className={SIMPLE_COLOR_EXT_CLS}
                  title="Change tree color"
                />
              </CheckPropRow>

              <PropRow title="Stroke">
                <NumericalInput
                  id="row-tree-stroke-width"
                  value={displayProps.rowTree.stroke.width}
                  disabled={!displayProps.rowTree.show}
                  placeholder="Stroke..."
                  className="rounded-theme"
                  onNumChanged={v => {
                    updatePlot(
                      produce(plot, draft => {
                        draft.props.rowTree.stroke.width = v
                      }),
                      { file: plotAddr }
                    )
                  }}
                />
              </PropRow>

              <PropRow title="Width">
                <NumericalInput
                  id="row-tree-size"
                  value={displayProps.rowTree.width}
                  disabled={!displayProps.rowTree.show}
                  limit={[1, 200]}
                  placeholder="Tree size..."
                  className="rounded-theme"
                  onNumChanged={v => {
                    updatePlot(
                      produce(plot, draft => {
                        draft.props.rowTree.width = v
                      }),
                      { file: plotAddr }
                    )
                  }}
                />
              </PropRow>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="column-labels">
          <AccordionTrigger variant="sidebar">Column Labels</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <CheckPropRow
              title={TEXT_SHOW}
              checked={displayProps.colLabels.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.colLabels.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            >
              <ColorPickerButton
                align="end"
                color={displayProps.colLabels.color}
                disabled={!displayProps.colLabels.show}
                onColorChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.colLabels.color = v
                    }),
                    { file: plotAddr }
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change text color"
              />
            </CheckPropRow>

            <PropRow title="Position">
              <RadioGroup
                value={displayProps.colLabels.position}
                disabled={!displayProps.colLabels.show}
                onValueChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.colLabels.position = v as TopBottomPos
                    }),
                    { file: plotAddr }
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
                  className="w-5.5"
                />
                <SideRadioGroupItem
                  disabled={!displayProps.colLabels.show}
                  value="Bottom"
                  currentValue={displayProps.colLabels.position}
                  className="w-5.5"
                />
              </RadioGroup>
            </PropRow>

            <PropRow title="Width">
              <NumericalInput
                id="col-label-size"
                value={displayProps.colLabels.width}
                disabled={!displayProps.colLabels.show}
                limit={[1, 200]}
                placeholder="Column label size..."
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.colLabels.width = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>

            <CheckPropRow
              title="Color By Group"
              disabled={!displayProps.colLabels.show}
              checked={displayProps.colLabels.isColored}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.colLabels.isColored = v
                  }),
                  { file: plotAddr }
                )
              }
            />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="column-groups">
          <AccordionTrigger variant="sidebar">Column Groups</AccordionTrigger>
          <AccordionContent variant="sidebar">
            <CheckPropRow
              title={TEXT_SHOW}
              checked={displayProps.groups.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.groups.show = v
                  }),
                  { file: plotAddr }
                )
              }
            />

            <CheckPropRow
              title="Grid"
              disabled={!displayProps.groups.show}
              checked={displayProps.groups.grid.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.groups.grid.show = v
                  }),
                  { file: plotAddr }
                )
              }
            >
              <ColorPickerButton
                align="end"
                color={displayProps.groups.grid.color}
                disabled={!displayProps.groups.show}
                onColorChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.groups.grid.color = v
                    }),
                    { file: plotAddr }
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change grid color"
              />

              <NumericalInput
                id="groups-grid-stroke-width"
                value={displayProps.groups.grid.width}
                disabled={
                  !displayProps.groups.show || !displayProps.groups.grid.show
                }
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.groups.grid.width = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </CheckPropRow>

            <CheckPropRow
              title={TEXT_BORDER}
              disabled={!displayProps.groups.show}
              checked={displayProps.groups.border.show}
              onCheckedChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.groups.border.show = v
                  }),
                  { file: plotAddr }
                )
              }
            >
              <ColorPickerButton
                align="end"
                color={displayProps.groups.border.color}
                disabled={!displayProps.groups.show}
                onColorChange={v =>
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.groups.border.color = v
                    }),
                    { file: plotAddr }
                  )
                }
                className={SIMPLE_COLOR_EXT_CLS}
                title="Change border color"
              />
              <NumericalInput
                id="groups-border-stroke-width"
                value={displayProps.groups.border.width}
                disabled={
                  !displayProps.groups.show || !displayProps.groups.border.show
                }
                placeholder="Stroke..."
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.groups.border.width = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </CheckPropRow>

            <PropRow title="Height">
              <NumericalInput
                id="max"
                disabled={!displayProps.groups.show}
                value={displayProps.groups.height}
                limit={[1, 100]}
                placeholder="Height..."
                className="rounded-theme"
                onNumChanged={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.groups.height = v
                    }),
                    { file: plotAddr }
                  )
                }}
              />
            </PropRow>
          </AccordionContent>
        </AccordionItem>
        {cf?.colTree && (
          <AccordionItem value="column-tree">
            <AccordionTrigger variant="sidebar">Column Tree</AccordionTrigger>
            <AccordionContent variant="sidebar">
              <SwitchPropRow
                title="Show tree"
                checked={displayProps.colTree.show}
                onCheckedChange={v => {
                  updatePlot(
                    produce(plot, draft => {
                      draft.props.colTree.show = v
                    }),
                    { file: plotAddr }
                  )
                }}
              >
                <ColorPickerButton
                  align="end"
                  color={displayProps.colTree.stroke.color}
                  disabled={!displayProps.colTree.show}
                  onColorChange={v =>
                    updatePlot(
                      produce(plot, draft => {
                        draft.props.colTree.stroke.color = v
                      }),
                      { file: plotAddr }
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
                    updatePlot(
                      produce(plot, draft => {
                        draft.props.colTree.stroke.width = v
                      }),
                      { file: plotAddr }
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
                    updatePlot(
                      produce(plot, draft => {
                        draft.props.colTree.width = v
                      }),
                      { file: plotAddr }
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
