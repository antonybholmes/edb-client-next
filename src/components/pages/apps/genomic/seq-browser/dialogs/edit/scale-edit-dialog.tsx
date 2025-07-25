import { TEXT_OK } from '@/consts'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { PropRow } from '@dialog/prop-row'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { NumericalInput } from '@themed/numerical-input'
import { produce } from 'immer'
import { useState } from 'react'
import type { IScaleTrack, ITrackGroup } from '../../tracks-provider'

export interface IProps {
  group: ITrackGroup
  track: IScaleTrack
  callback?: (group: ITrackGroup, track: IScaleTrack) => void

  onCancel: () => void
}

export function ScaleEditDialog({ group, track, callback, onCancel }: IProps) {
  const [_track, setTrack] = useState(track)

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
      leftHeaderChildren={
        <ColorPickerButton
          color={_track.displayOptions.stroke.color}
          disabled={!_track.displayOptions.stroke.show}
          onColorChange={v => {
            const newTrack = produce(_track, draft => {
              draft.displayOptions.stroke.color = v
            })

            callback?.(group, newTrack)
            setTrack(newTrack)
          }}
          className={SIMPLE_COLOR_EXT_CLS}
          title="Color"
        />
      }
    >
      {/* <SwitchPropRow
        title="Auto size (bp)"
        checked={_track.displayOptions.autoSize}
        onCheckedChange={v => {
          const newTrack = produce(_track, draft => {
            draft.displayOptions.autoSize = v
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
      >
        <PropRow title="Size (bp)">
          <NumericalInput
            value={_track.displayOptions.bp}
            disabled={_track.displayOptions.autoSize}
            placeholder="bp"
            limit={[1, 1000000]}
            onNumChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.bp = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
            className="w-20 rounded-theme"
          />
        </PropRow>
      </SwitchPropRow> */}
      {/* <BaseCol className="bg-background p-4 rounded-lg"> */}
      <SwitchPropRow
        title="Caps"
        checked={_track.displayOptions.caps.show}
        onCheckedChange={v => {
          const newTrack = produce(_track, draft => {
            draft.displayOptions.caps.show = v
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
      >
        <PropRow title="Height">
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
            className="w-20 rounded-theme"
          />
        </PropRow>
      </SwitchPropRow>
      {/* </BaseCol> */}
    </OKCancelDialog>
  )
}
