import { SettingsAccordionItem } from '@/components/dialog/settings/settings-dialog'
import { SwitchPropRow } from '@/components/dialog/switch-prop-row'
import { Accordion } from '@/components/shadcn/ui/themed/v2/accordion'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { NumericalInput } from '@/themed/numerical-input'
import { produce } from 'immer'
import { useSeqBrowserSettings } from '../../seq-browser-settings'

export interface IProps {
  onCancel: () => void
}

export function RulerEditDialog({ onCancel }: IProps) {
  const { settings, updateSettings } = useSeqBrowserSettings()

  return (
    <OKCancelDialog
      buttons={[TEXT_OK]}
      title="Ruler"
      onResponse={() => {
        onCancel()
      }}
    >
      <Accordion
        multiple={true}
        defaultValue={['style']}
        //className="bg-background rounded-lg p-4"
      >
        <SettingsAccordionItem
          title="Style"
          description="Configure the ruler style."
        >
          <SwitchPropRow
            title="Auto size (bp)"
            side="right"
            checked={settings.scale.autoSize}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.scale.autoSize = v
              })

              updateSettings(newOptions)
            }}
          >
            <NumericalInput
              limit={[1, 1000000]}
              step={1000}
              value={settings.scale.bp}
              disabled={settings.scale.autoSize}
              placeholder="BP"
              className="rounded-theme"
              w="lg"
              onNumChanged={v => {
                const newOptions = produce(settings, draft => {
                  draft.scale.bp = v
                })

                updateSettings(newOptions)
              }}
            />
          </SwitchPropRow>
        </SettingsAccordionItem>
      </Accordion>
    </OKCancelDialog>
  )
}
