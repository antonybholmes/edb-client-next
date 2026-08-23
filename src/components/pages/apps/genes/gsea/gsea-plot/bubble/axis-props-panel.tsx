import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { PropRow } from '@/components/dialogs/prop-row'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { FontPopover } from '@/components/plot/font/font-popover'
import { TEXT_SHOW } from '@/consts'
import { produce } from 'immer'
import { TickPropsPopover } from './tick-props-popover'

export function AxisPropsPanel({ axis }: { axis: 'x' | 'y' }) {
  const { settings, updateSettings } = useEdbSettings()

  return (
    <>
      <CheckPropRow
        title={`${axis.toUpperCase()}-Axis`}
        className="font-bold"
        checked={settings.plots.axes[axis].show}
        onCheckedChange={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes[axis].show = v
            })
          )
        }}
      />
      <PropRow title="Title">
        <FontPopover
          fonts={[
            {
              title: TEXT_SHOW,
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
      </PropRow>

      <PropRow title="Ticks">
        <TickPropsPopover axis={axis} which="major" />
        <TickPropsPopover axis={axis} which="minor" />
      </PropRow>
    </>
  )
}
