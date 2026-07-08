import { FontPopover } from '@/components/plot/font/font-popover'
import type { LegendPos } from '@/components/plot/svg-props'
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/shadcn/ui/themed/v2/accordion'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import {
  RadioGroup,
  SideRadioGroupItem,
} from '@/components/shadcn/ui/themed/v2/radio-group'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { TEXT_SHOW, TEXT_TITLE } from '@/consts'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import { produce } from 'immer'

import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function LegendSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  return (
    <AccordionItem value="legend">
      <AccordionTrigger
        rightChildren={
          <>
            <FontPopover
              fonts={[
                {
                  title: 'Title',
                  textProps: displayProps.legend.title,
                  update: (f) => {
                    updatePlot(
                      produce(plot, (draft) => {
                        draft.props.legend.title.font = f.font
                        draft.props.legend.title.show = f.show
                      })
                    )
                  },
                  showEnabled: false,
                },
                {
                  title: 'Labels',
                  textProps: displayProps.legend,
                  update: (f) => {
                    updatePlot(
                      produce(plot, (draft) => {
                        draft.props.legend.font = f.font
                        draft.props.legend.show = f.show
                      })
                    )
                  },
                  showEnabled: false,
                },
              ]}
            />

            <Switch
              title={TEXT_SHOW}
              checked={displayProps.legend.show}
              onCheckedChange={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.legend.show = v
                  })
                )
              }}
            />
          </>
        }
      >
        Legend
      </AccordionTrigger>
      <AccordionContent>
        <PropRow title="Position">
          <RadioGroup
            value={displayProps.legend.position}
            disabled={!displayProps.legend.show}
            onValueChange={(v) =>
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.legend.position = v as LegendPos
                })
              )
            }
            className="flex flex-row justify-start gap-x-1"
          >
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
        </PropRow>

        <CheckPropRow
          title={TEXT_TITLE}
          checked={displayProps.legend.title.show}
          disabled={!displayProps.legend.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.legend.title.show = v
              })
            )
          }}
        >
          <Input
            value={displayProps.legend.title.text}
            disabled={!displayProps.legend.show}
            onTextChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.legend.title.text = v
                })
              )
            }}
          />
        </CheckPropRow>

        <CheckPropRow
          title="Border"
          checked={displayProps.legend.stroke.show}
          disabled={!displayProps.legend.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.legend.stroke.show = v
              })
            )
          }}
        >
          <OutlineButton
            colors={[
              {
                color: displayProps.legend.stroke.value,
                opacity: displayProps.legend.stroke.opacity,
                onColorChange: ({ color, opacity, width, dasharray, show }) => {
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.legend.stroke.value = color
                      draft.props.legend.stroke.opacity = opacity ?? 1
                      draft.props.legend.stroke.show =
                        show ?? draft.props.legend.stroke.show
                      draft.props.legend.stroke.width =
                        width ?? draft.props.legend.stroke.width
                      draft.props.legend.stroke.dasharray =
                        dasharray ?? draft.props.legend.stroke.dasharray
                    })
                  )
                },
              },
            ]}

            title="Legend Outline"
          />
        </CheckPropRow>
      </AccordionContent>
    </AccordionItem>
  )
}
