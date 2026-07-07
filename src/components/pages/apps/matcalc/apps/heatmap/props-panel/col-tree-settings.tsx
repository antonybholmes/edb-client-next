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
import { PropRow } from '@/dialogs/prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { produce } from 'immer'

import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function ColTreeSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  return (
    <AccordionItem value="column-tree">
      <AccordionTrigger>Column Tree</AccordionTrigger>
      <AccordionContent>
        <SwitchPropRow
          title="Show tree"
          checked={displayProps.colTree.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.colTree.show = v
              })
            )
          }}
        >
          <ColorPickerButton
            align="end"
            colors={[
              {
                color: displayProps.colTree.stroke.value,
                width: displayProps.colTree.stroke.width,
                opacity: displayProps.colTree.stroke.opacity,
                onColorChange: ({ color, opacity, width }) =>
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.colTree.stroke.value = color
                      draft.props.colTree.stroke.opacity =
                        opacity ?? draft.props.colTree.stroke.opacity
                      draft.props.colTree.stroke.width =
                        width ?? displayProps.colTree.stroke.width
                    })
                  ),
              },
            ]}
            disabled={!displayProps.colTree.show}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Change tree color"
          />
        </SwitchPropRow>

        <PropRow title="Stroke" className="ml-3">
          <NumericalInput
            id="col-tree-stroke-width"
            value={displayProps.colTree.stroke.width}
            disabled={!displayProps.colTree.show}
            placeholder="Stroke..."
            className="rounded-theme"
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.colTree.stroke.width = v
                })
              )
            }}
          />
        </PropRow>

        <PropRow title="Height" className="ml-3">
          <NumericalInput
            id="col-tree-size"
            value={displayProps.colTree.width}
            disabled={!displayProps.colTree.show}
            limit={[1, 200]}
            placeholder="Tree size..."
            className="rounded-theme"
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.colTree.width = v
                })
              )
            }}
          />
        </PropRow>
      </AccordionContent>
    </AccordionItem>
  )
}
