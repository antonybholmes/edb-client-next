import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { LabelContainer } from '@/components/shadcn/ui/themed/v2/label'
import { TEXT_CANCEL, TEXT_NAME, TEXT_OK } from '@/consts'
import { type IModalProps, OKCancelDialog } from '@/dialogs/ok-cancel-dialog'
import { PropRow } from '@/dialogs/prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { NumericalInput } from '@/themed/numerical-input'
import { Input } from '@/themed/v2/input'
import { produce } from 'immer'
import { useState } from 'react'
import type {
  IBedDBDataTrack,
  ILocalBedTrack,
  ITrackGroup,
} from '../../tracks-provider'

export interface IProps extends IModalProps<{
  group: ITrackGroup
  track: IBedDBDataTrack | ILocalBedTrack
}> {
  group: ITrackGroup
  track: IBedDBDataTrack | ILocalBedTrack
}

export function BedEditDialog({ group, track, onResponse }: IProps) {
  const [_track, setTrack] = useState(track)

  return (
    <OKCancelDialog
      buttons={[TEXT_OK]}
      title="BED Editor"
      // contentVariant="glass"
      //bodyVariant="card"
      onResponse={() => {
        onResponse?.(TEXT_CANCEL, undefined)
      }}
    >
      <LabelContainer label={TEXT_NAME}>
        <Input
          id="name"
          value={_track.name}
          onChange={(e) => {
            const newTrack = {
              ...track,
              name: e.target.value,
            }

            onResponse?.(TEXT_OK, { group, track: newTrack })
            setTrack(newTrack)
          }}
          placeholder="Track name"
          className="rounded-theme"
          //h="lg"
        />
      </LabelContainer>

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
              disabled={!_track.displayOptions.fill.show}
              className={SIMPLE_COLOR_EXT_CLS}
              title="Stroke color"
            />
            <span>Stroke</span>
          </>
        }
        checked={_track.displayOptions.stroke.show}
        onCheckedChange={(state) => {
          const newTrack = produce(_track, (draft) => {
            draft.displayOptions.stroke.show = state
          })

          onResponse?.(TEXT_OK, { group, track: newTrack })
          setTrack(newTrack)
        }}
      >
        <PropRow title="W">
          <NumericalInput
            id="line1-stroke-width"
            value={_track.displayOptions.stroke.width}
            disabled={!_track.displayOptions.stroke.show}
            placeholder="Stroke..."
            onNumChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.stroke.width = v
              })

              onResponse?.(TEXT_OK, { group, track: newTrack })
              setTrack(newTrack)
            }}
          />
        </PropRow>
      </SwitchPropRow>

      <SwitchPropRow
        title={
          <>
            <ColorPickerButton
              colors={[
                {
                  color: _track.displayOptions.fill.value,
                  opacity: _track.displayOptions.fill.opacity,
                  onColorChange: ({ color, opacity }) => {
                    const newTrack = produce(_track, (draft) => {
                      draft.displayOptions.fill.value = color
                      draft.displayOptions.fill.opacity = opacity
                    })

                    onResponse?.(TEXT_OK, { group, track: newTrack })
                    setTrack(newTrack)
                  },
                },
              ]}
              className={SIMPLE_COLOR_EXT_CLS}
              title="Fill color"
            />
            <span>Fill</span>
          </>
        }
        checked={_track.displayOptions.fill.show}
        onCheckedChange={(state) => {
          const newTrack = produce(_track, (draft) => {
            draft.displayOptions.fill.show = state
          })

          onResponse?.(TEXT_OK, { group, track: newTrack })
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

              onResponse?.(TEXT_OK, { group, track: newTrack })
              setTrack(newTrack)
            }}
          />
        </PropRow>
      </SwitchPropRow>
    </OKCancelDialog>
  )
}
