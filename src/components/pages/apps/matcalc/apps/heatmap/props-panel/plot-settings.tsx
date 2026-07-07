import { DoubleNumericalInput } from '@/components/double-numerical-input'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { FontPopover } from '@/components/plot/font/font-popover'
import type { IHeatMapDisplayOptions } from '@/components/plot/heatmap/heatmap-svg-props'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/shadcn/ui/themed/v2/accordion'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import { produce } from 'immer'

import { useHistory } from '../../../history/history-provider/history-provider'
import { HeatMapPlot } from '../../../history/history-provider/history-types'
import { useHeatmapContext } from '../heatmap-provider'

export interface PlotSettingsPanelProps {
  displayProps: IHeatMapDisplayOptions
  plot: HeatMapPlot
  plotAddr: string
  updatePlot: (plot: any, options: { file: string }) => void
}

export function PlotSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  return (
    <AccordionItem value="plot">
      <AccordionTrigger>Plot</AccordionTrigger>
      <AccordionContent>
        <PropRow title="Title" labelW="xs">
          <FontPopover
            fonts={[
              {
                title: 'Font',
                textProps: displayProps.title,
                update: (f) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.title.font = f.font
                      draft.props.title.show = f.show
                    })
                  )
                },
              },
            ]}
          />
          <Input
            id="title-text"
            value={displayProps.title.text}
            disabled={!displayProps.title.show}
            placeholder="Title..."
            className="rounded-theme"
            onChange={(e) => {
              const val = e.target.value
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.title.text = val
                })
              )
            }}
          />
        </PropRow>

        <PropRow title="Cell">
          <DoubleNumericalInput
            v1={displayProps.blockSize.w}
            v2={displayProps.blockSize.h}
            inputCls="rounded-theme"
            dp={0}
            onNumChanged1={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.blockSize.w = v
                })
              )
            }}
            onNumChanged2={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.blockSize.h = v
                })
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
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.padding = v
                })
              )
            }}
          />
        </PropRow>

        <CheckPropRow
          title="Grid"
          checked={displayProps.grid.show}
          onCheckedChange={(v) =>
            updatePlot(
              produce(plot, (draft) => {
                draft.props.grid.show = v
              })
            )
          }
        >
          <ColorPickerButton
            align="end"
            colors={[
              {
                color: displayProps.grid.value,
                width: displayProps.grid.width,
                opacity: displayProps.grid.opacity,
                onColorChange: ({ color, opacity, width }) =>
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.grid.value = color
                      draft.props.grid.opacity =
                        opacity ?? draft.props.grid.opacity
                      draft.props.grid.width = width ?? displayProps.grid.width
                    })
                  ),
              },
            ]}
            disabled={!displayProps.grid.show}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Grid Lines Color"
          />
          {/* <NumericalInput
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
                  /> */}
        </CheckPropRow>

        <CheckPropRow
          title="Border"
          checked={displayProps.border.show}
          onCheckedChange={(v) =>
            updatePlot(
              produce(plot, (draft) => {
                draft.props.border.show = v
              })
            )
          }
        >
          <ColorPickerButton
            align="end"
            colors={[
              {
                color: displayProps.border.value,
                width: displayProps.border.width,
                opacity: displayProps.border.opacity,
                onColorChange: ({ color, opacity, width }) =>
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.border.value = color
                      draft.props.border.opacity =
                        opacity ?? displayProps.border.opacity
                      draft.props.border.width =
                        width ?? displayProps.border.width
                    })
                  ),
              },
            ]}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Border Color"
          />
          {/* <NumericalInput
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
                    /> */}
        </CheckPropRow>

        <CheckPropRow
          title="Actions list"
          checked={displayProps.actions.show}
          onCheckedChange={(v) =>
            updatePlot(
              produce(plot, (draft) => {
                draft.props.actions.show = v
              })
            )
          }
        />
      </AccordionContent>
    </AccordionItem>
  )
}
