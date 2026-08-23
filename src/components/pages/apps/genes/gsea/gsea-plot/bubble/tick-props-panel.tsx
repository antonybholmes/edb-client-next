import { NumericalInput } from '@/themed/numerical-input'

import { CheckPropRow } from '@/components/dialogs/check-prop-row'
import { NumericalPropRow } from '@/components/dialogs/numerical-prop-row'
import { useEdbSettings } from '@/components/edb/edb-settings'
import { LineSeparator } from '@/components/shadcn/ui/themed/v2/dropdown-menu'
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

      <NumericalPropRow
        value={settings.plots.axes.ticks.major.line.offset}
        title="Offset"
        onNumChanged={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes.ticks.major.line.offset = v
            })
          )
        }}
      />

      <NumericalPropRow
        value={settings.plots.axes.ticks.major.labels.offset}
        title="Label Offset"
        onNumChanged={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes.ticks.major.labels.offset = v
            })
          )
        }}
      />

      <LineSeparator />

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

      <NumericalPropRow
        value={settings.plots.axes.ticks.minor.line.offset}
        title="Offset"
        onNumChanged={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes.ticks.minor.line.offset = v
            })
          )
        }}
      />

      <NumericalPropRow
        value={settings.plots.axes.ticks.minor.labels.offset}
        title="Label Offset"
        onNumChanged={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes.ticks.minor.labels.offset = v
            })
          )
        }}
      />
    </>
  )
}
