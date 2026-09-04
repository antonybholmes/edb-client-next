import { DoubleNumericalInput } from '@/components/double-numerical-input'
import type {
  HeatmapMode,
  IHeatMapSettings,
} from '@/components/pages/apps/matcalc/apps/heatmap/heatmap-settings-store'
import { FontPopover } from '@/components/plot/font/font-popover'
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

import { VCenterRow } from '@/components/layout/v-center-row'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { Circle, Square } from 'lucide-react'
import { useHistory } from '../../../history/history-provider/history-provider'
import { IHeatMapPlot } from '../../../history/history-provider/history-types'
import { useHeatmapContext } from '../heatmap-provider'

export interface PlotSettingsPanelProps {
  displayProps: IHeatMapSettings
  plot: IHeatMapPlot
  plotAddr: string
  updatePlot: (plot: any, options: { file: string }) => void
}

export function PlotSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  console.log(displayProps, plot)

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

        <PropRow title="Grid">
          <VCenterRow>
            <OutlineButton
              colors={[
                {
                  color: displayProps.grid.value,
                  opacity: displayProps.grid.opacity,
                  onColorChange: ({
                    color,
                    opacity,
                    width,
                    dasharray,
                    show,
                  }) => {
                    updatePlot(
                      produce(plot, (draft) => {
                        draft.props.grid.value = color
                        draft.props.grid.opacity = opacity ?? 1
                        draft.props.grid.show = show ?? draft.props.grid.show
                        draft.props.grid.width = width ?? draft.props.grid.width
                        draft.props.grid.dasharray =
                          dasharray ?? draft.props.grid.dasharray
                      })
                    )
                  },
                },
              ]}

              title="Grid Outline"
            />

            <OutlineButton
              colors={[
                {
                  color: displayProps.border.value,
                  opacity: displayProps.border.opacity,
                  onColorChange: ({
                    color,
                    opacity,
                    width,
                    dasharray,
                    show,
                  }) => {
                    updatePlot(
                      produce(plot, (draft) => {
                        draft.props.border.value = color
                        draft.props.border.opacity = opacity ?? 1
                        draft.props.border.show =
                          show ?? draft.props.border.show
                        draft.props.border.width =
                          width ?? draft.props.border.width
                        draft.props.border.dasharray =
                          dasharray ?? draft.props.border.dasharray
                      })
                    )
                  },
                },
              ]}

              title="Border Outline"
            />
          </VCenterRow>
        </PropRow>

        <PropRow title="Style">
          <ToggleGroup
            value={[displayProps.mode]}
            onValueChange={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.mode = v[0] as HeatmapMode
                })
              )
            }}
            className="gap-x-0.5"
            variant="outline"
            pad="none"
          >
            <GroupToggle value="heatmap" title="Heatmap">
              <Square size={16} />
            </GroupToggle>
            <GroupToggle value="dot" title="Dot">
              <Circle size={16} />
            </GroupToggle>
          </ToggleGroup>
        </PropRow>

        <CheckPropRow
          title="Actions List"
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
