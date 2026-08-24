import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { AxisType } from '@/components/plot/axis/svg-axis-props'
import { FontPopover } from '@/components/plot/font/font-popover'
import { capitalCase } from '@/lib/text/capital-case'
import { produce } from 'immer'
import { TickPropsPopover } from './tick-props-popover'

export function AxisPropsPanel({ axis }: { axis: AxisType }) {
  const { settings, updateSettings } = useEdbSettings()

  return (
    <>
      <CheckPropRow
        title={`${capitalCase(axis)}-Axis`}
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
              title: 'Title Font',
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
        <TickPropsPopover axis={axis} which="major" />
        <TickPropsPopover axis={axis} which="minor" />
      </CheckPropRow>
    </>
  )
}
