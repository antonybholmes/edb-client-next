import {
  ActionDialogCard,
  ActionDialogCardContent,
  ActionDialogRow,
  ActionSwitchRow,
} from '@/components/dialogs/card/action-dialog-card'
import { FontPopover } from '@/components/plot/font/font-popover'
import { NumSlider } from '@/components/shadcn/ui/themed/v2/num-slider'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { TEXT_OK } from '@/consts'
import { type IModalProps, OKCancelDialog } from '@/dialogs/ok-cancel-dialog'
import { produce } from 'immer'
import { Circle, Square } from 'lucide-react'
import { useSeqBrowserSettings } from '../../seq-browser-settings'
import type { BandStyle } from '../../tracks-provider'

export function CytobandsEditDialog({ onResponse }: IModalProps) {
  const { settings, updateSettings } = useSeqBrowserSettings()

  return (
    <OKCancelDialog
      buttons={[TEXT_OK]}
      title="Cytobands"
      onResponse={onResponse}
    >
      <ActionDialogCard>
        <ActionDialogCardContent>
          <ActionDialogRow title="Font">
            <FontPopover
              fonts={[
                {
                  textProps: settings.tracks.cytobands.labels.text,
                  update: (textProps) => {
                    const newOptions = produce(settings, (draft) => {
                      draft.tracks.cytobands.labels.text = textProps
                    })

                    updateSettings(newOptions)
                  },
                },
              ]}
            />
          </ActionDialogRow>
          <ActionDialogRow title="Shape">
            <ToggleGroup
              direction="row"

              value={[settings.tracks.beds.style]}
              onValueChange={(v) => {
                const newOptions = produce(settings, (draft) => {
                  draft.tracks.beds.style = v[0] as BandStyle
                })

                updateSettings(newOptions)
              }}
              variant="outline"
            >
              <GroupToggle value="rounded" title="Rounded">
                <Circle size={16} />
              </GroupToggle>

              <GroupToggle value="square" title="Square">
                <Square size={16} />
              </GroupToggle>
            </ToggleGroup>
          </ActionDialogRow>

          <ActionDialogRow title="Height">
            <NumSlider
              min={1}
              max={100}
              step={1}
              value={settings.tracks.cytobands.band.height}
              onValueChange={(values) => {
                const v = Array.isArray(values) ? values[0] : values
                const newOptions = produce(settings, (draft) => {
                  draft.tracks.cytobands.band.height = v
                })

                updateSettings(newOptions)
              }}
            />
          </ActionDialogRow>

          <ActionSwitchRow
            title="Reduced labels"
            info="Reduces the number of labels shown to make figures look less cluttered."

            disabled={!settings.tracks.cytobands.labels.text.show}
            checked={settings.tracks.cytobands.labels.skip.on}
            onCheckedChange={(v) => {
              const newOptions = produce(settings, (draft) => {
                draft.tracks.cytobands.labels.skip.on = v
              })

              updateSettings(newOptions)
            }}
          />
        </ActionDialogCardContent>
      </ActionDialogCard>
    </OKCancelDialog>
  )
}
