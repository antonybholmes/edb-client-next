import { LabelContainer } from '@/components/shadcn/ui/themed/v2/label'
import { TEXT_OK } from '@/consts'
import { OKCancelDialog } from '@/dialogs/ok-cancel-dialog'
import { locStr } from '@/lib/genomic/genomic'
import { IGenomicLocation } from '@/lib/genomic/genomic-location'
import { useState } from 'react'
import { LocationAutocomplete } from '../location-autocomplete'

export interface IProps {
  index: number
  location: IGenomicLocation
  callback?: (index: number, location: string) => void
  onCancel: () => void
}

export function LocationDialog({
  index,
  location,
  callback,
  onCancel,
}: IProps) {
  const [text, setText] = useState(locStr(location))

  return (
    <OKCancelDialog
      title="New Location"
      onResponse={(e) => {
        if (e === TEXT_OK) {
          callback?.(index, text)
        } else {
          onCancel()
        }
      }}
    >
      <LabelContainer label="Location or gene">
        <LocationAutocomplete
          id="location"
          value={text}
          placeholder="Location or gene"
          onTextChange={(v) => setText(v)}
        />
      </LabelContainer>

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
