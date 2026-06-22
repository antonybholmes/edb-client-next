import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/shadcn/ui/themed/v2/accordion'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { TEXT_TITLE } from '@/consts'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { produce } from 'immer'

import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function DotLegendSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  return (
    <AccordionItem value="dot-legend">
      <AccordionTrigger
        rightChildren={
          <Switch
            checked={displayProps.dot.legend.show}
            onCheckedChange={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.dot.legend.show = v
                })
              )
            }}
          />
        }
      >
        Dot Legend
      </AccordionTrigger>
      <AccordionContent>
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
      </AccordionContent>
    </AccordionItem>
  )
}
