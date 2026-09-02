import { PropRow } from '@/components/dialogs/prop-row'
import { SwitchPropRow } from '@/components/dialogs/switch-prop-row'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { AxisType } from '@/components/plot/axes/svg-axis-props'
import { FontPopover } from '@/components/plot/font/font-popover'
import { capitalCase } from '@/lib/text/capital-case'
import { produce } from 'immer'
import { TickSettingsPropsPopover } from './tick-settings-props-popover'

export function AxisSettingsPropsPanel({ axis }: { axis: AxisType }) {
  const { settings, updateSettings } = useEdbSettings()

  return (
    <>
      <SwitchPropRow
        title={`${capitalCase(axis)}-Axis`} //{`${capitalCase(axis)}-Axis`}
        className="font-bold"
        checked={settings.plots.axes[axis].show}
        onCheckedChange={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes[axis].show = v
            })
          )
        }}
      >
        <FontPopover
          fonts={[
            {
              title: `${capitalCase(axis)}-Axis Title`,
              textProps: settings.plots.axes[axis].title,
              update: (f) =>
                updateSettings(
                  produce(settings, (draft) => {
                    draft.plots.axes[axis].title = Object.assign(
                      draft.plots.axes[axis].title,
                      f
                    )
                  })
                ),
            },
          ]}
        />
      </SwitchPropRow>

      <PropRow title="Ticks">
        <TickSettingsPropsPopover axis={axis} which="major" />
        <TickSettingsPropsPopover axis={axis} which="minor" />
      </PropRow>
    </>
  )
}
