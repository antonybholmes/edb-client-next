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
                  textProps: displayProps.labels.row,
                  update: (f) => {
                    updatePlot(
                      produce(plot, (draft) => {
                        draft.props.labels.row.font = f.font
                        draft.props.labels.row.show = f.show
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
          checked={displayProps.labels.row.showMetadata}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.labels.row.showMetadata = v
              })
            )
          }}
        />

        <PropRow title="Position">
          <RadioGroup
            value={displayProps.labels.row.position}
            disabled={!displayProps.labels.row.show}
            onValueChange={(v) =>
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.labels.row.position = v as LeftRightPos
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
              disabled={!displayProps.labels.row.show}
              value="Left"
              currentValue={displayProps.labels.row.position}
              className="w-5.5"
            />
            <SideRadioGroupItem
              disabled={!displayProps.labels.row.show}
              value="Right"
              currentValue={displayProps.labels.row.position}
              className="w-5.5"
            />
          </RadioGroup>
        </PropRow>

        <PropRow title="Width">
          <NumericalInput
            id="row-label-size"
            value={displayProps.labels.row.width}
            disabled={!displayProps.labels.row.show}
            limit={[1, 200]}
            placeholder="Row label size..."
            className="rounded-theme"
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.labels.row.width = v
                })
              )
            }}
          />
        </PropRow>
      </AccordionContent>
    </AccordionItem>
  )
}
