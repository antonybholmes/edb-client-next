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
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { TEXT_BORDER, TEXT_HEIGHT, TEXT_SHOW } from '@/consts'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import { produce } from 'immer'

import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function ColGroupsSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  return (
    <AccordionItem value="column-groups">
      <AccordionTrigger
        rightChildren={
          <Switch
            title={TEXT_SHOW}
            checked={displayProps.groups.show}
            onCheckedChange={(v) =>
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.groups.show = v
                })
              )
            }
          />
        }
      >
        Column Groups
      </AccordionTrigger>
      <AccordionContent>
        <PropRow title={TEXT_HEIGHT}>
          <NumericalInput
            title="Height"
            disabled={!displayProps.groups.show}
            value={displayProps.groups.height}
            limit={[1, 100]}
            placeholder="Height..."
            className="rounded-theme"
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.groups.height = v
                })
              )
            }}
          />
        </PropRow>

        <CheckPropRow
          title="Grid"
          disabled={!displayProps.groups.show}
          checked={displayProps.groups.grid.show}
          onCheckedChange={(v) =>
            updatePlot(
              produce(plot, (draft) => {
                draft.props.groups.grid.show = v
              })
            )
          }
        >
          <ColorPickerButton
            align="end"
            colors={[
              {
                color: displayProps.groups.grid.value,
                width: displayProps.groups.grid.width,
                opacity: displayProps.groups.grid.opacity,
                onColorChange: ({ color, opacity, width }) =>
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.groups.grid.value = color
                      draft.props.groups.grid.opacity = opacity
                      draft.props.groups.grid.width =
                        width ?? displayProps.groups.grid.width
                    })
                  ),
              },
            ]}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Grid Color"
          />

          {/* <NumericalInput
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
                /> */}
        </CheckPropRow>

        <CheckPropRow
          title={TEXT_BORDER}
          disabled={!displayProps.groups.show}
          checked={displayProps.groups.border.show}
          onCheckedChange={(v) =>
            updatePlot(
              produce(plot, (draft) => {
                draft.props.groups.border.show = v
              })
            )
          }
        >
          <ColorPickerButton
            align="end"
            colors={[
              {
                color: displayProps.groups.border.value,
                width: displayProps.groups.border.width,
                opacity: displayProps.groups.border.opacity,
                onColorChange: ({ color, opacity, width }) =>
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.groups.border.value = color
                      draft.props.groups.border.opacity = opacity
                      draft.props.groups.border.width =
                        width ?? displayProps.groups.border.width
                    })
                  ),
              },
            ]}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Border Color"
          />
          {/* <NumericalInput
                  id="groups-border-stroke-width"
                  value={displayProps.groups.border.width}
                  disabled={
                    !displayProps.groups.show ||
                    !displayProps.groups.border.show
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
                /> */}
        </CheckPropRow>
      </AccordionContent>
    </AccordionItem>
  )
}
