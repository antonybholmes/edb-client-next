import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/shadcn/ui/themed/v2/accordion'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import { TEXT_TITLE } from '@/consts'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { produce } from 'immer'

import { PropRow } from '@/components/dialogs/prop-row'
import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'
import { RadiusScaleModeSelectList } from './radius-scale-mode-selectlist'

export function DotLegendSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  return (
    <AccordionItem value="dots">
      <AccordionTrigger>Dots</AccordionTrigger>
      <AccordionContent>
        <CheckPropRow
          title="Dot Legend"
          checked={displayProps.dot.legend.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.dot.legend.show = v
              })
            )
          }}
        />
        <CheckPropRow
          title={TEXT_TITLE}
          checked={displayProps.dot.legend.title.show}
          disabled={!displayProps.dot.legend.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.dot.legend.title.show = v
              })
            )
          }}
        >
          <Input
            value={displayProps.dot.legend.title.text}
            disabled={!displayProps.dot.legend.show}
            onTextChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.dot.legend.title.text = v
                })
              )
            }}
          />
        </CheckPropRow>
        <PropRow title="Dot Scale">
          <RadiusScaleModeSelectList
            value={displayProps.dot.scale.mode}
            onValueChange={(v) =>
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.dot.scale.mode = v
                })
              )
            }
          />
        </PropRow>
      </AccordionContent>
    </AccordionItem>
  )
}
