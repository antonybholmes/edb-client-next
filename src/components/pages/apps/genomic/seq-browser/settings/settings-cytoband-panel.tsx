import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { PropRow } from '@/dialogs/prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import { produce } from 'immer'
import { Circle, Square } from 'lucide-react'
import { useSeqBrowserSettings } from '../seq-browser-settings'
import type { BandStyle } from '../tracks-provider'

export function SettingsCytobandPanel() {
  const { settings, updateSettings } = useSeqBrowserSettings()

  return (
    <>
      <PropRow title="Style">
        <ToggleGroup
          value={[settings.tracks.cytobands.style]}
          onValueChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.cytobands.style = v[0] as BandStyle
            })

            updateSettings(newOptions)
          }}
          className="gap-x-0.5"
          variant="outline"
          pad="none"
        >
          <GroupToggle value="rounded" title="Rounded">
            <Circle size={16} />
          </GroupToggle>

          <GroupToggle value="square" title="Square">
            <Square size={16} />
          </GroupToggle>
        </ToggleGroup>
      </PropRow>

      <PropRow title="Height">
        <NumericalInput
          value={settings.tracks.cytobands.band.height}
          placeholder="height"
          limit={[1, 1000]}
          onNumChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.cytobands.band.height = v
            })

            updateSettings(newOptions)
          }}
          w="xs"
        />
      </PropRow>

      <SwitchPropRow
        title="Labels"
        checked={settings.tracks.cytobands.labels.text.show}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.cytobands.labels.text.show = v
          })

          updateSettings(newOptions)
        }}
      />
      <SwitchPropRow
        title="Reduce labels"
        info="Reduces the number of labels shown to make figures look less clustered."

        disabled={!settings.tracks.cytobands.labels.text.show}
        checked={settings.tracks.cytobands.labels.skip.on}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.cytobands.labels.skip.on = v
          })

          updateSettings(newOptions)
        }}
      />
    </>
  )
}
