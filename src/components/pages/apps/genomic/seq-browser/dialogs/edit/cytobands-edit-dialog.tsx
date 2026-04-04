import { SettingsAccordionItem } from '@/components/dialog/settings/settings-dialog'
import { SwitchPropRow } from '@/components/dialog/switch-prop-row'
import { ScrollAccordion } from '@/components/shadcn/ui/themed/v2/accordion'
import { BasicHoverCard } from '@/components/shadcn/ui/themed/v2/hover-card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/themed/v2/select'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { PropRow } from '@/dialog/prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import { produce } from 'immer'
import { useSeqBrowserSettings } from '../../seq-browser-settings'
import type { BandStyle } from '../../tracks-provider'

export interface IProps {
  onCancel: () => void
}

export function CytobandsEditDialog({ onCancel }: IProps) {
  const { settings, updateSettings } = useSeqBrowserSettings()

  return (
    <OKCancelDialog
      buttons={[TEXT_OK]}
      title="Cytobands"
      onResponse={() => {
        onCancel()
      }}
    >
      <ScrollAccordion value={['style']} className="h-72">
        <SettingsAccordionItem
          title="Style"
          description="Configure the style of the cytobands."
          showBorder={false}
        >
          <PropRow title="Shape">
            <Select
              value={settings.cytobands.style}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.cytobands.style = v as BandStyle
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
            </Select>
          </PropRow>

          <PropRow title="Height">
            <NumericalInput
              value={settings.cytobands.band.height}
              placeholder="height"
              limit={[1, 1000]}
              onNumChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.cytobands.band.height = v
                })

                updateSettings(newOptions)
              }}
              w="sm"
            />
          </PropRow>

          <SwitchPropRow
            title="Labels"
            side="right"
            checked={settings.cytobands.labels.show}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.cytobands.labels.show = v
              })

              updateSettings(newOptions)
            }}
          />
          <SwitchPropRow
            title="Reduced labels"
            className="ml-4"
            side="right"
            disabled={!settings.cytobands.labels.show}
            checked={settings.cytobands.labels.skip.on}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.cytobands.labels.skip.on = v
              })

              updateSettings(newOptions)
            }}
          >
            <BasicHoverCard>
              Reduces the number of labels shown to make figures look less
              clustered.
            </BasicHoverCard>
          </SwitchPropRow>
        </SettingsAccordionItem>
      </ScrollAccordion>
    </OKCancelDialog>
  )
}
