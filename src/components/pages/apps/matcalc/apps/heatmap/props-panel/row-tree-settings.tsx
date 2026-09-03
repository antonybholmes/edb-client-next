import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/shadcn/ui/themed/v2/accordion'
import {
  RadioGroup,
  SideRadioGroupItem,
} from '@/components/shadcn/ui/themed/v2/radio-group'
import type { LeftRightPos } from '@/components/side'
import { TEXT_SHOW } from '@/consts'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import { produce } from 'immer'

import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function RowTreeSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  return (
    <AccordionItem value="row-tree">
      <AccordionTrigger>Row Tree</AccordionTrigger>
      <AccordionContent>
        <CheckPropRow
          title={TEXT_SHOW}
          checked={displayProps.tree.row.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.tree.row.show = v
              })
            )
          }}
        >
          <RadioGroup
            value={displayProps.tree.row.position}
            disabled={!displayProps.tree.row.show}
            onValueChange={(v) =>
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.tree.row.position = v as LeftRightPos
                })
              )
            }
            className="flex flex-row justify-start gap-x-1"
          >
            <SideRadioGroupItem
              disabled={!displayProps.tree.row.show}
              value="Left"
              currentValue={displayProps.tree.row.position}
              className="w-5.5"
            />
            <SideRadioGroupItem
              disabled={!displayProps.tree.row.show}
              value="Right"
              currentValue={displayProps.tree.row.position}
              className="w-5.5"
            />
          </RadioGroup>

          <ColorPickerButton
            align="end"
            colors={[
              {
                color: displayProps.tree.row.stroke.value,
                onColorChange: ({ color }) =>
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.tree.row.stroke.value = color
                    })
                  ),
              },
            ]}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Change tree color"
          />
        </CheckPropRow>

        <PropRow title="Stroke">
          <NumericalInput
            id="row-tree-stroke-width"
            value={displayProps.tree.row.stroke.width}
            disabled={!displayProps.tree.row.show}
            placeholder="Stroke..."
            className="rounded-theme"
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.tree.row.stroke.width = v
                })
              )
            }}
          />
        </PropRow>

        <PropRow title="Width">
          <NumericalInput
            id="row-tree-size"
            value={displayProps.tree.row.width}
            disabled={!displayProps.tree.row.show}
            limit={[1, 200]}
            placeholder="Tree size..."
            className="rounded-theme"
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.tree.row.width = v
                })
              )
            }}
          />
        </PropRow>
      </AccordionContent>
    </AccordionItem>
  )
}
