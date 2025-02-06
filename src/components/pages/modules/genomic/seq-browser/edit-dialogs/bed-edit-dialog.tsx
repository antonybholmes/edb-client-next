import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/color-picker-button'
import { PropRow } from '@/components/prop-row'
import { Input } from '@/components/shadcn/ui/themed/input'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { SwitchPropRow } from '@/components/switch-prop-row'
import { TEXT_OK } from '@/consts'
import { addAlphaToHex } from '@/lib/color'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { produce } from 'immer'
import { useState } from 'react'
import type { IBedTrack, ILocalBedTrack, ITrackGroup } from '../tracks-provider'

export interface IProps {
  group: ITrackGroup
  track: IBedTrack | ILocalBedTrack
  callback?: (group: ITrackGroup, track: IBedTrack | ILocalBedTrack) => void

  onCancel: () => void
}

export function BedEditDialog({ group, track, callback, onCancel }: IProps) {
  const [_track, setTrack] = useState(track)

  return (
    <OKCancelDialog
      buttons={[TEXT_OK]}
      title="Peak Editor"
      contentVariant="glass"
      onReponse={() => {
        onCancel()
      }}
      // leftHeaderChildren={
      //   <ColorPickerButton
      //     color={_track.displayOptions.stroke.color}
      //     disabled={!_track.displayOptions.stroke.show}
      //     onColorChange={color => {
      //       const newTrack = produce(_track, draft => {
      //         draft.displayOptions.stroke.color = color
      //       })

      //       callback?.(group, newTrack)
      //       setTrack(newTrack)
      //     }}
      //     className={SIMPLE_COLOR_EXT_CLS}
      //     title="Color"
      //   />
      // }
    >
      <Input
        id="name"
        value={_track.name}
        onChange={(e) => {
          const newTrack = {
            ...track,
            name: e.target.value,
          }

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
        placeholder="Track name"
        className="rounded-theme"
        h="lg"
      />

      {/* <PropRow title="Height">
        <NumericalInput
          value={_track.displayOptions.band.height}
          placeholder="Height..."
          className="w-16 rounded-theme"
          onNumChange={v => {
            const newTrack = produce(_track, draft => {
              draft.displayOptions.band.height = v
            })

            callback?.(group, newTrack)
            setTrack(newTrack)
          }}
        />
      </PropRow> */}

      <SwitchPropRow
        title="Stroke"
        checked={_track.displayOptions.stroke.show}
        onCheckedChange={(state) => {
          const newTrack = produce(_track, (draft) => {
            draft.displayOptions.stroke.show = state
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
        rightChildren={
          <ColorPickerButton
            color={_track.displayOptions.stroke.color}
            disabled={!_track.displayOptions.fill.show}
            allowAlpha={true}
            onColorChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.stroke.color = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Stroke color"
          />
        }
      >
        <PropRow title="W">
          <NumericalInput
            id="line1-stroke-width"
            value={_track.displayOptions.stroke.width}
            disabled={!_track.displayOptions.stroke.show}
            placeholder="Stroke..."
            className="w-16 rounded-theme"
            onNumChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.stroke.width = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
          />
        </PropRow>
      </SwitchPropRow>

      <SwitchPropRow
        title="Fill"
        checked={_track.displayOptions.fill.show}
        onCheckedChange={(state) => {
          const newTrack = produce(_track, (draft) => {
            draft.displayOptions.fill.show = state
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
        rightChildren={
          <ColorPickerButton
            color={addAlphaToHex(
              _track.displayOptions.fill.color,
              _track.displayOptions.fill.alpha
            )}
            disabled={!_track.displayOptions.fill.show}
            allowAlpha={true}
            onColorChange={(v, alpha) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.fill.color = v
                draft.displayOptions.fill.alpha = alpha
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Fill color"
          />
        }
      >
        <PropRow title="Opacity">
          <NumericalInput
            value={_track.displayOptions.fill.alpha}
            disabled={!_track.displayOptions.fill.show}
            placeholder="Opacity"
            limit={[0, 1]}
            inc={0.1}
            dp={1}
            onNumChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.fill.alpha = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
            className="w-16 rounded-theme"
          />
        </PropRow>
      </SwitchPropRow>
    </OKCancelDialog>
  )
}
