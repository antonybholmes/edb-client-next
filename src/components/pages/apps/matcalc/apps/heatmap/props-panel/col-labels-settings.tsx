import { FontPopover } from '@/components/plot/font/font-popover'
import type { TopBottomPos } from '@/components/plot/svg-props'
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
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import { produce } from 'immer'

import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function ColLabelsSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()
  return (
    <AccordionItem value="column-labels">
      <AccordionTrigger
        rightChildren={
          <>
            {/* <ColorPickerButton
              align="end"
              color={displayProps.colLabels.font.color}
              disabled={!displayProps.colLabels.font.show}
              onColorChange={v =>
                updatePlot(
                  produce(plot, draft => {
                    draft.props.colLabels.font.color = v
                  }),
                  { file: plotAddr }
                )
              }
              className={SIMPLE_COLOR_EXT_CLS}
              title="Change text color"
            />
            <Switch
              title={TEXT_SHOW}
              checked={displayProps.colLabels.font.show}
              onCheckedChange={v => {
                updatePlot(
                  produce(plot, draft => {
                    draft.props.colLabels.font.show = v
                  }),
                  { file: plotAddr }
                )
              }}
            /> */}

            <FontPopover
              fonts={[
                {
                  title: 'Font',
                  textProps: displayProps.colLabels,
                  update: (f) => {
                    updatePlot(
                      produce(plot, (draft) => {
                        draft.props.colLabels.font = f.font
                        draft.props.colLabels.show = f.show
                      })
                    )
                  },
                },
              ]}
            />
          </>
        }
      >
        Column Labels
      </AccordionTrigger>
      <AccordionContent>
        <PropRow title="Position">
          <RadioGroup
            value={displayProps.colLabels.position}
            disabled={!displayProps.colLabels.show}
            onValueChange={(v) =>
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.colLabels.position = v as TopBottomPos
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
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.colLabels.width = v
                })
              )
            }}
          />
        </PropRow>

        <CheckPropRow
          title="Color By Group"
          disabled={!displayProps.colLabels.show}
          checked={displayProps.colLabels.isColored}
          onCheckedChange={(v) =>
            updatePlot(
              produce(plot, (draft) => {
                draft.props.colLabels.isColored = v
              })
            )
          }
        />
      </AccordionContent>
    </AccordionItem>
  )
}
