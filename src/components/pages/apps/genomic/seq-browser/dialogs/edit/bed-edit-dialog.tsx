import { TEXT_NAME, TEXT_OK } from '@/consts'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { PropRow } from '@dialog/prop-row'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { addAlphaToHex } from '@lib/color/color'
import { Input } from '@themed/input'
import { NumericalInput } from '@themed/numerical-input'
import { produce } from 'immer'
import { useState } from 'react'
import type {
  IBedTrack,
  ILocalBedTrack,
  ITrackGroup,
} from '../../tracks-provider'

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
      title="BED Editor"
      // contentVariant="glass"
      //bodyVariant="card"
      onResponse={() => {
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
        label={TEXT_NAME}
        labelPos="left"
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
        //h="lg"
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
        title={
          <>
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
            ></ColorPickerButton>
            <span>Stroke</span>
          </>
        }
        checked={_track.displayOptions.stroke.show}
        onCheckedChange={(state) => {
          const newTrack = produce(_track, (draft) => {
            draft.displayOptions.stroke.show = state
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
      >
        <PropRow title="W">
          <NumericalInput
            id="line1-stroke-width"
            value={_track.displayOptions.stroke.width}
            disabled={!_track.displayOptions.stroke.show}
            placeholder="Stroke..."
            className="w-20 rounded-theme"
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
        title={
          <>
            <ColorPickerButton
              color={addAlphaToHex(
                _track.displayOptions.fill.color,
                _track.displayOptions.fill.opacity
              )}
              disabled={!_track.displayOptions.fill.show}
              allowAlpha={true}
              onColorChange={(v, alpha) => {
                const newTrack = produce(_track, (draft) => {
                  draft.displayOptions.fill.color = v
                  draft.displayOptions.fill.opacity = alpha
                })

                callback?.(group, newTrack)
                setTrack(newTrack)
              }}
              className={SIMPLE_COLOR_EXT_CLS}
              title="Fill color"
            ></ColorPickerButton>
            <span>Fill</span>
          </>
        }
        checked={_track.displayOptions.fill.show}
        onCheckedChange={(state) => {
          const newTrack = produce(_track, (draft) => {
            draft.displayOptions.fill.show = state
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
      >
        <PropRow title="Opacity">
          <NumericalInput
            value={_track.displayOptions.fill.opacity}
            disabled={!_track.displayOptions.fill.show}
            placeholder="Opacity"
            limit={[0, 1]}
            step={0.1}
            dp={1}
            onNumChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.fill.opacity = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
            className="w-20 rounded-theme"
          />
        </PropRow>
      </SwitchPropRow>
    </OKCancelDialog>
  )
}
