import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/shadcn/ui/themed/v2/accordion'
import { InfoHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import { ExtTitle } from '@/dialogs/switch-prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import { produce } from 'immer'

import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function CellSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  return (
    <AccordionItem value="cells">
      <AccordionTrigger>Cells</AccordionTrigger>
      <AccordionContent>
        <CheckPropRow
          title="Values"
          checked={displayProps.cells.values.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.cells.values.show = v
              })
            )
          }}
        >
          <NumericalInput
            id="cell-dp"
            value={displayProps.cells.values.dp}
            limit={[0, 10]}
            //disabled={!displayProps.cells.values.show}
            placeholder="Decimals"
            className="rounded-theme"
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.cells.values.dp = v
                })
              )
            }}
          />
          <span>dp</span>
        </CheckPropRow>
        <PropRow title={<ExtTitle title="Color"></ExtTitle>}>
          <FillButton
            disabled={!displayProps.cells.values.show}
            colors={[
              {
                color: displayProps.cells.values.color,
                allowNoColor: true,
                onColorChange: ({ color }) =>
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.cells.values.color = color
                      draft.props.cells.values.autoColor.on = false
                    })
                  ),
              },
            ]}

            title="Change value color"
          />
        </PropRow>

        <CheckPropRow
          className="ml-3"
          title="Auto-threshold"
          checked={displayProps.cells.values.autoColor.on}
          disabled={!displayProps.cells.values.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.cells.values.autoColor.on = v
              })
            )
          }}
        >
          <InfoHoverCard>
            Threshold for auto coloring value text so it it contrasts with the
            cell color. For example, it will change the color to white when cell
            color is blue. Adjust between 0-255 to find a suitable threshold for
            your data.
          </InfoHoverCard>
        </CheckPropRow>

        <CheckPropRow
          title="Only Values &ge;"
          checked={displayProps.cells.values.filter.on}
          disabled={!displayProps.cells.values.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.cells.values.filter.on = v
              })
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
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.cells.values.filter.value = v
                })
              )
            }}
          />
        </CheckPropRow>

        <CheckPropRow
          title="Border"
          checked={displayProps.cells.border.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.cells.border.show = v
              })
            )
          }}
        >
          <OutlineButton
            align="end"
            colors={[
              {
                color: displayProps.cells.border.value,
                width: displayProps.cells.border.width,
                opacity: displayProps.cells.border.opacity,
                onColorChange: ({ color, opacity, width }) =>
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.cells.border.value = color
                      draft.props.cells.border.opacity =
                        opacity ?? draft.props.cells.border.opacity
                      draft.props.cells.border.width =
                        width ?? displayProps.cells.border.width
                    })
                  ),
              },
            ]}

            title="Border Color"
          />
          {/* <NumericalInput
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
                    /> */}
        </CheckPropRow>

        <CheckPropRow
          title="Tooltips"
          checked={displayProps.tooltip.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.tooltip.show = v
              })
            )
          }}
        ></CheckPropRow>
      </AccordionContent>
    </AccordionItem>
  )
}
