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
        checked={settings.plots.axes.x.ticks.major.show}
        onCheckedChange={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes.x.ticks.major.show = v
            })
          )
        }}
      >
        <NumericalInput
          value={settings.plots.axes.x.ticks.major.style.line.size}

          limit={[1, 1000]}
          dp={0}
          onNumChanged={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plots.axes.x.ticks.major.style.line.size = v
              })
            )
          }}
        />
      </CheckPropRow>

      <NumericalPropRow
        value={settings.plots.axes.x.ticks.major.style.line.offset}
        title="Offset"
        onNumChanged={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes.x.ticks.major.style.line.offset = v
            })
          )
        }}
      />

      <NumericalPropRow
        value={settings.plots.axes.x.ticks.major.style.labels.offset}
        title="Label Offset"
        onNumChanged={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes.x.ticks.major.style.labels.offset = v
            })
          )
        }}
      />

      <LineSeparator />

      <CheckPropRow
        title="Minor"
        checked={settings.plots.axes.x.ticks.minor.show}
        onCheckedChange={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              console.log('mmmm2', v)
              draft.plots.axes.x.ticks.minor.show = v
            })
          )
        }}
      >
        <NumericalInput
          value={settings.plots.axes.x.ticks.minor.style.line.size}

          limit={[1, 1000]}
          dp={0}
          onNumChanged={(v) => {
            updateSettings(
              produce(settings, (draft) => {
                draft.plots.axes.x.ticks.minor.style.line.size = v
              })
            )
          }}
        />
      </CheckPropRow>

      <NumericalPropRow
        value={settings.plots.axes.x.ticks.minor.style.line.offset}
        title="Offset"
        onNumChanged={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes.x.ticks.minor.style.line.offset = v
            })
          )
        }}
      />

      <NumericalPropRow
        value={settings.plots.axes.x.ticks.minor.style.labels.offset}
        title="Label Offset"
        onNumChanged={(v) => {
          updateSettings(
            produce(settings, (draft) => {
              draft.plots.axes.x.ticks.minor.style.labels.offset = v
            })
          )
        }}
      />
    </>
  )
}
