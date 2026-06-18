import { Label } from '@/components/shadcn/ui/themed/v2/label'
import { TEXT_RESET } from '@/consts'
import { PropRow } from '@/dialogs/prop-row'
import { SettingsAccordionItem } from '@/dialogs/settings/settings-dialog'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { VCenterRow } from '@/layout/v-center-row'
import { capitalCase } from '@/lib/text/capital-case'
import { LinkButton } from '@/themed/link-button'
import { NumericalInput } from '@/themed/numerical-input'
import { Accordion } from '@/themed/v2/accordion'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/themed/v2/select'
import { produce } from 'immer'
import {
  DEFAULT_TRACKS_DISPLAY_PROPS,
  useSeqBrowserSettings,
  type TrackTitlePosition,
} from '../seq-browser-settings'

export function SettingsPlotPanel() {
  const { settings, updateSettings } = useSeqBrowserSettings()

  return (
    <>
      <VCenterRow className="justify-end px-2">
        <LinkButton
          onClick={() => {
            updateSettings({ ...DEFAULT_TRACKS_DISPLAY_PROPS })
          }}
          title="Reset options to their defaults"
        >
          {TEXT_RESET}
        </LinkButton>
      </VCenterRow>

      <Accordion defaultValue={['plot']} multiple={true} variant="settings">
        <SettingsAccordionItem title="Plot">
          <PropRow title="Width">
            <NumericalInput
              limit={[1, 2000]}
              step={10}
              value={settings.plot.width}
              placeholder="Width..."
              w="xs"
              onNumChanged={v => {
                const newOptions = produce(settings, draft => {
                  draft.plot.width = v
                })

                updateSettings(newOptions)
              }}
            />
          </PropRow>

          <PropRow title="Gap">
            <NumericalInput
              limit={[1, 2000]}
              step={10}
              value={settings.plot.gap}
              placeholder="Width..."
              w="xs"
              onNumChanged={v => {
                const newOptions = produce(settings, draft => {
                  draft.plot.gap = v
                })

                updateSettings(newOptions)
              }}
            />
          </PropRow>

          <SwitchPropRow
            title="Titles"
            checked={settings.titles.show}
            side="left"
            onCheckedChange={state => {
              updateSettings({
                ...settings,
                titles: { ...settings.titles, show: state },
              })
            }}
          >
            <Label>Offset</Label>
            <NumericalInput
              limit={[1, 2000]}
              value={settings.titles.offset}
              placeholder="Offset..."
              w="xs"
              onNumChanged={v => {
                const newOptions = produce(settings, draft => {
                  draft.titles.offset = v
                })

                updateSettings(newOptions)
              }}
            />

            <Select
              value={settings.titles.position}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.titles.position = v as TrackTitlePosition
                })

                updateSettings(newOptions)
              }}
            >
              <SelectTrigger w="sm">
                <SelectValue data-placeholder="Choose title position">
                  {capitalCase(settings.titles.position)}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Top" variant="theme">
                  Top
                </SelectItem>
                <SelectItem value="Right" variant="theme">
                  Right
                </SelectItem>
              </SelectContent>
            </Select>
          </SwitchPropRow>
        </SettingsAccordionItem>
      </Accordion>
    </>
  )
}
