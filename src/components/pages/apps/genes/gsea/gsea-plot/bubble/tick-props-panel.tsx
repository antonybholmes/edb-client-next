import { NumericalInput } from '@/themed/numerical-input'

import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { produce } from 'immer'

export function TickPropsPanel() {
  const { settings, updateSettings } = useEdbSettings()

  return (
    <>
      <CheckPropRow
        title="Major"
        checked={settings.plots.axes.ticks.major.show}
        onCheckedChange={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes.ticks.major.show = v
            })
          )
        }}
      >
        <NumericalInput
          value={settings.plots.axes.ticks.major.line.size}

          limit={[1, 1000]}
          dp={0}
          onNumChanged={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plots.axes.ticks.major.line.size = v
              })
            )
          }}
        />
      </CheckPropRow>

      <CheckPropRow
        title="Minor"
        checked={settings.plots.axes.ticks.minor.show}
        onCheckedChange={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              console.log('mmmm2', v)
              draft.plots.axes.ticks.minor.show = v
            })
          )
        }}
      >
        <NumericalInput
          value={settings.plots.axes.ticks.minor.line.size}

          limit={[1, 1000]}
          dp={0}
          onNumChanged={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plots.axes.ticks.minor.line.size = v
              })
            )
          }}
        />
      </CheckPropRow>
    </>
  )
}
