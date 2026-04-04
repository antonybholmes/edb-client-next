import { SIMPLE_COLOR_EXT_CLS } from '@/components/color/color-picker-button'
import { ColorPropRow } from '@/components/dialog/color-prop-row'
import { SettingsAccordionItem } from '@/components/dialog/settings/settings-dialog'
import { ScrollAccordion } from '@/components/shadcn/ui/themed/v2/accordion'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialog/ok-cancel-dialog'
import { SwitchPropRow } from '@/dialog/switch-prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import { produce } from 'immer'
import { useState } from 'react'
import { useSeqBrowserSettings } from '../../seq-browser-settings'
import type { IScaleTrack, ITrackGroup } from '../../tracks-provider'

export interface IProps {
  group: ITrackGroup
  track: IScaleTrack
  callback?: (group: ITrackGroup, track: IScaleTrack) => void

  onCancel: () => void
}

export function ScaleEditDialog({ group, track, callback, onCancel }: IProps) {
  const [_track, setTrack] = useState(track)
  const { settings, updateSettings } = useSeqBrowserSettings()

  return (
    <OKCancelDialog
      buttons={[TEXT_OK]}
      title={_track.name}
      //contentVariant="glass"
      onResponse={() => {
        onCancel()
      }}
      //contentVariant="glass"
      //bodyVariant="card"
      // leftHeaderChildren={
      //   <ColorPickerButton
      //     color={_track.displayOptions.stroke.color}
      //     disabled={!_track.displayOptions.stroke.show}
      //     onColorChange={v => {
      //       const newTrack = produce(_track, draft => {
      //         draft.displayOptions.stroke.color = v
      //       })

      //       callback?.(group, newTrack)
      //       setTrack(newTrack)
      //     }}
      //     className={SIMPLE_COLOR_EXT_CLS}
      //     title="Color"
      //   />
      // }
    >
      <ScrollAccordion
        value={['style', 'size']}
        variant="settings"
        className="h-72"
      >
        <SettingsAccordionItem
          title="Style"
          description="Configure how the scale bar is displayed."
          showBorder={false}
        >
          <ColorPropRow
            title="Color"
            //side="left"
            color={_track.displayOptions.stroke.color}
            onColorChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.stroke.color = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
            className={SIMPLE_COLOR_EXT_CLS}
          />
        </SettingsAccordionItem>

        <SettingsAccordionItem
          title="Size"
          description="Configure the size of the scale bar."
        >
          <SwitchPropRow
            title="Height"
            side="right"
            checked={_track.displayOptions.caps.show}
            onCheckedChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.caps.show = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
          >
            <NumericalInput
              value={_track.displayOptions.caps.height}
              placeholder="height"
              limit={[1, 1000]}
              onNumChange={v => {
                const newTrack = produce(_track, draft => {
                  draft.displayOptions.caps.height = v
                })

                callback?.(group, newTrack)
                setTrack(newTrack)
              }}
              w="sm"
            />
          </SwitchPropRow>

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
              w="sm"
              onNumChanged={v => {
                const newOptions = produce(settings, draft => {
                  draft.scale.bp = v
                })

                updateSettings(newOptions)
              }}
            />
          </SwitchPropRow>
        </SettingsAccordionItem>
      </ScrollAccordion>
    </OKCancelDialog>
  )
}
