import { PropRow } from '@/components/prop-row'
import { NumericalInput } from '@/components/shadcn/ui/themed/numerical-input'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@components/dialog/ok-cancel-dialog'
import { produce } from 'immer'
import { useState } from 'react'
import type { ICytobandsTrack, ITrackGroup } from '../tracks-provider'

export interface IProps {
  group: ITrackGroup
  track: ICytobandsTrack
  callback?: (group: ITrackGroup, track: ICytobandsTrack) => void

  onCancel: () => void
}

export function CytobandsEditDialog({
  group,
  track,
  callback,
  onCancel,
}: IProps) {
  const [_track, setTrack] = useState(track)

  return (
    <OKCancelDialog
      buttons={[TEXT_OK]}
      title={_track.name}
      onReponse={() => {
        onCancel()
      }}
    >
      {/* <PropRow title="Style">
        <Select
          value={_track.displayOptions.style}
          onValueChange={v => {
            const newTrack = produce(_track, draft => {
              draft.displayOptions.style = v as CytobandStyle
            })

            callback?.(group, newTrack)
            setTrack(newTrack)
          }}
        >
          <SelectTrigger className="w-28">
            <SelectValue placeholder="Choose title position" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rounded-theme">Rounded</SelectItem>
            <SelectItem value="Square">Square</SelectItem>
          </SelectContent>
        </Select>
      </PropRow> */}

      <PropRow title="Height">
        <NumericalInput
          value={_track.displayOptions.height}
          placeholder="height"
          limit={[1, 1000]}
          onNumChange={v => {
            const newTrack = produce(_track, draft => {
              draft.displayOptions.height = v
            })

            callback?.(group, newTrack)
            setTrack(newTrack)
          }}
          className="w-16 rounded-theme"
        />
      </PropRow>

      {/* <SwitchPropRow
        title="Labels"
        checked={_track.displayOptions.labels.show}
        onCheckedChange={v => {
          const newTrack = produce(_track, draft => {
            draft.displayOptions.labels.show = v
          })

          callback?.(group, newTrack)
          setTrack(newTrack)
        }}
      >
        <SwitchPropRow
          title="Reduce labels"
          disabled={!_track.displayOptions.labels.show}
          checked={_track.displayOptions.labels.skip.on}
          onCheckedChange={v => {
            const newTrack = produce(_track, draft => {
              draft.displayOptions.labels.skip.on = v
            })

            callback?.(group, newTrack)
            setTrack(newTrack)
          }}
        >
          <BasicHoverCard>
            Reduces the number of labels shown to make figures look less
            clustered.
          </BasicHoverCard>
        </SwitchPropRow>
      </SwitchPropRow> */}
    </OKCancelDialog>
  )
}
