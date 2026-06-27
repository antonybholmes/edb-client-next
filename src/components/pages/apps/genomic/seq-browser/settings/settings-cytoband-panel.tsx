import { VCenterRow } from '@/components/layout/v-center-row'
import { BasicHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
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
          direction="row"
          className="overflow-hidden rounded-theme"
          rounded="none"
          value={[settings.tracks.cytobands.style]}
          onValueChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.cytobands.style = v[0] as BandStyle
            })

            updateSettings(newOptions)
          }}
        >
          <GroupToggle value="rounded" className="px-2" title="Rounded">
            <Circle size={16} />
          </GroupToggle>

          <GroupToggle value="square" className="px-2" title="Square">
            <Square size={16} />
          </GroupToggle>
        </ToggleGroup>

        {/* <SelectList
              value={settings.tracks.cytobands.style}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.tracks.cytobands.style = v as BandStyle
                })

                updateSettings(newOptions)
              }}
            >
              <SelectItem value="Rounded">Rounded</SelectItem>
              <SelectItem value="Square">Square</SelectItem>
            </SelectList> */}
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
        title={
          <VCenterRow className="gap-x-1">
            <span>Reduce labels</span>
            <BasicHoverCard>
              Reduces the number of labels shown to make figures look less
              clustered.
            </BasicHoverCard>
          </VCenterRow>
        }
        className="ml-4"
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
