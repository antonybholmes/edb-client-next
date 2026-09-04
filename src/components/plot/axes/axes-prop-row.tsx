import { PropRow } from '@/components/dialogs/prop-row'
import { AxisType } from '@/components/plot/axes/svg-axis-props'
import { AxisSettingsPropsPopover } from './settings/axis-settings-props-popover'

export function AxesPropRow({
  axes = ['x', 'y', 'colorbar'],
}: {
  axes?: AxisType[]
}) {
  return (
    <PropRow title="Axes">
      {axes.map((axis) => (
        <AxisSettingsPropsPopover key={axis} axis={axis} />
      ))}
    </PropRow>
  )
}
