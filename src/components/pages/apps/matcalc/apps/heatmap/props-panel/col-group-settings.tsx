import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/shadcn/ui/themed/v2/accordion'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { TEXT_BORDER, TEXT_HEIGHT, TEXT_SHOW } from '@/consts'
import { PropRow } from '@/dialogs/prop-row'
import { produce } from 'immer'

import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
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

        <PropRow title="Grid">
          <OutlineButton
            colors={[
              {
                color: displayProps.groups.grid.value,
                opacity: displayProps.groups.grid.opacity,
                onColorChange: ({ color, opacity, width, dasharray, show }) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.groups.grid.value = color
                      draft.props.groups.grid.opacity = opacity ?? 1
                      draft.props.groups.grid.show =
                        show ?? draft.props.groups.grid.show
                      draft.props.groups.grid.width =
                        width ?? draft.props.groups.grid.width
                      draft.props.groups.grid.dasharray =
                        dasharray ?? draft.props.groups.grid.dasharray
                    })
                  )
                },
              },
            ]}

            title="Group Grid Outline"
          />
        </PropRow>

        <PropRow title={TEXT_BORDER}>
          <OutlineButton
            colors={[
              {
                color: displayProps.groups.border.value,
                opacity: displayProps.groups.border.opacity,
                onColorChange: ({ color, opacity, width, dasharray, show }) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.groups.border.value = color
                      draft.props.groups.border.opacity = opacity ?? 1
                      draft.props.groups.border.show =
                        show ?? draft.props.groups.border.show
                      draft.props.groups.border.width =
                        width ?? draft.props.groups.border.width
                      draft.props.groups.border.dasharray =
                        dasharray ?? draft.props.groups.border.dasharray
                    })
                  )
                },
              },
            ]}

            title="Group Border Outline"
          />
        </PropRow>
      </AccordionContent>
    </AccordionItem>
  )
}
