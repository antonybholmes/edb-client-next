import { SettingsAccordionItem } from '@/components/dialog/settings/settings-dialog'
import { VCenterRow } from '@/components/layout/v-center-row'
import { PropRow } from '@/components/prop-row'
import { Accordion } from '@/components/shadcn/ui/themed/accordion'
import { Button } from '@/components/shadcn/ui/themed/button'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadcn/ui/themed/select'
import { SwitchPropRow } from '@/components/switch-prop-row'
import { TEXT_RESET } from '@/consts'
import { produce } from 'immer'
import { useContext } from 'react'
import {
  DEFAULT_TRACKS_DISPLAY_PROPS,
  SeqBrowserSettingsContext,
  type TrackTitlePosition,
} from '../seq-browser-settings-provider'

export function SettingsPlotPanel() {
  const { settings, updateSettings } = useContext(SeqBrowserSettingsContext)

  return (
    <>
      <VCenterRow className="justify-end px-2">
        <Button
          multiProps="link"
          onClick={() => {
            updateSettings({ ...DEFAULT_TRACKS_DISPLAY_PROPS })
          }}
          title="Reset options to their defaults"
        >
          {TEXT_RESET}
        </Button>
      </VCenterRow>

      <Accordion defaultValue={['plot']} type="multiple">
        <SettingsAccordionItem title="Plot">
          <PropRow title="Width">
            <NumericalInput
              limit={[1, 2000]}
              inc={10}
              value={settings.plot.width}
              placeholder="Width..."
              w="w-20 rounded-theme"
              onNumChanged={(v) => {
                const newOptions = produce(settings, (draft) => {
                  draft.plot.width = v
                })

                updateSettings(newOptions)
              }}
            />
          </PropRow>

          <PropRow title="Gap">
            <NumericalInput
              limit={[1, 2000]}
              inc={10}
              value={settings.plot.gap}
              placeholder="Width..."
              w="w-20 rounded-theme"
              onNumChanged={(v) => {
                const newOptions = produce(settings, (draft) => {
                  draft.plot.gap = v
                })

                updateSettings(newOptions)
              }}
            />
          </PropRow>

          <SwitchPropRow
            title="Titles"
            checked={settings.titles.show}
            onCheckedChange={(state) => {
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
                onNumChanged={(v) => {
                  const newOptions = produce(settings, (draft) => {
                    draft.titles.offset = v
                  })

                  updateSettings(newOptions)
                }}
              />
            </PropRow>

            <Select
              value={settings.titles.position}
              onValueChange={(v) => {
                const newOptions = produce(settings, (draft) => {
                  draft.titles.position = v as TrackTitlePosition
                })

                updateSettings(newOptions)
              }}
            >
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Choose title position" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Top">Top</SelectItem>
                <SelectItem value="Right">Right</SelectItem>
              </SelectContent>
            </Select>
          </SwitchPropRow>
        </SettingsAccordionItem>
      </Accordion>
    </>
  )
}
