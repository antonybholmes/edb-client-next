import { Accordion } from '@/components/shadcn/ui/themed/v2/accordion'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { SettingsAccordionItem } from '@/dialogs/settings/settings-dialog'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import { produce } from 'immer'
import { useSeqBrowserSettings } from '../../seq-browser-settings'

export function RulerEditDialog({ onResponse }: IModalProps) {
  const { settings, updateSettings } = useSeqBrowserSettings()

  return (
    <OKCancelDialog buttons={[TEXT_OK]} title="Ruler" onResponse={onResponse}>
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
            checked={settings.tracks.ruler.autoSize}
            onCheckedChange={v => {
              const newOptions = produce(settings, draft => {
                draft.tracks.ruler.autoSize = v
              })

              updateSettings(newOptions)
            }}
          >
            <NumericalInput
              limit={[1, 1000000]}
              step={1000}
              value={settings.tracks.ruler.bp}
              disabled={settings.tracks.ruler.autoSize}
              placeholder="BP"
              className="rounded-theme"
              w="lg"
              onNumChanged={v => {
                const newOptions = produce(settings, draft => {
                  draft.tracks.ruler.bp = v
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
