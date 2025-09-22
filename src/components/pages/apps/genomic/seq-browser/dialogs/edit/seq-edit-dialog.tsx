import { TEXT_NAME, TEXT_OK } from '@/consts'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@components/color/color-picker-button'
import { OKCancelDialog } from '@dialog/ok-cancel-dialog'
import { PropRow } from '@dialog/prop-row'
import { SwitchPropRow } from '@dialog/switch-prop-row'
import { BaseCol } from '@layout/base-col'
import { addAlphaToHex } from '@lib/color/color'
import { Input } from '@themed/input'
import { NumericalInput } from '@themed/numerical-input'
import { produce } from 'immer'
import { useState } from 'react'
import type {
  ILocalBigWigTrack,
  IRemoteBigWigTrack,
  ISignalTrack,
  ITrackGroup,
} from '../../tracks-provider'

export type TrackEditCallBack = (
  group: ITrackGroup,
  track: ISignalTrack | IRemoteBigWigTrack | ILocalBigWigTrack
) => void

export interface IProps {
  group: ITrackGroup
  track: ISignalTrack | IRemoteBigWigTrack | ILocalBigWigTrack
  callback?: TrackEditCallBack
  onCancel: () => void
}

export function SeqEditDialog({ group, track, callback, onCancel }: IProps) {
  const [_track, setTrack] = useState(track)

  const footer =
    'reads' in _track && _track.reads > 0 ? (
      <span className="text-foreground/50">
        {`${_track.reads.toLocaleString()} reads`}
      </span>
    ) : undefined

  return (
    <OKCancelDialog
      open={true}
      buttons={[TEXT_OK]}
      title={`Track${track.name.length > 0 ? ` - ${_track.name}` : ''}`}
      onResponse={() => {
        onCancel()
      }}
      //contentVariant="glass"
      //bodyVariant="card"
      showClose={true}
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
      //     title="Stroke color"
      //   />
      // }
      leftFooterChildren={footer}
      bodyCls="gap-y-4"
    >
      {/* <BaseCol className="bg-background p-4 rounded-lg gap-y-4"> */}
      <Input
        id="name"
        label={TEXT_NAME}
        labelPos="left"
        value={_track.name}
        onChange={(e) => {
          const newTrack = produce(_track, (draft) => {
            draft.name = e.target.value
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
        placeholder="Track name"
        //h="xl"
        //variant="alt"
      />

      <BaseCol>
        <PropRow title="Height">
          <NumericalInput
            value={_track.displayOptions.height}
            placeholder="height"
            limit={[1, 1000]}
            onNumChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.height = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
            className="w-18 rounded-theme"
          />
        </PropRow>
        <SwitchPropRow
          title="Axes"
          checked={_track.displayOptions.axes.show}
          onCheckedChange={(state) => {
            const newTrack = produce(_track, (draft) => {
              draft.displayOptions.axes.show = state
            })

            callback?.(group, newTrack)
            setTrack(newTrack)
          }}
        />
        <SwitchPropRow
          title={
            <>
              <ColorPickerButton
                color={_track.displayOptions.stroke.color}
                disabled={!_track.displayOptions.stroke.show}
                onColorChange={(color) => {
                  const newTrack = produce(_track, (draft) => {
                    draft.displayOptions.stroke.color = color
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
              className="w-18 rounded-theme"
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
                allowAlpha={true}
                disabled={!_track.displayOptions.fill.show}
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
          {/* <PropRow title="Opacity">
          <NumericalInput
            value={_track.displayOptions.fill.opacity}
            disabled={!_track.displayOptions.fill.show}
            placeholder="Opacity"
            limit={[0, 1]}
            inc={0.1}
            dp={1}
            onNumChange={v => {
              const newTrack = produce(_track, draft => {
                draft.displayOptions.fill.opacity = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
            className="w-18 rounded-theme"
          />
        </PropRow> */}
        </SwitchPropRow>
        <SwitchPropRow
          title="Global Y"
          checked={_track.displayOptions.useGlobalY}
          onCheckedChange={(v) => {
            const newTrack = produce(_track, (draft) => {
              draft.displayOptions.useGlobalY = v
            })

            callback?.(group, newTrack)
            setTrack(newTrack)
          }}
        >
          <SwitchPropRow
            title="Auto"
            disabled={_track.displayOptions.useGlobalY}
            checked={_track.displayOptions.autoY}
            onCheckedChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.autoY = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
          />

          <NumericalInput
            value={_track.displayOptions.ymax}
            disabled={
              _track.displayOptions.useGlobalY || _track.displayOptions.autoY
            }
            placeholder="ymax"
            limit={[1, 1000]}
            onNumChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.ymax = v
              })

              callback?.(group, newTrack)
              setTrack(newTrack)
            }}
            className="w-18 rounded-theme"
          />
        </SwitchPropRow>
        <SwitchPropRow
          title="Smoothed"
          checked={_track.displayOptions.smooth}
          onCheckedChange={(v) => {
            const newTrack = produce(_track, (draft) => {
              draft.displayOptions.smooth = v
            })

            callback?.(group, newTrack)
            setTrack(newTrack)
          }}
        />
      </BaseCol>
      {/* </BaseCol> */}
    </OKCancelDialog>
  )
}
