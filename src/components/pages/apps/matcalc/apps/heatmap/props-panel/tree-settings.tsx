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
import { PropRow } from '@/dialogs/prop-row'
import { produce } from 'immer'

import { OutlineButton } from '@/components/plot/outline-dropdown-menu'
import { IClusterFrame } from '@/lib/math/hcluster'
import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function TreeSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()
  const cf = plot?.dataframes['main'] as IClusterFrame

  return (
    <AccordionItem value="trees">
      <AccordionTrigger>Trees</AccordionTrigger>
      <AccordionContent>
        {cf?.rowTree && (
          <PropRow title="Row">
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
                value="left"
                currentValue={displayProps.tree.row.position}
                className="w-5.5"
              />
              <SideRadioGroupItem
                disabled={!displayProps.tree.row.show}
                value="right"
                currentValue={displayProps.tree.row.position}
                className="w-5.5"
              />
            </RadioGroup>

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
              title="Row Tree Width"
            />

            <OutlineButton
              align="end"
              colors={[
                {
                  color: displayProps.tree.row.stroke.value,
                  width: displayProps.tree.row.stroke.width,
                  opacity: displayProps.tree.row.stroke.opacity,
                  show: displayProps.tree.row.show,
                  onColorChange: ({ color, opacity, width, show }) =>
                    updatePlot(
                      produce(plot, (draft) => {
                        draft.props.tree.row.stroke.value = color
                        draft.props.tree.row.stroke.opacity =
                          opacity ?? draft.props.tree.row.stroke.opacity
                        draft.props.tree.row.stroke.width =
                          width ?? displayProps.tree.row.stroke.width
                        draft.props.tree.row.show =
                          show ?? displayProps.tree.row.show
                      })
                    ),
                },
              ]}

              title="Row Tree Color"
            />
          </PropRow>
        )}

        {cf?.colTree && (
          <PropRow title="Col">
            <NumericalInput
              id="row-tree-size"
              value={displayProps.tree.col.width}
              disabled={!displayProps.tree.col.show}
              limit={[1, 200]}
              placeholder="Tree size..."
              className="rounded-theme"
              onNumChanged={(v) => {
                updatePlot(
                  produce(plot, (draft) => {
                    draft.props.tree.col.width = v
                  })
                )
              }}
              title="Col Tree Width"
            />

            <OutlineButton
              align="end"
              colors={[
                {
                  color: displayProps.tree.col.stroke.value,
                  width: displayProps.tree.col.stroke.width,
                  opacity: displayProps.tree.col.stroke.opacity,
                  show: displayProps.tree.col.show,
                  onColorChange: ({ color, opacity, width, show }) =>
                    updatePlot(
                      produce(plot, (draft) => {
                        draft.props.tree.col.stroke.value = color
                        draft.props.tree.col.stroke.opacity =
                          opacity ?? draft.props.tree.col.stroke.opacity
                        draft.props.tree.col.stroke.width =
                          width ?? displayProps.tree.col.stroke.width
                        draft.props.tree.col.show =
                          show ?? displayProps.tree.col.show
                      })
                    ),
                },
              ]}

              title="Col Tree Color"
            />
          </PropRow>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
