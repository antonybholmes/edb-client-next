import { PropRow } from '@/components/dialogs/prop-row'
import { SwitchPropRow } from '@/components/dialogs/switch-prop-row'
import { DoubleNumericalInput } from '@/components/double-numerical-input'
import { FontPopover } from '@/components/plot/font/font-popover'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { Input } from '@/components/shadcn/ui/themed/v2/input'
import { produce } from 'immer'
import { IPlotAddress, useAxis } from '../axes-store'
import { TickPlotPropsPopover } from './tick-plot-props-popover'

export function AxisPlotPropsPanel({
  plotAddress,
  title,
}: {
  plotAddress: IPlotAddress
  title: string
}) {
  const { axis, updateAxis } = useAxis(plotAddress)

  return (
    <>
      <SwitchPropRow
        title={title}
        className="font-bold"
        checked={axis.style.show}
        onCheckedChange={(v) => {
          updateAxis({ style: { ...axis.style, show: v } })
        }}
      />

      <SwitchPropRow
        title="Title"
        checked={axis.style.title.show}
        onCheckedChange={(v) => {
          updateAxis({
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
            updateAxis({
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
                updateAxis({
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
            updateAxis({
              domain: [v, axis.domain[1]],
            })
          }}
          onNumChanged2={(v) => {
            updateAxis({
              domain: [axis.domain[0], v],
            })
          }}
        >
          -
        </DoubleNumericalInput>
      </PropRow>

      <PropRow title="Size">
        <NumericalInput
          value={axis.range[1]}

          limit={[1, 1000]}
          dp={0}
          onNumChanged={(v) => {
            updateAxis({
              range: [axis.range[0], v],
            })
          }}
        />
      </PropRow>

      <PropRow title="Ticks">
        <TickPlotPropsPopover
          title={`Major ${title} Ticks`}
          plotAddress={plotAddress}
          which="major"
        />
        <TickPlotPropsPopover
          title={`Minor ${title} Ticks`}
          plotAddress={plotAddress}
          which="minor"
        />
      </PropRow>
    </>
  )
}
