import {
  DialogCard,
  DialogCardContent,
} from '@/components/dialogs/card/dialog-card'
import { PropRow } from '@/components/dialogs/prop-row'
import { SIMPLE_COLOR_EXT_CLS } from '@/components/plot/color-picker-popover'
import { FillButton } from '@/components/plot/fill-dropdown-menu'
import { FontPopover } from '@/components/plot/font/font-popover'
import { TEXT_CANCEL, TEXT_OK } from '@/consts'
import { type IModalProps, OKCancelDialog } from '@/dialogs/ok-cancel-dialog'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import { produce } from 'immer'
import { useState } from 'react'
import { useSeqBrowserSettings } from '../../seq-browser-settings'
import type { IScaleTrack, ITrackGroup } from '../../tracks-provider'
import { useTracks } from '../../tracks-store'

export interface IProps extends IModalProps<{
  group: ITrackGroup
  track: IScaleTrack
}> {
  group: ITrackGroup
  track: IScaleTrack
}

export function ScaleEditDialog({ group, track, onResponse }: IProps) {
  const [_track, setTrack] = useState(track)
  const { settings, updateSettings } = useSeqBrowserSettings()
  const { dispatch } = useTracks()

  return (
    <OKCancelDialog
      buttons={[TEXT_OK]}
      title={_track.name}
      //contentVariant="glass"
      onResponse={() => {
        onResponse?.(TEXT_CANCEL)
      }}
    >
      <PropRow title="Appearance">
        <FillButton
          title="Color"
          //side="left"
          colors={[
            {
              color: _track.displayOptions.stroke.value,
              onColorChange: ({ color }) => {
                const newTrack = produce(_track, (draft) => {
                  draft.displayOptions.stroke.value = color
                })

                onResponse?.(TEXT_OK, { group, track: newTrack })
                setTrack(newTrack)
              },
            },
          ]}
          className={SIMPLE_COLOR_EXT_CLS}
        />
        <FontPopover
          fonts={[
            {
              title: 'Labels',
              textProps: _track.displayOptions.text,
              update: (textProps) => {
                const newTrack = produce(_track, (draft) => {
                  draft.displayOptions.text = textProps
                })

                //onResponse?.(TEXT_OK, { group, track: newTrack })
                setTrack(newTrack)

                dispatch({
                  type: 'update',
                  group,
                  track: newTrack,
                })
              },
            },
          ]}
        />
      </PropRow>

      <DialogCard>
        <DialogCardContent>
          <SwitchPropRow
            title="Caps"
            side="right"
            checked={_track.displayOptions.caps.show}
            onCheckedChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.caps.show = v
              })

              onResponse?.(TEXT_OK, { group, track: newTrack })
              setTrack(newTrack)
            }}
          >
            <NumericalInput
              value={_track.displayOptions.caps.height}
              placeholder="height"
              limit={[1, 1000]}
              onNumChange={(v) => {
                const newTrack = produce(_track, (draft) => {
                  draft.displayOptions.caps.height = v
                })

                onResponse?.(TEXT_OK, { group, track: newTrack })
                setTrack(newTrack)
              }}
              w="sm"
            />
          </SwitchPropRow>

          <SwitchPropRow
            title="Auto size (bp)"
            side="right"
            checked={settings.tracks.scale.autoSize}
            onCheckedChange={(v) => {
              const newOptions = produce(settings, (draft) => {
                draft.tracks.scale.autoSize = v
              })

              updateSettings(newOptions)
            }}
          >
            <NumericalInput
              limit={[1, 1000000]}
              step={1000}
              value={settings.tracks.scale.bp}
              disabled={settings.tracks.scale.autoSize}
              placeholder="BP"
              className="rounded-theme"
              w="sm"
              onNumChanged={(v) => {
                const newOptions = produce(settings, (draft) => {
                  draft.tracks.scale.bp = v
                })

                updateSettings(newOptions)
              }}
            />
          </SwitchPropRow>
        </DialogCardContent>
      </DialogCard>
    </OKCancelDialog>
  )
}
