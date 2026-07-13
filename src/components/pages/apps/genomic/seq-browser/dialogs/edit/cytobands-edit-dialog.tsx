import { FontPopover } from '@/components/plot/font/font-popover'
import { NumSlider } from '@/components/shadcn/ui/themed/v2/num-slider'
import {
  GroupToggle,
  ToggleGroup,
} from '@/components/shadcn/ui/themed/v2/toggle-group'
import { TEXT_OK } from '@/consts'
import { type IModalProps, OKCancelDialog } from '@/dialogs/ok-cancel-dialog'
import { PropRow } from '@/dialogs/prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
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
      <PropRow title="Font">
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
      </PropRow>
      <PropRow title="Shape">
        {/* <ToggleGroup
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
        </ToggleGroup> */}

        {/* <IosGroupToggle
          w={2.5}
          tabs={[
            { id: 'rounded', name: 'Rounded', render: <Circle size={16} /> },
            { id: 'square', name: 'Square', render: <Square size={16} /> },
          ]}
          value={[settings.tracks.cytobands.style]}
          onValueChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.cytobands.style = v[0] as BandStyle
            })

            updateSettings(newOptions)
          }}
        /> */}

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

        {/* <Select
              value={settings.tracks.cytobands.style}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.tracks.cytobands.style = v as BandStyle
                })

                updateSettings(newOptions)
              }}
            >
              <SelectTrigger w="sm">
                <SelectValue data-placeholder="Choose cytoband style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Rounded">Rounded</SelectItem>
                <SelectItem value="Square">Square</SelectItem>
              </SelectContent>
            </Select> */}
      </PropRow>

      <PropRow title="Height">
        {/* <NumericalInput
          value={settings.tracks.cytobands.band.height}
          placeholder="height"
          limit={[1, 1000]}
          onNumChange={(v) => {
            const newOptions = produce(settings, (draft) => {
              draft.tracks.cytobands.band.height = v
            })

            updateSettings(newOptions)
          }}
          w="sm"
        /> */}
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
      </PropRow>

      <SwitchPropRow
        title="Reduced labels"
        info="Reduces the number of labels shown to make figures look less cluttered."

        side="right"
        disabled={!settings.tracks.cytobands.labels.text.show}
        checked={settings.tracks.cytobands.labels.skip.on}
        onCheckedChange={(v) => {
          const newOptions = produce(settings, (draft) => {
            draft.tracks.cytobands.labels.skip.on = v
          })

          updateSettings(newOptions)
        }}
      ></SwitchPropRow>
    </OKCancelDialog>
  )
}
