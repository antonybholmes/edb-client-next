import { PropRow } from '@/components/dialogs/prop-row'
import { SwitchPropRow } from '@/components/dialogs/switch-prop-row'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { FontPopover } from '@/components/plot/font/font-popover'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import { produce } from 'immer'
import { useAxes } from '../axes-provider'
import { TickPlotPropsPopover } from './tick-plot-props-popover'

export function AxisPlotPropsPanel({
  plotId,
  axisId,
  title,
}: {
  plotId: string
  axisId: string
  title: string
}) {
  const { plots, updateAxis } = useAxes()

  const plot = plots[plotId]
  const axis = plot.axes[axisId]

  return (
    <>
      <SwitchPropRow
        title={title} //{`${capitalCase(axis)}-Axis`}
        className="font-bold"
        checked={axis.style.show}
        onCheckedChange={(v) => {
          updateAxis(plotId, axisId, { style: { ...axis.style, show: v } })
        }}
      />

      <SwitchPropRow
        title="Title"
        checked={axis.style.title.show}
        onCheckedChange={(v) => {
          updateAxis(plotId, axisId, {
            style: produce(axis.style, (draft) => {
              draft.title.show = v
            }),
          })
        }}
      >
        <Input
          title="Title"
          value={axis.title}
          onTextChanged={(v) => {
            updateAxis(plotId, axisId, {
              title: v,
            })
          }}
          w="md"
        />

        <FontPopover
          fonts={[
            {
              //title: `${title} Title Font`,
              textProps: axis.style.title,
              showEnabled: false,
              update: (f) =>
                updateAxis(plotId, axisId, {
                  style: {
                    ...axis.style,
                    title: Object.assign({}, axis.style.title, f),
                  },
                }),
            },
          ]}
        />
      </SwitchPropRow>

      <PropRow title="Lim">
        <DoubleNumericalInput
          v1={axis.domain[0]}
          v2={axis.domain[1]}
          limit={[-Infinity, Infinity]}
          dp={2}
          onNumChanged1={(v) => {
            updateAxis(plotId, axisId, {
              domain: [v, axis.domain[1]],
            })
          }}
          onNumChanged2={(v) => {
            updateAxis(plotId, axisId, {
              domain: [axis.domain[0], v],
            })
          }}
        >
          -
        </DoubleNumericalInput>
      </PropRow>

      <PropRow title="Ticks">
        <TickPlotPropsPopover
          title={`Major ${title} Ticks`}
          plotId={plotId}
          axisId={axisId}
          which="major"
        />
        <TickPlotPropsPopover
          title={`Minor ${title} Ticks`}
          plotId={plotId}
          axisId={axisId}
          which="minor"
        />
      </PropRow>
    </>
  )
}
