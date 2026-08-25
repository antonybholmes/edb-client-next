import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { PropRow } from '@/components/dialogs/prop-row'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { AxisType } from '@/components/plot/axes/svg-axis-props'
import { FontPopover } from '@/components/plot/font/font-popover'
import { capitalCase } from '@/lib/text/capital-case'
import { produce } from 'immer'
import { TickPropsPopover } from '../../pages/apps/genes/gsea/gsea-plot/bubble/tick-props-popover'

export function AxisPropsPanel({ axis }: { axis: AxisType }) {
  const { settings, updateSettings } = useEdbSettings()

  return (
    <>
      <CheckPropRow
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
      </CheckPropRow>

      <PropRow title="Ticks">
        <TickPropsPopover axis={axis} which="major" />
        <TickPropsPopover axis={axis} which="minor" />
      </PropRow>
    </>
  )
}
