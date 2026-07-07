import { VCenterRow } from '@/components/layout/v-center-row'
import {
  ColorPickerButton,
  SIMPLE_COLOR_EXT_CLS,
} from '@/components/plot/color-picker-popover'
import { Checkbox } from '@/components/shadcn/ui/themed/v2/check-box'
import { Label, LabelContainer } from '@/components/shadcn/ui/themed/v2/label'
import { TEXT_CANCEL, TEXT_NAME, TEXT_OK } from '@/consts'
import { OKCancelDialog, type IModalProps } from '@/dialogs/ok-cancel-dialog'
import { PropRow } from '@/dialogs/prop-row'
import { SwitchPropRow } from '@/dialogs/switch-prop-row'
import { BaseCol } from '@/layout/base-col'
import { NumericalInput } from '@/themed/numerical-input'
import { Input } from '@/themed/v2/input'
import { produce } from 'immer'
import { useState } from 'react'
import type {
  IBigWigTrack,
  IRemoteBigWigTrack,
  ISeqTrack,
  ITrackGroup,
} from '../../tracks-provider'

export interface ITrackEditCallBack {
  group: ITrackGroup
  track: ISeqTrack | IBigWigTrack | IRemoteBigWigTrack
}

export interface IProps extends IModalProps<ITrackEditCallBack> {
  group: ITrackGroup
  track: ISeqTrack | IBigWigTrack | IRemoteBigWigTrack
}

export function SeqEditDialog({ group, track, onResponse }: IProps) {
  const [_track, setTrack] = useState(track)

  _track

  const footer =
    (_track?.reads ?? 0) > 0 ? (
      <span className="text-foreground/50">
        {`Reads: ${(_track?.reads ?? 0).toLocaleString()}`}
      </span>
    ) : undefined

  return (
    <OKCancelDialog
      open={true}
      buttons={[TEXT_OK]}
      title="Edit Track" //{`Track${track.name.length > 0 ? ` - ${_track.name}` : ''}`}
      onResponse={() => {
        onResponse?.(TEXT_CANCEL, undefined)
      }}
      //contentVariant="glass"
      //bodyVariant="card"
      showClose={true}
      // leftHeaderChildren={
      //   <ColorPickerButton
      //     color={_track.displayOptions.stroke.value}
      //     disabled={!_track.displayOptions.stroke.show}
      //     onColorChange={color => {
      //       const newTrack = produce(_track, draft => {
      //         draft.displayOptions.stroke.value = color
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

      <LabelContainer label={TEXT_NAME}>
        <Input
          id="name"
          value={_track.name}
          onChange={(e) => {
            const newTrack = produce(_track, (draft) => {
              draft.name = e.target.value
            })

            onResponse?.(TEXT_OK, { group, track: newTrack })
            setTrack(newTrack)
          }}
          placeholder="Track name"
        />
      </LabelContainer>

      <BaseCol className="gap-y-1">
        <PropRow title="Height">
          <NumericalInput
            value={_track.displayOptions.height}
            placeholder="height"
            limit={[1, 1000]}
            onNumChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.height = v
              })

              onResponse?.(TEXT_OK, { group, track: newTrack })
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

            onResponse?.(TEXT_OK, { group, track: newTrack })
            setTrack(newTrack)
          }}
        />
        <SwitchPropRow
          title="Stroke"
          checked={_track.displayOptions.stroke.show}
          onCheckedChange={(state) => {
            const newTrack = produce(_track, (draft) => {
              draft.displayOptions.stroke.show = state
            })

            onResponse?.(TEXT_OK, { group, track: newTrack })
            setTrack(newTrack)
          }}
        >
          <VCenterRow className="gap-x-2">
            <Label htmlFor="line1-stroke-width">Width</Label>
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

                onResponse?.(TEXT_OK, { group, track: newTrack })
                setTrack(newTrack)
              }}
            />
          </VCenterRow>
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
            disabled={!_track.displayOptions.stroke.show}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Stroke color"
          />
        </SwitchPropRow>
        <SwitchPropRow
          title="Fill"
          checked={_track.displayOptions.fill.show}
          onCheckedChange={(state) => {
            const newTrack = produce(_track, (draft) => {
              draft.displayOptions.fill.show = state
            })

            onResponse?.(TEXT_OK, { group, track: newTrack })
            setTrack(newTrack)
          }}
        >
          <ColorPickerButton
            colors={[
              {
                color: _track.displayOptions.fill.value,
                opacity: _track.displayOptions.fill.opacity,
                onColorChange: ({ color, opacity }) => {
                  const newTrack = produce(_track, (draft) => {
                    draft.displayOptions.fill.value = color
                    draft.displayOptions.fill.opacity =
                      opacity ?? draft.displayOptions.fill.opacity
                  })

                  onResponse?.(TEXT_OK, { group, track: newTrack })
                  setTrack(newTrack)
                },
              },
            ]}
            disabled={!_track.displayOptions.fill.show}
            className={SIMPLE_COLOR_EXT_CLS}
            title="Fill color"
          />
        </SwitchPropRow>
        <SwitchPropRow
          title="Global Y"
          checked={_track.displayOptions.useGlobalY}
          onCheckedChange={(v) => {
            const newTrack = produce(_track, (draft) => {
              draft.displayOptions.useGlobalY = v
            })

            onResponse?.(TEXT_OK, { group, track: newTrack })
            setTrack(newTrack)
          }}
        >
          <Checkbox
            disabled={!_track.displayOptions.useGlobalY}
            checked={_track.displayOptions.autoY}
            onCheckedChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.autoY = v
              })

              onResponse?.(TEXT_OK, { group, track: newTrack })
              setTrack(newTrack)
            }}
          >
            Auto
          </Checkbox>

          <NumericalInput
            value={_track.displayOptions.ymax}
            disabled={
              !_track.displayOptions.useGlobalY || _track.displayOptions.autoY
            }
            placeholder="ymax"
            limit={[1, 1000]}
            onNumChange={(v) => {
              const newTrack = produce(_track, (draft) => {
                draft.displayOptions.ymax = v
              })

              onResponse?.(TEXT_OK, { group, track: newTrack })
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

            onResponse?.(TEXT_OK, { group, track: newTrack })
            setTrack(newTrack)
          }}
        />
      </BaseCol>
      {/* </BaseCol> */}
    </OKCancelDialog>
  )
}
