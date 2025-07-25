import { TEXT_RESET } from '@/consts'
import { PropRow } from '@dialog/prop-row'
import { SettingsAccordionItem } from '@dialog/settings/settings-dialog'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { VCenterRow } from '@layout/v-center-row'
import { Accordion } from '@themed/accordion'
import { LinkButton } from '@themed/link-button'
import { NumericalInput } from '@themed/numerical-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@themed/select'
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

      <Accordion defaultValue={['plot']} type="multiple" variant="settings">
        <SettingsAccordionItem title="Plot">
          <PropRow title="Width">
            <NumericalInput
              limit={[1, 2000]}
              step={10}
              value={settings.plot.width}
              placeholder="Width..."
              w="w-20 rounded-theme"
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
              w="w-20 rounded-theme"
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
            onCheckedChange={state => {
              updateSettings({
                ...settings,
                titles: { ...settings.titles, show: state },
              })
            }}
          >
            <PropRow title="Offset" className="ml-2">
              <NumericalInput
                limit={[1, 2000]}
                value={settings.titles.offset}
                placeholder="Offset..."
                w="w-16 rounded-theme"
                onNumChanged={v => {
                  const newOptions = produce(settings, draft => {
                    draft.titles.offset = v
                  })

                  updateSettings(newOptions)
                }}
              />
            </PropRow>

            <Select
              value={settings.titles.position}
              onValueChange={v => {
                const newOptions = produce(settings, draft => {
                  draft.titles.position = v as TrackTitlePosition
                })

                updateSettings(newOptions)
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Choose title position" />
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
