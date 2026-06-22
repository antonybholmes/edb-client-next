import { FontPopover } from '@/components/plot/font/font-popover'
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
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import { produce } from 'immer'

import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function RowLabelsSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  return (
    <AccordionItem value="row-labels">
      <AccordionTrigger
        rightChildren={
          <>
            {/* <ColorPickerButton
              align="end"
              color={displayProps.rowLabels.font.color}
              disabled={!displayProps.rowLabels.font.show}
              onColorChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.rowLabels.font.color = v
                  }),
                  { file: plotAddr }
                )
              }
              className={SIMPLE_COLOR_EXT_CLS}
              title="Change text color"
            />

            <Switch
              checked={displayProps.rowLabels.font.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.rowLabels.font.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            /> */}

            <FontPopover
              fonts={[
                {
                  title: 'Font',
                  textProps: displayProps.rowLabels,
                  update: (f) => {
                    updatePlot(
                      produce(plot, (draft) => {
                        draft.props.rowLabels.font = f.font
                        draft.props.rowLabels.show = f.show
                      })
                    )
                  },
                },
              ]}
            />
          </>
        }
      >
        Row Labels
      </AccordionTrigger>
      <AccordionContent>
        <CheckPropRow
          title="Metadata"
          checked={displayProps.rowLabels.showMetadata}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.rowLabels.showMetadata = v
              })
            )
          }}
        />

        <PropRow title="Position">
          <RadioGroup
            value={displayProps.rowLabels.position}
            disabled={!displayProps.rowLabels.show}
            onValueChange={(v) =>
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.rowLabels.position = v as LeftRightPos
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
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.rowLabels.width = v
                })
              )
            }}
          />
        </PropRow>
      </AccordionContent>
    </AccordionItem>
  )
}
