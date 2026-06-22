import { DoubleNumericalInput } from '@/components/double-numerical-input'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import type { ColorBarPos } from '@/components/plot/svg-props'
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
import { Switch } from '@/components/shadcn/ui/themed/v2/switch'
import { TEXT_BORDER } from '@/consts'
import { CheckPropRow } from '@/dialogs/check-prop-row'
import { PropRow } from '@/dialogs/prop-row'
import { COLOR_MAPS } from '@/lib/color/colormap'
import { produce } from 'immer'
import { ColorMapMenu } from '../../../color-map-menu'

import { useHistory } from '../../../history/history-provider/history-provider'
import { useHeatmapContext } from '../heatmap-provider'

export function ColormapSettingsPanel() {
  const { displayProps, plot } = useHeatmapContext()
  const { updatePlot } = useHistory()

  return (
    <AccordionItem value="colormap">
      <AccordionTrigger
        rightChildren={
          <Switch
            checked={displayProps.colorbar.show}
            onCheckedChange={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.colorbar.show = v
                })
              )
            }}
          />
        }
      >
        Colormap
      </AccordionTrigger>
      <AccordionContent>
        <PropRow title="Colors">
          <ColorMapMenu
            align="end"
            cmap={COLOR_MAPS[displayProps.cmap]!}
            onChange={(cmap) =>
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.cmap = cmap.name
                })
              )
            }
          />
        </PropRow>

        <PropRow title="Max">
          <NumericalInput
            id="max"
            value={displayProps.range[1]}
            limit={[0.5, 100]}
            step={0.5}
            dp={1}
            placeholder="Max..."
            className="rounded-theme"
            onNumChanged={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.range = [-v, v]
                })
              )
            }}
          />
        </PropRow>

        <PropRow title="Position">
          <RadioGroup
            value={displayProps.colorbar.position}
            disabled={!displayProps.colorbar.show}
            onValueChange={(v) =>
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.colorbar.position = v as ColorBarPos
                })
              )
            }
            className="flex flex-row justify-start gap-x-1"
          >
            {/* <SideRadioGroupItem
                      value="Off"
                      currentValue={displayProps.colorbar.position}
                      className="w-5"
                    /> */}
            <SideRadioGroupItem
              value="right"
              title="Right"
              currentValue={displayProps.colorbar.position}
              disabled={!displayProps.colorbar.show}
              className="w-5.5"
            />

            <SideRadioGroupItem
              value="bottom"
              title="Bottom"
              currentValue={displayProps.colorbar.position}
              disabled={!displayProps.colorbar.show}
              className="w-5.5"
            />
          </RadioGroup>
        </PropRow>

        <PropRow title="Size">
          <DoubleNumericalInput
            v1={displayProps.colorbar.size.w}
            v2={displayProps.colorbar.size.h}
            inputCls="rounded-theme"
            limit={[1, 1000]}
            dp={0}
            onNumChanged1={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.colorbar.size.w = v
                })
              )
            }}
            onNumChanged2={(v) => {
              updatePlot(
                produce(plot, (draft) => {
                  draft.props.colorbar.size.h = v
                })
              )
            }}
          />
        </PropRow>

        <CheckPropRow
          title={TEXT_BORDER}
          checked={displayProps.colorbar.stroke.show}
          disabled={!displayProps.colorbar.show}
          onCheckedChange={(v) => {
            updatePlot(
              produce(plot, (draft) => {
                draft.props.colorbar.stroke.show = v
              })
            )
          }}
        >
          <ColorPickerButton
            align="end"
            colors={[
              {
                color: displayProps.colorbar.stroke.value,
                width: displayProps.colorbar.stroke.width,
                opacity: displayProps.colorbar.stroke.opacity,
                onColorChange: (color, opacity, width) =>
                  updatePlot(
                    produce(plot, (draft) => {
                      draft.props.colorbar.stroke.value = color
                      draft.props.colorbar.stroke.opacity = opacity
                      draft.props.colorbar.stroke.width = width
                    })
                  ),
              },
            ]}
            disabled={
              !displayProps.legend.show || !displayProps.legend.stroke.show
            }
            className={SIMPLE_COLOR_EXT_CLS}
            title="Border Color"
          />

          {/* <NumericalInput
                      id="colorbar-stroke-width"
                      value={displayProps.colorbar.stroke.width}
                      disabled={
                        !displayProps.colorbar.show ||
                        !displayProps.colorbar.stroke.show
                      }
                      placeholder="Stroke..."
                      className="rounded-theme"
                      onNumChanged={v => {
                        updatePlot(
                          produce(plot, draft => {
                            draft.props.colorbar.stroke.width = v
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
